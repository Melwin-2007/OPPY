import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/ui/Navigation';
import { Compass, Cpu } from 'lucide-react';

interface HomePageProps {
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ isAudioPlaying, onToggleAudio }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-oppy-bg overflow-hidden">
      
      {/* Background Cinematic Artwork & Vignette */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=2000&q=80')"
        }}
      />
      <div className="absolute inset-0 z-0 cinematic-vignette" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-oppy-bg via-transparent to-oppy-bg/80" />

      {/* Navigation Header */}
      <Navigation isAudioPlaying={isAudioPlaying} onToggleAudio={onToggleAudio} />

      {/* Main Hero Showcase */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-start px-6 sm:px-16 lg:px-24 max-w-5xl py-20">
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-oppy-surface/80 border border-oppy-border/80 text-[11px] font-mono text-oppy-textSecondary mb-6">
          <span className="w-2 h-2 rounded-full bg-oppy-accent" />
          <span>NASA MARS EXPLORATION ROVER · MER-B · 2003–2019</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white uppercase font-sans mb-6 leading-none">
          OPPY'S<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-oppy-textPrimary to-oppy-textSecondary">
            LAST DANCE
          </span>
        </h1>

        <p className="text-base sm:text-lg text-oppy-textSecondary font-sans leading-relaxed max-w-xl mb-10">
          Designed to last 90 days. It explored Mars for nearly 15 years. This is the story of the little rover that changed how humanity sees the Red Planet.
        </p>

        {/* The Exactly Two Primary Options */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto font-mono text-xs">
          
          <Link
            to="/experience"
            className="px-8 py-4 rounded-md bg-white text-black font-semibold tracking-wider uppercase hover:bg-oppy-accent hover:text-black transition-all flex items-center justify-center space-x-2 shadow-2xl group"
          >
            <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
            <span>WATCH THE EXPERIENCE</span>
          </Link>

          <Link
            to="/hardware"
            className="px-8 py-4 rounded-md border border-oppy-border bg-oppy-surface/90 text-white font-semibold tracking-wider uppercase hover:border-oppy-accent hover:bg-oppy-surface transition-all flex items-center justify-center space-x-2"
          >
            <Cpu className="w-4 h-4 text-oppy-accent" />
            <span>UNDERSTAND THE HARDWARE</span>
          </Link>

        </div>

      </main>

      {/* Minimalist Telemetry Footer HUD */}
      <footer className="relative z-10 px-6 sm:px-16 py-4 border-t border-oppy-border/30 bg-oppy-bg/60 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-oppy-textMuted">
        <div className="flex items-center space-x-6">
          <span>MISSION: MER-B OPPORTUNITY</span>
          <span className="hidden sm:inline">LAUNCH: JUL 7, 2003</span>
          <span className="hidden md:inline">LANDING: JAN 25, 2004</span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-white">TOTAL DISTANCE: 45.16 KM</span>
          <span className="text-oppy-accent">FINAL REST: PERSEVERANCE VALLEY</span>
        </div>
      </footer>

    </div>
  );
};
