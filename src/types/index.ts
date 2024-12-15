export interface AudioValues {
  bass: number;
  mid: number;
  high: number;
  energy: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface ColorPalette {
  palette1: RGBColor[];
  palette2: RGBColor[];
}

export interface Config {
  stringCount: number;
  backgroundColor: string;
}

export interface FlowingStringVisualizerProps {
  dimensions: Dimensions;
  isPlaying: boolean;
  updateAudioValues: () => AudioValues;
} 