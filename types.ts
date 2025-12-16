export interface Photo {
  id: string;
  url: string;
  tag: string; // Creates the link to Category ID or Name
  timestamp: number;
}

export interface Category {
  id: string;
  name: string;
  coverImage?: string; // Custom cover image for the folder
  isDefault?: boolean; // For "Unsorted"
}

export interface PhotoTransform {
  scale: number;
  rotate: number;
  x: number;
  y: number;
}

export type FilterType = 'none' | 'grayscale' | 'vintage' | 'vibrant' | 'dreamy';
