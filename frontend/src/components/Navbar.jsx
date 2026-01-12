import { Link } from 'react-router-dom';
import { Activity, Github, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-xl shadow-2xl border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-cyan-500/50 transform group-hover:scale-105 transition-all duration-200">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-gradient-warm">HAR System</span>
              <span className="text-xs text-gray-500 font-medium hidden sm:block">Activity Recognition</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 font-medium transition-all duration-200 rounded-xl"
            >
              Upload
            </Link>
            <Link
              to="/about"
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 font-medium transition-all duration-200 rounded-xl"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <a
              href="https://github.com/layandar/signals-and-systems"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 font-medium transition-all duration-200 rounded-xl group"
              aria-label="View on GitHub"
            >
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 rounded-xl transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 font-medium transition-all duration-200 rounded-xl"
            >
              Upload
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 font-medium transition-all duration-200 rounded-xl"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <a
              href="https://github.com/layandar/signals-and-systems"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 font-medium transition-all duration-200 rounded-xl"
              aria-label="View on GitHub"
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
