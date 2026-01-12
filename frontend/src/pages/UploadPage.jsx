import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Activity, BarChart3, Zap, Sparkles, Database, Cpu, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProcessingAnimation from '../components/ProcessingAnimation';
import Footer from '../components/Footer';
import { api } from '../api/client';

const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const allowedTypes = ['.csv', '.txt', '.xlsx'];

  const parseFilePreview = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          const samples = lines.length - 1; // excluding header
          const channels = 6; // acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z
          const samplingRate = 50; // assumed
          const duration = samples / samplingRate;
          
          // Extract sample data for sparkline (first 100 points of acc_x)
          const sparklineData = [];
          for (let i = 1; i < Math.min(101, lines.length); i++) {
            const values = lines[i].split(',');
            if (values.length > 0) {
              sparklineData.push(parseFloat(values[0]) || 0);
            }
          }
          
          resolve({
            samples,
            channels,
            duration: duration.toFixed(2),
            sparklineData,
          });
        } catch (error) {
          resolve(null);
        }
      };
      reader.readAsText(file);
    });
  };

  const onDrop = async (acceptedFiles, rejectedFiles) => {
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
      
      // Parse file for preview
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const preview = await parseFilePreview(file);
        setFilePreview(preview);
      }
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

  const Sparkline = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 200;
    const height = 40;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={width} height={height} className="opacity-70">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-cyan-400"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10">
        <Navbar />
        
        {isLoading && <ProcessingAnimation />}

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl mb-6 backdrop-blur-xl border border-cyan-500/30"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Activity className="h-12 w-12 text-cyan-400" strokeWidth={2} />
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-gradient">Human Activity Recognition</span>
              <br />
              <span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl">from Sensor Signals</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8 px-4">
              Upload raw sensor data and instantly visualize activity classification using
              <span className="text-cyan-400 font-semibold"> signal processing</span> and
              <span className="text-cyan-400 font-semibold"> machine learning</span>
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { icon: Zap, text: 'Real-time Processing' },
                { icon: Cpu, text: 'ML-Powered' },
                { icon: TrendingUp, text: 'High Accuracy' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <feature.icon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-gray-300">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upload Card - Glassmorphism */}
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="glass-card p-4 sm:p-6 lg:p-8">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer
                  transition-all duration-300 transform
                  ${isDragActive 
                    ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02] shadow-lg shadow-cyan-500/20' 
                    : 'border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/30 hover:scale-[1.01]'
                  }
                `}
              >
                <input {...getInputProps()} />
                
                <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                  <motion.div 
                    className={`
                      p-4 sm:p-6 rounded-2xl transition-all duration-300
                      ${isDragActive ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50' : 'bg-gray-800/50 border border-gray-700'}
                    `}
                    animate={{ 
                      scale: isDragActive ? [1, 1.1, 1] : 1,
                      rotate: isDragActive ? [0, 5, -5, 0] : 0 
                    }}
                    transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
                  >
                    <Upload className={`h-12 w-12 sm:h-16 sm:w-16 ${isDragActive ? 'text-white' : 'text-gray-500'}`} />
                  </motion.div>
                  
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-sm sm:text-base text-gray-400">
                      or <span className="text-cyan-400 font-semibold hover:underline cursor-pointer">browse files</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3 px-5 py-3 bg-gray-800/80 rounded-full border border-gray-700">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Supported: CSV, TXT, XLSX</span>
                  </div>
                </div>
              </div>

              {/* Selected File Info with Preview */}
              {selectedFile && (
                <motion.div 
                  className="mt-8 p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl backdrop-blur-xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-500/30 rounded-xl border border-green-500/50">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                      <div>
                        <p className="font-bold text-green-100 text-lg">{selectedFile.name}</p>
                        <p className="text-sm text-green-300">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFilePreview(null);
                        toast('File removed', { icon: '🗑️' });
                      }}
                      className="px-4 py-2 text-green-300 hover:text-white hover:bg-green-600/50 rounded-lg text-sm font-semibold transition-all duration-200 border border-green-500/30"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Preview Stats */}
                  {filePreview && (
                    <motion.div
                      className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-green-500/30"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-center">
                        <Database className="h-5 w-5 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{filePreview.samples.toLocaleString()}</p>
                        <p className="text-xs text-green-300">Samples</p>
                      </div>
                      <div className="text-center">
                        <BarChart3 className="h-5 w-5 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{filePreview.channels}</p>
                        <p className="text-xs text-green-300">Channels</p>
                      </div>
                      <div className="text-center">
                        <Zap className="h-5 w-5 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{filePreview.duration}s</p>
                        <p className="text-xs text-green-300">Duration</p>
                      </div>
                      <div className="text-center">
                        <Activity className="h-5 w-5 text-green-400 mx-auto mb-2" />
                        <Sparkline data={filePreview.sparklineData} />
                        <p className="text-xs text-green-300 mt-1">Signal Preview</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Analyze Button */}
              <motion.div 
                className="mt-6 sm:mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isLoading}
                  className="btn-primary w-full text-lg sm:text-xl py-5 sm:py-6 flex items-center justify-center space-x-3 group relative overflow-hidden"
                >
                  <Activity className="h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-12 transition-transform relative z-10" />
                  <span className="relative z-10">{isLoading ? 'Analyzing...' : 'Analyze Activity'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            className="card-gradient mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 sm:mb-12 text-center">How It Works</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: '1',
                  icon: Upload,
                  title: 'Upload Data',
                  desc: 'Upload your IMU sensor data file containing accelerometer and gyroscope readings',
                  color: 'from-cyan-500 to-blue-600',
                  bgColor: 'bg-cyan-500/10',
                },
                {
                  step: '2',
                  icon: Zap,
                  title: 'AI Processing',
                  desc: 'Our ML model analyzes time and frequency domain features to classify activities',
                  color: 'from-purple-500 to-pink-600',
                  bgColor: 'bg-purple-500/10',
                },
                {
                  step: '3',
                  icon: BarChart3,
                  title: 'View Results',
                  desc: 'Get detailed predictions with confidence scores and interactive visualizations',
                  color: 'from-green-500 to-emerald-600',
                  bgColor: 'bg-green-500/10',
                },
              ].map((item, index) => (
                <motion.div 
                  key={item.step}
                  className="text-center group relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className={`absolute inset-0 ${item.bgColor} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50`} />
                  <div className="relative bg-gray-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-gray-700 group-hover:border-cyan-500/50 transition-all duration-300">
                    <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white font-bold mb-4 sm:mb-6 shadow-lg text-xl sm:text-2xl`}>
                      {item.step}
                    </div>
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className={`p-3 sm:p-4 ${item.bgColor} rounded-xl border border-gray-700`}>
                        <item.icon className="h-10 w-10 sm:h-12 sm:w-12 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="font-bold text-white mb-3 text-lg sm:text-xl">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* File Format Info */}
          <motion.div 
            className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-2xl backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <AlertCircle className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-sm text-blue-100 flex-1">
                <p className="font-bold mb-2 text-lg">Expected File Format:</p>
                <p className="mb-2 text-gray-300">
                  Your file should contain 6 columns: <code className="bg-gray-800 px-3 py-1 rounded-lg font-mono text-xs text-cyan-400 border border-gray-700">acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z</code>
                </p>
                <p className="text-blue-300 font-medium">
                  ✓ Minimum 128 samples required for analysis
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

export default UploadPage;
