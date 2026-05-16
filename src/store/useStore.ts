import { create } from 'zustand';

export interface Preset {
  id: string;
  name: string;
  resolution: string;
  fps: number;
  duration: number;
  format: string;
  background: string;
}

export interface RenderJob {
  id: string;
  filename: string;
  svgCode: string;
  status: 'Waiting' | 'Processing' | 'Completed' | 'Failed';
  error?: string;
  duration: number;
  resolution: string;
  fps: number;
  format: string;
  progress: number;
  fileUrl?: string;
}

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  svgCode: string;
  setSvgCode: (code: string) => void;

  duration: number;
  setDuration: (duration: number) => void;

  fps: number;
  setFps: (fps: number) => void;

  resolution: string;
  setResolution: (res: string) => void;

  background: string;
  setBackground: (bg: string) => void;

  format: string;
  setFormat: (format: string) => void;

  bulkJobs: RenderJob[];
  addBulkJobs: (jobs: RenderJob[]) => void;
  updateBulkJob: (id: string, data: Partial<RenderJob>) => void;
  clearBulkJobs: () => void;

  presets: Preset[];
  addPreset: (preset: Preset) => void;
  deletePreset: (id: string) => void;
  applyPreset: (preset: Preset) => void;

  renderHistory: RenderJob[];
  addToHistory: (job: RenderJob) => void;
  clearHistory: () => void;
  
  isProcessingQueue: boolean;
  setIsProcessingQueue: (val: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  activeTab: 'SVG Editor',
  setActiveTab: (tab) => set({ activeTab: tab }),

  svgCode: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="white" stroke-width="3" fill="none" /></svg>',
  setSvgCode: (code) => set({ svgCode: code }),

  duration: 6,
  setDuration: (duration) => set({ duration }),

  fps: 30,
  setFps: (fps) => set({ fps }),

  resolution: '4K',
  setResolution: (res) => set({ resolution: res }),

  background: 'Black',
  setBackground: (bg) => set({ background: bg }),

  format: 'MP4',
  setFormat: (format) => set({ format }),

  bulkJobs: [],
  addBulkJobs: (jobs) => set((state) => ({ bulkJobs: [...state.bulkJobs, ...jobs] })),
  updateBulkJob: (id, data) => set((state) => ({
    bulkJobs: state.bulkJobs.map(job => job.id === id ? { ...job, ...data } : job)
  })),
  clearBulkJobs: () => set({ bulkJobs: [] }),

  presets: [
    { id: '1', name: 'Microstock Standard (Recommended)', resolution: '4K', fps: 30, duration: 6, format: 'MP4', background: 'Transparent' },
    { id: '2', name: 'Microstock Premium', resolution: '4K', fps: 60, duration: 6, format: 'MOV (Alpha)', background: 'Transparent' },
    { id: '3', name: 'Fast Preview', resolution: '1080p', fps: 24, duration: 6, format: 'MP4', background: 'Black' },
    { id: '4', name: 'YouTube Motion Graphics', resolution: '4K', fps: 60, duration: 6, format: 'MP4', background: 'Black' },
  ],
  addPreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
  deletePreset: (id) => set((state) => ({ presets: state.presets.filter(p => p.id !== id) })),
  applyPreset: (p) => set({ resolution: p.resolution, fps: p.fps, duration: p.duration, format: p.format, background: p.background }),

  renderHistory: [],
  addToHistory: (job) => set((state) => ({ renderHistory: [job, ...state.renderHistory] })),
  clearHistory: () => set({ renderHistory: [] }),
  
  isProcessingQueue: false,
  setIsProcessingQueue: (val) => set({ isProcessingQueue: val }),
}));
