import React, { useEffect, useRef, useState } from 'react';

interface TextureProps {
  width: number;
  height: number;
  onTextureReady: (textureImage: HTMLImageElement) => void;
}

const Texture: React.FC<TextureProps> = ({ width, height, onTextureReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Create a simple noise texture
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 50; // Adjust for intensity
      data[i] = noise;     // Red
      data[i + 1] = noise; // Green
      data[i + 2] = noise; // Blue
      data[i + 3] = 230;   // Alpha (fully opaque)
    }
    ctx.putImageData(imageData, 0, 0);

    // Add a subtle gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)'); // Adjust for intensity
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Convert canvas to an image and pass it to the parent component
    const textureImage = new Image();
    textureImage.onload = () => onTextureReady(textureImage);
    textureImage.src = canvas.toDataURL();

  }, [width, height, onTextureReady]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default Texture;