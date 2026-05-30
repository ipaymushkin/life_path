/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface RecommendedJob {
  name: string;
  salary: string;
  demand: string;
  fit: number;
  info: string;
}

export interface AnalysisResponse {
  rawAnalysis: string;
  recommendedJobs: RecommendedJob[];
  error?: string;
}

export interface TestContext {
  userType: 'graduate' | 'changer';
  currentStatus: string;
  concerns: string;
}

export interface Question {
  id: number;
  text: string;
  scale: string;
  options?: { text: string; value: number }[]; // For specialized questions
}

export interface CattellScores {
  [key: string]: number; // A, B, C, E, etc.
}

export interface EysenckScores {
  extraversion: number;
  neuroticism: number;
  lie: number;
  personalityType: string;
}

export interface AkhrarovaScores {
  [key: string]: number; // Technical, Scientific, Arts, Communication, etc.
}
