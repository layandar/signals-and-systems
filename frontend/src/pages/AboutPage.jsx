import { Link } from 'react-router-dom';
import { Activity, BarChart3, Zap, Brain, Database, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Upload</span>
        </Link>

        <div className="card animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About HAR System
          </h1>

          <div className="prose prose-blue max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              The Human Activity Recognition (HAR) System is a sophisticated machine learning application
              that analyzes IMU (Inertial Measurement Unit) sensor data to identify and classify human activities
              in real-time.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How It Works</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Database className="h-6 w-6 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Data Collection</h3>
                </div>
                <p className="text-sm text-gray-700">
                  The system processes 6-axis IMU data containing 3-axis accelerometer and 
                  3-axis gyroscope readings at 50Hz sampling rate.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="h-6 w-6 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Signal Processing</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Advanced filtering techniques separate body acceleration from gravity, 
                  and compute derived signals like jerk and magnitude.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Feature Extraction</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Extracts time-domain features (mean, std, entropy) and frequency-domain features 
                  (FFT, power spectral density) from windowed segments.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Brain className="h-6 w-6 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">ML Classification</h3>
                </div>
                <p className="text-sm text-gray-700">
                  A trained Support Vector Machine (SVM) classifier predicts activities with 
                  high accuracy and provides confidence scores.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Technical Pipeline</h2>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <span className="font-semibold">Window Segmentation:</span> Data is divided into 2.56s windows (128 samples) with 50% overlap
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <span className="font-semibold">Signal Decomposition:</span> Butterworth low-pass filter separates gravity from body acceleration
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <span className="font-semibold">Derived Signals:</span> Compute jerk (time derivative) and magnitude for all signals
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <span className="font-semibold">Feature Engineering:</span> Extract 561 features per window including statistical, spectral, and AR coefficients
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  <div>
                    <span className="font-semibold">Normalization:</span> Apply standard scaling using pre-fitted scaler parameters
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  <div>
                    <span className="font-semibold">Classification:</span> SVM model predicts activity class and confidence probabilities
                  </div>
                </li>
              </ol>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Supported Activities</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {['Walking', 'Walking Upstairs', 'Walking Downstairs', 'Sitting', 'Standing', 'Laying'].map((activity) => (
                <div key={activity} className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200">
                  <Activity className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700 font-medium">{activity}</span>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Technology Stack</h2>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Backend</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• FastAPI - Modern Python web framework</li>
                    <li>• scikit-learn - ML model (SVM)</li>
                    <li>• scipy - Signal processing & FFT</li>
                    <li>• pandas - Data manipulation</li>
                    <li>• NumPy - Numerical computing</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• React 18 - UI framework</li>
                    <li>• Tailwind CSS - Styling</li>
                    <li>• Recharts - Data visualization</li>
                    <li>• React Router - Navigation</li>
                    <li>• Vite - Build tool</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Dataset Information</h3>
              <p className="text-sm text-gray-700">
                This system is trained on the UCI HAR Dataset, which contains recordings of 30 subjects 
                performing activities of daily living while carrying a smartphone with embedded inertial sensors.
                The model achieves high accuracy through sophisticated feature engineering and SVM classification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
