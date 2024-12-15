import React, { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const EnhancedColorVisualizer = () => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioSourceRef = useRef(null);
  const timeRef = useRef(0);
  const startTimeRef = useRef(null);
  const rotationRef = useRef(0);
  const hasStartedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const fileInputRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const colors = {
    primary: { r: 218, g: 165, b: 32 },
    secondary: { r: 89, g: 195, b: 209 },
    accent: { r: 147, g: 112, b: 219 },
    highlight: { r: 255, g: 215, b: 0 }
  };

  const lerp = (start, end, t) => start * (1 - t) + end * t;
  const rgba = (color, alpha) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

  // Audio handling code remains the same...
  const getAudioValues = () => {
    if (!analyserRef.current) {
      const time = Date.now();
      return {
        bass: Math.sin(time * 0.001) * 0.5 + 0.5,
        mid: Math.sin(time * 0.002) * 0.5 + 0.5,
        high: Math.sin(time * 0.003) * 0.5 + 0.5,
        energy: Math.sin(time * 0.0005) * 0.5 + 0.5
      };
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const bass = average(dataArray.slice(0, 10)) / 255;
    const mid = average(dataArray.slice(10, 100)) / 255;
    const high = average(dataArray.slice(100, 200)) / 255;
    const energy = average(dataArray) / 255;

    return { bass, mid, high, energy };
  };

  const average = (array) => array.reduce((a, b) => a + b, 0) / array.length;

  // Updated resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas setup with dimensions
  useEffect(() => {
    if (canvasRef.current) {
      const pixelRatio = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;
      canvas.width = dimensions.width * pixelRatio;
      canvas.height = dimensions.height * pixelRatio;
      canvas.style.width = `${dimensions.width}px`;
      canvas.style.height = `${dimensions.height}px`;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(pixelRatio, pixelRatio);
    }
  }, [dimensions]);

  // Animation code
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    class FlowingString {
      constructor(index, total) {
        this.index = index;
        this.total = total;
        this.reset();
      }

      reset() {
        const bandHeight = dimensions.height * 0.4; // 40% of screen height
        const bandY = dimensions.height / 2 - bandHeight / 2;
        
        // Distribute strings evenly within the band
        this.baseY = bandY + (bandHeight * (this.index / this.total));
        this.y = this.baseY;
        
        this.amplitude = 20;
        this.frequency = 0.002;
        this.speed = 0.5;
        this.phase = (Math.PI * 2 * this.index) / this.total;
        this.color = Math.random() < 0.5 ? colors.primary : colors.secondary;
        this.alpha = 0.15;
      }

      update(audioValues, time) {
        // Base wave motion
        const t = time * 0.001;
        const baseWave = Math.sin(t * this.speed + this.phase) * 20;
        
        // Audio influence
        const audioOffset = (audioValues.mid - 0.5) * 15;
        
        // Smooth movement
        this.y = lerp(this.y, this.baseY + baseWave + audioOffset, 0.1);
        
        // Update phase for horizontal movement
        this.phase += 0.002;
      }

      draw(ctx, audioValues, time) {
        ctx.beginPath();
        ctx.strokeStyle = rgba(this.color, this.alpha);
        ctx.lineWidth = 2;

        const steps = Math.ceil(dimensions.width);
        for (let x = 0; x < steps; x++) {
          const xProgress = x / steps;
          
          // Combine multiple waves for interesting motion
          const wave1 = Math.sin(xProgress * 10 + this.phase + time * 0.001) * this.amplitude;
          const wave2 = Math.sin(xProgress * 5 - this.phase * 0.5 + time * 0.0005) * (this.amplitude * 0.5);
          
          // Add subtle audio reaction
          const audioWave = audioValues.mid * 10 * Math.sin(xProgress * 20 + time * 0.002);
          
          const y = this.y + wave1 + wave2 + audioWave;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x * (dimensions.width / steps), y);
          }
        }
        
        ctx.stroke();
      }
    }

    const stringCount = 12;
    const strings = Array(stringCount).fill().map((_, i) => new FlowingString(i, stringCount - 1));

    const animate = () => {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      const currentTime = Date.now() - startTimeRef.current;
      
      const audioValues = getAudioValues();
      
      // Clear canvas
      ctx.fillStyle = 'rgb(13, 17, 23)';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // Update and draw strings
      strings.forEach(string => {
        string.update(audioValues, currentTime);
        string.draw(ctx, audioValues, currentTime);
      });
      
      animationId = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      if (audioContextRef.current) {
        audioContextRef.current.resume();
      }
      animate();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, dimensions]);

  return (
    <div className="fixed inset-0 bg-transparent">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setAudioFile(file);
          }}
          accept="audio/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium text-white bg-black/50 backdrop-blur-sm rounded-md hover:bg-black/70 flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Audio
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 text-sm font-medium text-white bg-black/50 backdrop-blur-sm rounded-md hover:bg-black/70"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default EnhancedColorVisualizer;