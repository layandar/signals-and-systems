import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Zap, Brain, Database, ArrowLeft, Sparkles, Code, Target, Cpu } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-cyan-400 mb-8 transition-all duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Back to Upload</span>
            </Link>
          </motion.div>

          <motion.div 
            className="glass-card mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mb-6 shadow-2xl shadow-cyan-500/50"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-12 w-12 text-white" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
                <span className="text-gradient">About HAR System</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
                Advanced machine learning application for real-time human activity recognition using IMU sensor data
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                The Human Activity Recognition (HAR) System leverages sophisticated signal processing and machine learning techniques
                to analyze Inertial Measurement Unit (IMU) sensor data, enabling accurate identification and classification of human activities
                in real-time with high confidence scores.
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-6 flex items-center space-x-3">
                <Cpu className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
                <span>How It Works</span>
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
                {[
                  {
                    icon: Database,
                    title: 'Data Collection',
                    desc: 'The system processes 6-axis IMU data containing 3-axis accelerometer and 3-axis gyroscope readings at 50Hz sampling rate.',
                    color: 'from-cyan-500 to-blue-600',
                  },
                  {
                    icon: Zap,
                    title: 'Signal Processing',
                    desc: 'Advanced filtering techniques separate body acceleration from gravity, and compute derived signals like jerk and magnitude.',
                    color: 'from-purple-500 to-pink-600',
                  },
                  {
                    icon: BarChart3,
                    title: 'Feature Extraction',
                    desc: 'Extracts time-domain features (mean, std, entropy) and frequency-domain features (FFT, power spectral density) from windowed segments.',
                    color: 'from-green-500 to-emerald-600',
                  },
                  {
                    icon: Brain,
                    title: 'ML Classification',
                    desc: 'A trained Support Vector Machine (SVM) classifier predicts activities with high accuracy and provides confidence scores.',
                    color: 'from-orange-500 to-red-600',
                  },
                ].map((feature, index) => (
                  <motion.div 
                    key={feature.title}
                    className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-3 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              <h2 className="text-3xl font-bold text-white mt-10 mb-6 flex items-center space-x-3">
                <Target className="h-8 w-8 text-cyan-400" />
                <span>Technical Pipeline</span>
              </h2>
              
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 mb-10 shadow-xl">
                <ol className="space-y-5 text-gray-300">
                  {[
                    {
                      title: 'Window Segmentation',
                      desc: 'Data is divided into 2.56s windows (128 samples) with 50% overlap',
                      color: 'from-cyan-500 to-blue-600',
                    },
                    {
                      title: 'Signal Decomposition',
                      desc: 'Butterworth low-pass filter separates gravity from body acceleration',
                      color: 'from-purple-500 to-pink-600',
                    },
                    {
                      title: 'Derived Signals',
                      desc: 'Compute jerk (time derivative) and magnitude for all signals',
                      color: 'from-green-500 to-emerald-600',
                    },
                    {
                      title: 'Feature Engineering',
                      desc: 'Extract 561-dimensional feature vector including statistical and spectral features',
                      color: 'from-orange-500 to-red-600',
                    },
                    {
                      title: 'Model Inference',
                      desc: 'SVM classifier processes features and outputs activity predictions with probabilities',
                      color: 'from-pink-500 to-rose-600',
                    },
                  ].map((step, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <span className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${step.color} text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-lg text-white">{step.title}</span>
                        <p className="text-gray-400 mt-1">{step.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-6 flex items-center space-x-3">
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
                <span>Supported Activities</span>
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
                {[
                  'Walking',
                  'Jogging',
                  'Sitting',
                  'Standing',
                  'Upstairs',
                  'Downstairs',
                ].map((activity, index) => (
                  <motion.div
                    key={activity}
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 text-center hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-white font-semibold">{activity}</span>
                  </motion.div>
                ))}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-6 flex items-center space-x-3">
                <Code className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
                <span>Technology Stack</span>
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="font-bold text-white text-lg mb-4">Frontend</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>React 18 + Vite</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Tailwind CSS</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Framer Motion</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Recharts</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="font-bold text-white text-lg mb-4">Backend</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Python + FastAPI</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Scikit-learn</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>NumPy & SciPy</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Pandas</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-3 flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                  <span>Academic Project</span>
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  This system was developed as part of a Signals & Systems course project, demonstrating
                  practical applications of digital signal processing, frequency analysis, and machine learning
                  in real-world scenarios. The project showcases the integration of theoretical concepts
                  with modern web technologies to create an interactive, user-friendly application.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AboutPage;
