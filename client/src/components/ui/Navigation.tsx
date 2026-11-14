import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Compass, Cpu, Home } from 'lucide-react';

interface NavigationProps {
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isAudioPlaying, onToggleAudio }) => {
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isExp = location.pathname === '/experience';
  const isHw = location.pathname === '/hardware';

  return (
    <header className="absolute top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between border-b border-oppy-border/40 bg-oppy-bg/75 backdrop-blur-md font-mono text-xs">
      <Link to="/" className="flex items-center space-x-2.5 text-white hover:text-oppy-accent transition-colors">
        <span className="w-2.5 h-2.5 rounded-full bg-oppy-accent animate-pulse" />
        <span className="font-bold tracking-wider text-sm font-sans">OPPY'S LAST DANCE</span>
        <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-oppy-surface text-oppy-textMuted border border-oppy-border/60">
          NASA MER-B
        </span>
      </Link>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {!isHome && (
          <Link
            to="/"
            className="px-3 py-1.5 rounded border border-oppy-border bg-oppy-surface hover:border-oppy-borderLight text-oppy-textSecondary hover:text-white transition-all flex items-center space-x-1.5"
            title="Return to Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">HOME</span>
          </Link>
        )}

        <Link
          to="/experience"
          className={`px-3 py-1.5 rounded border transition-all flex items-center space-x-1.5 ${
            isExp
              ? 'border-oppy-accent bg-oppy-surface text-white'
              : 'border-oppy-border bg-oppy-bg text-oppy-textSecondary hover:border-oppy-borderLight hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>THE EXPERIENCE</span>
        </Link>

        <Link
          to="/hardware"
          className={`px-3 py-1.5 rounded border transition-all flex items-center space-x-1.5 ${
            isHw
              ? 'border-oppy-accent bg-oppy-surface text-white'
              : 'border-oppy-border bg-oppy-bg text-oppy-textSecondary hover:border-oppy-borderLight hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>THE HARDWARE</span>
        </Link>

        {onToggleAudio && (
          <button
            onClick={onToggleAudio}
            className={`p-1.5 rounded border transition-colors ${
              isAudioPlaying
                ? 'border-oppy-accent bg-oppy-surface text-oppy-accent'
                : 'border-oppy-border bg-oppy-bg text-oppy-textMuted hover:text-white'
            }`}
            title={isAudioPlaying ? 'Mute Martian Atmosphere' : 'Unmute Martian Wind Ambience'}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}
      </div>
    </header>
  );
};
