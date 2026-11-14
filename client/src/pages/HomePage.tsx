import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/ui/Navigation';

interface HomePageProps {
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ isAudioPlaying, onToggleAudio }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col justify-between bg-oppy-bg select-none">
      
      {/* 16:9 Master Martian Surface Rover Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[position:right_center] transition-transform duration-1000 scale-100"
        style={{
          backgroundImage: "url('/textures/oppy_hero_mars.jpg?v=3')"
        }}
      />
      
      {/* Cinematic Dark Gradient Mask */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          background: 'linear-gradient(to right, rgba(16, 17, 19, 0.95) 0%, rgba(16, 17, 19, 0.85) 30%, rgba(16, 17, 19, 0.35) 46%, transparent 60%)'
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-oppy-bg via-transparent to-oppy-bg/70 pointer-events-none" />

      {/* CRT Scanlines Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: 'linear-gradient(rgba(16, 17, 19, 0) 50%, rgba(0, 0, 0, 0.22) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* Navigation Header */}
      <Navigation isAudioPlaying={isAudioPlaying} onToggleAudio={onToggleAudio} />

      {/* Main Hero Showcase */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-start px-6 sm:px-16 lg:px-24 max-w-4xl py-12">
        
        {/* Rover Classification Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-oppy-card/90 border border-oppy-border/80 text-[10px] font-mono text-oppy-textSecondary uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-oppy-textSecondary" />
          <span>NASA MARS EXPLORATION ROVER · 2004–2018</span>
        </div>

        {/* Display Title */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white uppercase font-sans mb-6 leading-[0.92]">
          OPPY'S<br />
          LAST DANCE
        </h1>

        {/* Description Paragraph */}
        <p className="text-sm sm:text-base text-oppy-textSecondary font-sans leading-relaxed max-w-lg mb-10">
          Designed to last 90 days. It explored Mars for nearly 15 years. This is the story of the little rover that changed how humanity sees the Red Planet.
        </p>

        {/* The Exactly Two Primary Options */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto font-mono text-xs">
          
          <Link
            to="/experience"
            className="px-6 py-3.5 rounded bg-white text-black font-bold tracking-wider uppercase hover:bg-oppy-accent hover:text-black transition-all flex items-center space-x-3.5 shadow-2xl group text-left"
          >
            <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="leading-tight text-[11px] font-mono">
              WATCH THE<br />
              <span className="font-bold text-xs tracking-wider">EXPERIENCE</span>
            </span>
          </Link>

          <Link
            to="/hardware"
            className="px-6 py-3.5 rounded border border-oppy-border bg-oppy-card/80 backdrop-blur-sm text-white font-bold tracking-wider uppercase hover:border-oppy-accent hover:bg-oppy-surface transition-all flex items-center space-x-3.5 text-left group"
          >
            <svg className="w-4 h-4 text-oppy-accent shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span className="leading-tight text-[11px] font-mono text-oppy-textSecondary group-hover:text-white">
              UNDERSTAND THE<br />
              <span className="font-bold text-xs text-white tracking-wider">HARDWARE</span>
            </span>
          </Link>

        </div>

      </main>

      {/* Telemetry Watermark */}
      <div className="absolute bottom-5 right-6 sm:right-10 text-[10px] font-mono text-oppy-textMuted tracking-widest uppercase opacity-70 pointer-events-none">
        PERSEVERANCE VALLEY · ELEVATION: -142m · MER-B
      </div>

    </div>
  );
};
