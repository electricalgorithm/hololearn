export enum HolographyMode {
  INLINE = 'INLINE',
  OFFAXIS = 'OFFAXIS',
}

export interface SimulationParams {
  wavelength: number; // in pixels
  referenceAngle: number; // in degrees
  objectDistance: number; // distance from plate
  intensity: number; // laser intensity
  objectOpacity: number; // 0 to 1 (1 = fully opaque/scattering)
  objectPhase: number; // 0 to 2PI (phase shift introduced by object)
  isPlaying: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

export enum Tab {
  SIMULATION = 'SIMULATION',
  RECONSTRUCTION = 'RECONSTRUCTION',
  THEORY = 'THEORY',
  TUTOR = 'TUTOR',
}