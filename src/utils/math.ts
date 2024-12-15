import { RGBColor } from '../types';

export const lerp = (start: number, end: number, t: number): number => 
  start * (1 - t) + end * t;

export const rgba = (color: RGBColor, alpha: number): string => 
  `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`; 

export const average = (array: number[]): number => 
  array.reduce((a, b) => a + b, 0) / array.length;