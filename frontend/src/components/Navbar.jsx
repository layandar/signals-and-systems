import { Link } from 'react-router-dom';
import { Activity, Github } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-200">
              <Activity className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">HAR System</span>
              <span className="text-xs text-gray-500 font-medium">Activity Recognition</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 rounded-lg"
            >
              Upload
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 rounded-lg"
            >
              About
            </Link>
            <a
              href="https://github.com/layandar/signals-and-systems"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 rounded-lg group"
              aria-label="View on GitHub"
            >
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
