export interface Discovery {
  title: string;
  description: string;
  instrument: string;
  nasaPhotoUrl?: string;
}

export interface EnvironmentSettings {
  modelFile: string;
  atmosphereColor: [number, number, number];
  dustOpacity: number;
  sunIntensity: number;
}

export interface CameraTarget {
  camPos: [number, number, number];
  lookAt: [number, number, number];
}

export interface MissionPhase {
  id: number;
  slug: string;
  phaseNumber: string;
  title: string;
  period: string;
  solRange: [number, number];
  odometerKm: number;
  headline: string;
  narrativeText: string;
  scienceObjectives: string[];
  discoveries: Discovery[];
  environment: EnvironmentSettings;
  cameraTarget: CameraTarget;
}
