import React from 'react';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, className = "w-6 h-6", ...props }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} {...props} />;
};

export default DynamicIcon;
