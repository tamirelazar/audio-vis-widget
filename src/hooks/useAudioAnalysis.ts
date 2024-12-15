import { useState, useEffect, useRef } from 'react';
import { average, lerp } from '../utils/math';
import { AudioValues } from '../types';

interface UseAudioAnalysisReturn {
  audioValues: AudioValues;
  isPlaying: boolean;
  updateAudioValues: () => void;
  togglePlay: () => void;
}

export const useAudioAnalysis = (audioFile: File | null): UseAudioAnalysisReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  const [audioValues, setAudioValues] = useState<AudioValues>({
    bass: 0,
    mid: 0,
    high: 0,
    energy: 0
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const togglePlay = () => {
    if (!audioContextRef.current) return;

    if (isPlayingRef.current) {
      audioContextRef.current.suspend();
      setIsPlaying(false);
    } else {
      audioContextRef.current.resume();
      setIsPlaying(true);
    }
    isPlayingRef.current = !isPlayingRef.current;
  };

  useEffect(() => {
    if (audioFile) {
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 2048;

          audioSourceRef.current = audioContextRef.current.createBufferSource();
          audioSourceRef.current.buffer = audioBuffer;
          audioSourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);

          audioSourceRef.current.start();
          audioContextRef.current.suspend();
          setIsPlaying(false);

        } catch (error) {
          console.error('Error decoding audio data:', error);
          alert('Error decoding audio. Please try a different file.');
        }
      };

      fileReader.onerror = (error) => {
        console.error('Error reading audio file:', error);
        alert('Error reading audio file. Please try again.');
      };

      fileReader.readAsArrayBuffer(audioFile);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioFile]);

  const updateAudioValues = () => {
    if (!analyserRef.current) {
      const time = Date.now();
      return {
        bass: Math.sin(time * 0.001) * 0.5 + 0.5,
        mid: Math.sin(time * 0.002) * 0.5 + 0.5,
        high: Math.sin(time * 0.003) * 0.5 + 0.5,
        energy: Math.sin(time * 0.0005) * 0.5 + 0.5,
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

  return { audioValues, isPlaying, updateAudioValues, togglePlay };
}; 