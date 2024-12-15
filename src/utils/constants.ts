import { RGBColor, ColorPalette, Config } from '../types';

export const colors: ColorPalette = {
  palette1: [
    { r: 168, g: 125, b: 89 },  // Warm sienna brown - anchoring earth tone
    { r: 196, g: 164, b: 132 }, // Soft taupe - transitional neutral
    { r: 131, g: 148, b: 111 }, // Sage green - natural element
    { r: 147, g: 111, b: 73 }   // Deep clay brown - grounding accent
  ],
  palette2: [
    { r: 255, g: 105, b: 180 }, // Hot Pink
    { r: 0, g: 255, b: 255 },   // Cyan
    { r: 255, g: 255, b: 0 },   // Yellow
    { r: 0, g: 128, b: 0 }      // Green
  ]
};

export const config: Config = {
  stringCount: 15,
  backgroundColor: 'rgb(13, 17, 23)',
}; 