import React, { useRef, useEffect, useState } from "react";
import { lerp, rgba } from "../utils/math";
import { colors, config } from "../utils/constants";
import Texture from "../utils/texture"; // Import the Texture component

type Dimensions = {
  width: number;
  height: number;
};

type AudioValues = {
  bass: number;
  mid: number;
  high: number;
  energy: number;
};

type Color = {
  r: number;
  g: number;
  b: number;
};

type ColorPalette = Color[];

interface FlowingStringVisualizerProps {
  audioValues: AudioValues;
  dimensions: Dimensions;
  isPlaying: boolean;
  updateAudioValues: () => void;
}

const FlowingStringVisualizer: React.FC<FlowingStringVisualizerProps> = ({
  audioValues,
  dimensions,
  isPlaying,
  updateAudioValues,
}) => {
  const [colorPalette, setColorPalette] = useState<ColorPalette>(
    colors.palette1
  );
  const [texture, setTexture] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const ORB_COUNT = 50;

  // Update color palette based on audio energy (example)
  useEffect(() => {
    if (audioValues.energy > 0.7) {
      setColorPalette(colors.palette2);
    } else {
      setColorPalette(colors.palette1);
    }
  }, [audioValues.energy]);

  class FlowingString {
    index: number;
    total: number;
    baseY: number;
    y: number;
    amplitude: number;
    frequency: number;
    speed: number;
    phase: number;
    baseColor: Color;
    targetColor: Color;
    color: Color;
    alpha: number;
    colorPalette: ColorPalette;

    constructor(index: number, total: number, colorPalette: ColorPalette) {
      this.index = index;
      this.total = total;
      this.colorPalette = colorPalette;
      this.reset();
    }

    reset() {
      const bandHeight = dimensions.height * 0.4;
      const bandY = dimensions.height / 2 - bandHeight / 2;

      this.baseY = bandY + bandHeight * (this.index / this.total);
      this.y = this.baseY;
      this.amplitude = 20;
      this.frequency = 0.002;
      this.speed = 0.5;
      this.phase = (Math.PI * 2 * this.index) / this.total;

      // Dynamic color assignment using ColorPalette type
      this.baseColor = this.colorPalette[this.index % this.colorPalette.length];
      this.targetColor = this.colorPalette[
        (this.index + 1) % this.colorPalette.length
      ];
      this.alpha = 0.15;
    }

    update(audioValues: AudioValues, time: number) {
      const t = time * 0.001;
      const baseWave = Math.sin(t * this.speed + this.phase) * 20;
      const audioOffset = (audioValues.mid - 0.5) * 15;

      this.y = lerp(this.y, this.baseY + baseWave + audioOffset, 0.1);
      this.phase += 0.002;

      const energyFactor = audioValues.energy;
      this.color = {
        r: Math.floor(lerp(this.baseColor.r, this.targetColor.r, energyFactor)),
        g: Math.floor(lerp(this.baseColor.g, this.targetColor.g, energyFactor)),
        b: Math.floor(lerp(this.baseColor.b, this.targetColor.b, energyFactor)),
      };
    }

    draw(
      ctx: CanvasRenderingContext2D,
      audioValues: AudioValues,
      time: number
    ) {
      ctx.beginPath();
      ctx.strokeStyle = rgba(this.color, this.alpha);
      ctx.lineWidth = 2;

      const steps = Math.ceil(dimensions.width);
      const stepWidth = dimensions.width / steps;

      const basePhase = this.phase + time * 0.001;

      for (let x = 0; x < steps; x++) {
        const xProgress = x / steps;

        const mainWave = Math.sin(xProgress * 10 + basePhase);
        const wave1 = mainWave * this.amplitude;
        const wave2 =
          Math.sin(xProgress * 5 - basePhase * 0.5) * (this.amplitude * 0.5);
        const audioWave =
          audioValues.mid * 10 * Math.sin(xProgress * 20 + basePhase * 2);

        const y = this.y + wave1 + wave2 + audioWave;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x * stepWidth, y);
        }
      }

      ctx.stroke();
    }
  }

  class Orb {
    x: number;
    y: number;
    radius: number;
    color: string;
    minFrequency: number;
    maxFrequency: number;
    intensity: number; // Add intensity property
    vx: number;
    vy: number;

    constructor(
      x: number,
      y: number,
      radius: number,
      color: string,
      minFrequency: number,
      maxFrequency: number,
      ctx: CanvasRenderingContext2D
    ) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5);
      this.vy = (Math.random() - 0.5);
      this.radius = radius;
      this.color = color;
      this.minFrequency = minFrequency;
      this.maxFrequency = maxFrequency;
      this.intensity = 0; // Initialize intensity

      this.draw(ctx, 0); // Initial draw
    }

    update(audioValues: AudioValues) {
      // Reactivity based on audio frequency
      const newIntensity = this.getFrequencyValue(audioValues);
      this.intensity = lerp(this.intensity, newIntensity, 0.1); // Smooth intensity change with lerp

            // Update position (keep within bounds)
      this.x += this.vx;
      this.y += this.vy;

      if (this.x + this.radius > dimensions.width || this.x - this.radius < 0) {
        this.vx = -this.vx;
      }
      if (this.y + this.radius > dimensions.height || this.y - this.radius < 0) {
        this.vy = -this.vy;
      }
      // No more bouncing/movement logic:
      // Orbs will remain in their initial positions.
    }

    draw(ctx: CanvasRenderingContext2D, intensity: number) {
      ctx.beginPath();

      // More pronounced glow based on intensity
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.radius + this.intensity * 30 // Increased intensity effect
      );
      gradient.addColorStop(0, `rgba(${this.color}, ${0.25 + this.intensity})`); // More opaque center
      gradient.addColorStop(
        0.6,
        `rgba(${this.color}, ${0.1 + this.intensity * 0.4})`
      );
      gradient.addColorStop(1, `rgba(${this.color}, 0)`);

      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    getFrequencyValue(audioValues: AudioValues): number {
      // More pronounced reactivity:
      if (this.minFrequency === 0 && this.maxFrequency === 5) {
        return audioValues.bass * 2; // Amplify bass effect
      } else if (this.minFrequency === 5 && this.maxFrequency === 55) {
        return audioValues.mid * 1.5; // Amplify mid effect
      } else if (this.minFrequency === 55 && this.maxFrequency === 100) {
        return audioValues.high;
      }
      return audioValues.energy; // Use overall energy
    }
  }

  const initializeOrbs = (
    ctx: CanvasRenderingContext2D,
    colorPalette: ColorPalette
  ) => {
    const orbs: Orb[] = [];
    const frequencyRanges = [
      { min: 0, max: 5 }, // Bass
      { min: 5, max: 55 }, // Mid
      { min: 55, max: 100 }, // High
    ];
    for (let i = 0; i < ORB_COUNT; i++) {
      const radius = Math.random() * 20 + 10;
      const x = dimensions.width * 0.25 + Math.random() * dimensions.width * 0.5;
      const y = dimensions.height * 0.25 + Math.random() * dimensions.height * 0.5;
      const color = colorPalette[i % colorPalette.length];
      const { min, max } = frequencyRanges[i % frequencyRanges.length];
      orbs.push(
        new Orb(
          x,
          y,
          radius,
          `${color.r}, ${color.g}, ${color.b}`,
          min,
          max,
          ctx
        )
      );
    }
    return orbs;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * pixelRatio;
    canvas.height = dimensions.height * pixelRatio;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    ctx.scale(pixelRatio, pixelRatio);

    // Initialize orbs when the component mounts
    const newOrbs = initializeOrbs(ctx, colorPalette);
    setOrbs(newOrbs);
  }, [dimensions, colorPalette]); // Removed isPlaying dependency

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !orbs.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    let animationId: number | null = null;
  
    const stringCount = config.stringCount;
    const strings = Array(stringCount)
      .fill(null)
      .map((_, i) => new FlowingString(i, stringCount - 1, colorPalette));
  
    const draw = (elapsed: number) => {
      if (!isPlaying) return;
      updateAudioValues();
      const currentTime = elapsed;
  
      // Clear the entire canvas
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  
      // Draw orbs behind the strings
      orbs.forEach((orb) => {
        orb.update(audioValues);
        orb.draw(ctx, orb.intensity);
      });

      // Draw the texture if available
      if (texture) {
        ctx.drawImage(texture, 0, 0, dimensions.width, dimensions.height);
      }
  
      // Draw strings on top of orbs
      strings.forEach((string) => {
        string.update(audioValues, currentTime);
        string.draw(ctx, audioValues, currentTime);
      });
  
      animationId = requestAnimationFrame(draw);
    };
  
    if (isPlaying) {
      draw(0);
    }
  
    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, dimensions, colorPalette, updateAudioValues, orbs]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
       {/* START OF CHANGE: Added onTextureReady prop to Texture Component */}
      <Texture
        width={dimensions.width}
        height={dimensions.height}
        onTextureReady={setTexture}
      />
      {/* END OF CHANGE */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default FlowingStringVisualizer;