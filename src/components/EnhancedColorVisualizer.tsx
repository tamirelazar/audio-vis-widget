import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useWindowSize, useAudioAnalysis } from '../hooks';
import FlowingStringVisualizer from './FlowingStringVisualizer';
import { AudioValues, Dimensions } from '../types';

interface FlowingStringVisualizerProps {
  audioValues: AudioValues;
  dimensions: Dimensions;
  isPlaying: boolean;
  updateAudioValues: () => void;
}

const EnhancedColorVisualizer: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const dimensions = useWindowSize();

  const { audioValues, isPlaying, updateAudioValues, togglePlay } = useAudioAnalysis(audioFile);

  return (
    <div className="fixed inset-0 bg-transparent">
      <FlowingStringVisualizer
        audioValues={audioValues}
        dimensions={dimensions}
        isPlaying={isPlaying}
        updateAudioValues={updateAudioValues}
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
          onClick={togglePlay}
          className="px-4 py-2 text-sm font-medium text-white bg-black/50 backdrop-blur-sm rounded-md hover:bg-black/70"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default EnhancedColorVisualizer; 