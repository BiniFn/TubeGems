export interface VideoMetadata {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  version: string;
  provider_name: string;
  provider_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
  url: string;
  description?: string; // Added for AI context
}

export interface VideoFormat {
  quality: string;
  format: string;
  size: string;
  hasAudio: boolean;
}

export enum AnalysisState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AiAnalysisResult {
  summary: string;
  topics: string[];
  suggestedQuestions: string[];
}