export interface Subsystem {
  id: string;
  key: string;
  name: string;
  mass: string;
  desc: string;
  volt: string;
  spec: string;
  temp: string;
  discoveryLink: {
    instrument: string;
    scienceFinding: string;
    significance: string;
  };
  camPos: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  explodeDelta: [number, number, number];
}
