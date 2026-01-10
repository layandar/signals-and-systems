import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Activity, BarChart3, Zap, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../api/client';

const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const allowedTypes = ['.csv', '.txt', '.xlsx'];

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Invalid file type. Please upload CSV, TXT, or XLSX files.');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File too large. Maximum size is 10MB.');
        return;
      }

      setSelectedFile(file);
      toast.success(`File "${file.name}" selected successfully!`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.predictActivity(selectedFile);
      
      toast.success('Analysis completed successfully!');
      
      // Navigate to results page with data
      navigate('/results', { state: { result } });
    } catch (error) {
      console.error('Analysis error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Failed to analyze the file. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {isLoading && <LoadingSpinner message="Analyzing your data..." />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary-100 to-purple-100 rounded-2xl mb-4">
            <Sparkles className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4">
            <span className="text-gradient">Human Activity Recognition</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload your IMU sensor data to identify human activities using advanced machine learning
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div 
          className="card-gradient mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            {...getRootProps()}
            className={`
              border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer
              transition-all duration-300 transform
              ${isDragActive 
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-blue-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:scale-[1.01]'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-5">
              <motion.div 
                className={`
                  p-5 rounded-2xl transition-all duration-300 shadow-lg
                  ${isDragActive ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gradient-to-br from-gray-100 to-gray-200'}
                `}
                animate={{ 
                  scale: isDragActive ? [1, 1.1, 1] : 1,
                  rotate: isDragActive ? [0, 5, -5, 0] : 0 
                }}
                transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
              >
                <Upload className={`
                  h-14 w-14 
                  ${isDragActive ? 'text-white' : 'text-gray-500'}
                `} />
              </motion.div>
              
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-base text-gray-600">
                  or <span className="text-primary-600 font-semibold hover:underline cursor-pointer">browse files</span>
                </p>
              </div>
              
              <div className="flex items-center space-x-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Supported: CSV, TXT, XLSX</span>
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <motion.div 
              className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl flex items-center justify-between shadow-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-500 rounded-full">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900 text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-green-700">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  toast('File removed', { icon: '🗑️' });
                }}
                className="px-4 py-2 text-green-700 hover:text-white hover:bg-green-600 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Remove
              </button>
            </motion.div>
          )}

          {/* Analyze Button */}
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              className="btn-primary w-full text-xl py-5 flex items-center justify-center space-x-3 group"
            >
              <Activity className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span>{isLoading ? 'Analyzing...' : 'Analyze Activity'}</span>
            </button>
          </motion.div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          className="card-gradient mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold mb-4 shadow-lg group-hover:shadow-xl transition-shadow text-2xl">
                1
              </div>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Upload className="h-10 w-10 text-primary-600" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-xl">Upload Data</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload your IMU sensor data file containing accelerometer and gyroscope readings
              </p>
            </motion.div>

            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold mb-4 shadow-lg group-hover:shadow-xl transition-shadow text-2xl">
                2
              </div>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Zap className="h-10 w-10 text-purple-600" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-xl">AI Processing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our ML model analyzes time and frequency domain features to classify activities
              </p>
            </motion.div>

            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold mb-4 shadow-lg group-hover:shadow-xl transition-shadow text-2xl">
                3
              </div>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BarChart3 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-xl">View Results</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Get detailed predictions with confidence scores and visualizations
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* File Format Info */}
        <motion.div 
          className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm text-blue-900 flex-1">
              <p className="font-bold mb-2 text-lg">Expected File Format:</p>
              <p className="mb-2">
                Your file should contain 6 columns: <code className="bg-blue-200 px-3 py-1 rounded-lg font-mono text-xs">acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z</code>
              </p>
              <p className="text-blue-800 font-medium">
                ✓ Minimum 128 samples required for analysis
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;
