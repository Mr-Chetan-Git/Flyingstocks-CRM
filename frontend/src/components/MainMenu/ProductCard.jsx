import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import DynamicIcon from './DynamicIcon';

const ProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate using product.route or slug
    const targetRoute = product.route || `/products/${product.slug || product.id}`;
    navigate(targetRoute);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="group relative glass-card rounded-2xl p-6 md:p-8 cursor-pointer flex flex-col justify-between overflow-hidden border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/15"
    >
      {/* Top Subtle Gradient Background Glow on Hover */}
      <div className="absolute -top-24 -right-24 w-44 h-44 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

      <div>
        {/* Header Row: Icon & Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 dark:from-indigo-950 dark:to-purple-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-gradient-to-tr group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 shadow-md">
            <DynamicIcon name={product.icon} className="w-7 h-7" />
          </div>

          {product.badge && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 mb-3 flex items-center gap-2">
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-normal">
          {product.description}
        </p>
      </div>

      {/* Footer Row: Route Link Indicator & Arrow */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
        <span className="group-hover:underline flex items-center gap-1">
          Explore Product
        </span>
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
