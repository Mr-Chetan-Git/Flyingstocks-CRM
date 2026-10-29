import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Cpu } from 'lucide-react';
import Button from './Button';

const Hero = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Tagline Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Next-Generation Autonomous AI Platform</span>
        </motion.div>

        {/* Hero Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]"
        >
          Welcome to <span className="gradient-text">Flying Stock Technologies</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Explore our AI-powered products designed to automate businesses.
        </motion.p>

        {/* Primary CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            size="lg" 
            variant="primary" 
            icon={ArrowRight}
            onClick={onExploreClick}
            className="w-full sm:w-auto shadow-xl shadow-indigo-500/20"
          >
            Explore Products
          </Button>
          
          <a href="#about" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Learn More
            </Button>
          </a>
        </motion.div>

        {/* Highlights / Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 pt-10 border-t border-slate-200/60 dark:border-slate-800/60 max-w-3xl mx-auto grid grid-cols-3 gap-4 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>SOC2 Enterprise Ready</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <span>99.99% Uptime SLA</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>Real-time AI Inference</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
