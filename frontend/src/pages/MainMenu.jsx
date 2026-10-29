import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import productsData from '../utils/productData';
import Hero from '../components/MainMenu/Hero';
import ProductCard from '../components/MainMenu/ProductCard';
import LoadingSpinner from '../components/MainMenu/LoadingSpinner';
import ErrorMessage from '../components/MainMenu/ErrorMessage';
import { Sparkles, Layers, ShieldCheck, Zap, Mail, Send } from 'lucide-react';
import Button from '../components/MainMenu/Button';

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductsData = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(productsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  const scrollToProducts = () => {
    const section = document.getElementById('products');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner */}
      <Hero onExploreClick={scrollToProducts} />

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>AI Product Portfolio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore Our <span className="gradient-text">AI Ecosystem</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Choose from our specialized AI engines engineered to accelerate lead acquisition, automation, and decision intelligence.
          </p>
        </div>

        {/* State Conditional Rendering */}
        {loading ? (
          <LoadingSpinner message="Fetching latest product models from API..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProductsData} />
        ) : (
          /* Responsive Grid: Desktop 4 columns, Tablet 2 columns, Mobile 1 column */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id || index} product={product} index={index} />
            ))}
          </div>
        )}

      </section>

      {/* About Section Spotlight */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                Why Choose Flying Stock Technologies
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4">
                Architected for Scale, Accuracy & Velocity
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                NexusAI combines state-of-the-art transformer models with zero-latency streaming architecture. Whether automating complex customer calls or running algorithmic trading routines, our platform guarantees 99.99% operational uptime.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/50">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">10x</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Faster Workflow Execution</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/50">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">500M+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Inferences Processed</div>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-full max-w-md h-64 sm:h-80 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 p-1 shadow-2xl">
                <div className="w-full h-full bg-slate-900 rounded-xl p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                    <span className="text-xs font-mono text-indigo-400">flying-stock-core-v2.4</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs text-slate-300">
                    <p className="text-emerald-400">$ flying-stock status --all</p>
                    <p className="text-slate-400">✔ AI CRM Agent: ONLINE</p>
                    <p className="text-slate-400">✔ Voice Pipeline: 18ms latency</p>
                    <p className="text-slate-400">✔ Algo Engine: Signal Locked</p>
                    <p className="text-indigo-400">⚡ Ready for deployment</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
                    <span>Region: us-east-1</span>
                    <span>Status: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-24">
        <div className="glass-card rounded-3xl p-8 text-center max-w-2xl mx-auto">
          <Mail className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Need Custom AI Workflows?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 mb-6">
            Get in touch with our enterprise solution architects to build tailored AI models for your stack.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your work email" 
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow"
            />
            <Button variant="primary" size="md" icon={Send}>
              Contact Us
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
