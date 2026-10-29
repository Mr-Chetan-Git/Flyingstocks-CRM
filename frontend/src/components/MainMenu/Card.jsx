import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hoverEffect = true,
  onClick,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -6, scale: 1.01 } : {}}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
