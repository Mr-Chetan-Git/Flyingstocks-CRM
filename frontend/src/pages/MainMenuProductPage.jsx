import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import productsData from '../utils/productData';
import DynamicIcon from '../components/MainMenu/DynamicIcon';
import Button from '../components/MainMenu/Button';
import LoadingSpinner from '../components/MainMenu/LoadingSpinner';

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = productsData.find(p => p.slug === slug);
        if (!data) throw new Error("Product not found");
        if (isMounted) setProduct(data);
      } catch (err) {
        // Formulate readable fallback name from slug
        if (isMounted) {
          const formattedName = slug
            ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : 'AI Product';
          setProduct({
            name: formattedName,
            description: `Next-generation ${formattedName} solution for automated workflows.`,
            icon: 'Sparkles',
            slug: slug,
            badge: 'Upcoming',
            highlights: [
              'Enterprise-grade security and encryption',
              'Sub-second latency REST and WebSocket API access',
              'Seamless integration with your existing software stack'
            ]
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProductDetails();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return <LoadingSpinner message={`Loading product page /products/${slug}...`} />;
  }

  const productName = product?.name || slug;
  const iconName = product?.icon || 'Sparkles';
  const description = product?.description || 'AI-powered automated enterprise tool.';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20"
    >
      {/* Back Button */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/main-menu')} 
          className="group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>
      </div>

      {/* Main Product Feature Card */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-2xl">
        
        {/* Glow Accent */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-start gap-6">
          
          {/* Header Row: Icon & Coming Soon Badge */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <DynamicIcon name={iconName} className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-indigo-600 dark:text-indigo-400">
                  {product?.category || 'AI Suite Product'}
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  {productName}
                </h1>
              </div>
            </div>

            {/* Coming Soon Indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-semibold shadow-sm animate-pulse">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Coming Soon...</span>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-3xl space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Product Overview
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {description}
            </p>
          </div>

          {/* Highlights / Features Preview */}
          {product?.highlights && product.highlights.length > 0 && (
            <div className="w-full mt-4 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Key Platform Capabilities Preview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.highlights.map((highlight, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call To Action Box */}
          <div className="w-full mt-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-200/60 dark:border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Be the first to get early beta access
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                We are rolling out private developer invites for {productName} weekly.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button size="md" variant="primary" onClick={() => alert(`Subscribed for ${productName} early access alerts!`)}>
                Join Waitlist
              </Button>
              <Button size="md" variant="secondary" onClick={() => navigate('/main-menu')}>
                Back to Products
              </Button>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default ProductPage;
