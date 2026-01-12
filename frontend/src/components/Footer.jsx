import { Heart, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-xl border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">HAR System</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Advanced human activity recognition using IMU sensor data and machine learning.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Project Info</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Course: Signals & Systems</li>
              <li>Institution: German Jordanian University</li>
              <li>Year: 2026</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/layandar/signals-and-systems"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400 transition-colors inline-flex items-center space-x-2"
                >
                  <Github className="h-4 w-4" />
                  <span>View on GitHub</span>
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  About This Project
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p className="text-gray-500 text-sm">
            © 2026 HAR System. Built for academic purposes.
          </p>
          <p className="text-gray-500 text-sm flex items-center space-x-1">
            <span>Made </span>
           
            <span>by Signals Team</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
