import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Zap, Brain, Database, ArrowLeft, Sparkles, Code } from 'lucide-react';
import Navbar from '../components/Navbar';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-8 transition-all duration-200 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Upload</span>
          </Link>
        </motion.div>

        <motion.div 
          className="card-gradient"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl mb-4 shadow-xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-5xl font-extrabold mb-4">
              <span className="text-gradient">About HAR System</span>
            </h1>
          </div>

          <div className="prose prose-blue max-w-none">
            <p className="text-xl text-gray-700 mb-8 leading-relaxed text-center">
              The Human Activity Recognition (HAR) System is a sophisticated machine learning application
              that analyzes IMU (Inertial Measurement Unit) sensor data to identify and classify human activities
              in real-time.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-6">How It Works</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <motion.div 
                className="feature-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-primary-500 rounded-lg">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Data Collection</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The system processes 6-axis IMU data containing 3-axis accelerometer and 
                  3-axis gyroscope readings at 50Hz sampling rate.
                </p>
              </motion.div>

              <motion.div 
                className="feature-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Signal Processing</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Advanced filtering techniques separate body acceleration from gravity, 
                  and compute derived signals like jerk and magnitude.
                </p>
              </motion.div>

              <motion.div 
                className="feature-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Feature Extraction</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Extracts time-domain features (mean, std, entropy) and frequency-domain features 
                  (FFT, power spectral density) from windowed segments.
                </p>
              </motion.div>

              <motion.div 
                className="feature-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">ML Classification</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  A trained Support Vector Machine (SVM) classifier predicts activities with 
                  high accuracy and provides confidence scores.
                </p>
              </motion.div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-6">Technical Pipeline</h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl border-2 border-gray-300 mb-10 shadow-md">
              <ol className="space-y-4 text-gray-800">
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md">1</span>
                  <div>
                    <span className="font-bold text-lg">Window Segmentation:</span> 
                    <p className="text-gray-700 mt-1">Data is divided into 2.56s windows (128 samples) with 50% overlap</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md">2</span>
                  <div>
                    <span className="font-bold text-lg">Signal Decomposition:</span>
                    <p className="text-gray-700 mt-1">Butterworth low-pass filter separates gravity from body acceleration</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md">3</span>
                  <div>
                    <span className="font-bold text-lg">Derived Signals:</span>
                    <p className="text-gray-700 mt-1">Compute jerk (time derivative) and magnitude for all signals</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md">4</span>
                  <div>
                    <span className="font-bold text-lg">Feature Engineering:</span>
                    <p className="text-gray-700 mt-1">Extract 561 features per window including statistical, spectral, and AR coefficients</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md">5</span>
                  <div>
                    <span className="font-bold text-lg">Normalization:</span>
                    <p className="text-gray-700 mt-1">Apply standard scaling using pre-fitted scaler parameters</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md">6</span>
                  <div>
                    <span className="font-bold text-lg">Classification:</span>
                    <p className="text-gray-700 mt-1">SVM model predicts activity class and confidence probabilities</p>
                  </div>
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-6">Supported Activities</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {['Walking', 'Walking Upstairs', 'Walking Downstairs', 'Sitting', 'Standing', 'Laying'].map((activity, index) => (
                <motion.div 
                  key={activity} 
                  className="flex items-center space-x-3 bg-white p-4 rounded-xl border-2 border-primary-200 shadow-sm hover:shadow-lg hover:border-primary-400 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Activity className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-gray-800 font-semibold">{activity}</span>
                </motion.div>
              ))}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-6">Technology Stack</h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl border-2 border-gray-300 shadow-md">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl">Backend</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>FastAPI - Modern Python web framework</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>scikit-learn - ML model (SVM)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>scipy - Signal processing & FFT</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>pandas - Data manipulation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>NumPy - Numerical computing</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl">Frontend</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>React 18 - UI framework</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>Tailwind CSS - Styling</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>Recharts - Data visualization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>React Router - Navigation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span>Vite - Build tool</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 p-8 bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-300 rounded-2xl shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-500 rounded-xl shadow-md">
                  <Database className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-xl">Dataset Information</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This system is trained on the UCI HAR Dataset, which contains recordings of 30 subjects 
                    performing activities of daily living while carrying a smartphone with embedded inertial sensors.
                    The model achieves high accuracy through sophisticated feature engineering and SVM classification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
