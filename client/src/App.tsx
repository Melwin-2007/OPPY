import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ExperiencePage } from './pages/ExperiencePage';
import { HardwarePage } from './pages/HardwarePage';
import { useWebAudio } from './hooks/useWebAudio';

export const App: React.FC = () => {
  const { isPlaying, toggleAudio } = useWebAudio();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage isAudioPlaying={isPlaying} onToggleAudio={toggleAudio} />} />
        <Route path="/experience" element={<ExperiencePage isAudioPlaying={isPlaying} onToggleAudio={toggleAudio} />} />
        <Route path="/hardware" element={<HardwarePage isAudioPlaying={isPlaying} onToggleAudio={toggleAudio} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
