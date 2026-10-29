import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated voice activity visualization responding to state:
 * - 'idle': Subtle ambient wave
 * - 'listening': Blue receptive pulse
 * - 'thinking': Purple processing wave animation
 * - 'speaking': Green dynamic audio bar spectrum
 */
const VoiceWave = ({ state = 'idle', className = '' }) => {
  const barCount = 12;

  const getStateColors = () => {
    switch (state) {
      case 'listening':
        return 'from-blue-500 to-indigo-500 shadow-blue-500/50';
      case 'thinking':
        return 'from-purple-500 to-pink-500 shadow-purple-500/50';
      case 'speaking':
        return 'from-emerald-400 via-indigo-500 to-purple-500 shadow-emerald-500/50';
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const getBarHeightAnimation = (index) => {
    switch (state) {
      case 'speaking':
        return {
          height: [
            `${15 + (index % 4) * 10}px`,
            `${45 + (index % 5) * 12}px`,
            `${20 + (index % 3) * 15}px`,
            `${55 + (index % 2) * 10}px`,
            `${15 + (index % 4) * 10}px`,
          ],
          transition: {
            duration: 0.6 + (index % 4) * 0.1,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          },
        };
      case 'thinking':
        return {
          height: ['15px', '40px', '15px'],
          opacity: [0.4, 1, 0.4],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.08,
            ease: 'easeInOut',
          },
        };
      case 'listening':
        return {
          height: [`${20 + Math.sin(index) * 10}px`, `${30 + Math.cos(index) * 10}px`, `${20 + Math.sin(index) * 10}px`],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.05,
            ease: 'easeInOut',
          },
        };
      default:
        return {
          height: '10px',
          opacity: 0.3,
        };
    }
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 h-20 px-6 py-2 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          animate={getBarHeightAnimation(i)}
          className={`w-1.5 rounded-full bg-gradient-to-t ${getStateColors()} shadow-sm`}
        />
      ))}
    </div>
  );
};

export default VoiceWave;
