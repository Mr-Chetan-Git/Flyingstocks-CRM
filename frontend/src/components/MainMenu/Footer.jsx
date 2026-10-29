import React from 'react';
import { Sparkles, Github, Twitter, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Company Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Flying Stock Technologies Logo" 
                className="h-12 w-auto object-contain rounded-lg" 
              />
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Flying Stock Technologies — Artificial Intelligence Software Company. Pioneering enterprise AI solutions engineered to automate operational workflows and scale productivity.
            </p>
          </div>

          {/* Col 2: Products */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Products</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/products/ai-crm" className="hover:text-white transition-colors">AI CRM</Link></li>
              <li><Link to="/products/voice-agent" className="hover:text-white transition-colors">AI Voice Agents</Link></li>
              <li><Link to="/products/ai-search" className="hover:text-white transition-colors">AI Search Engine</Link></li>
              <li><Link to="/products/algo-trading" className="hover:text-white transition-colors">AI Algo Trading</Link></li>
              <li><Link to="/products/text-to-speech" className="hover:text-white transition-colors">Text To Speech</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">AI Suite</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Col 4: Social & Newsletter */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Connect</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-slate-400">
              Get the latest updates on autonomous AI release drops.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Flying Stock Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built with React & Express</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>All Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
