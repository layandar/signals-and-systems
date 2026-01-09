import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Activity, BarChart3, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      {isLoading && <LoadingSpinner message="Analyzing your data..." />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Human Activity Recognition
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your IMU sensor data to identify human activities using advanced machine learning
          </p>
        </div>

        {/* Upload Card */}
        <div className="card mb-8 animate-slide-up">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-300
              ${isDragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              <div className={`
                p-4 rounded-full transition-colors
                ${isDragActive ? 'bg-primary-200' : 'bg-gray-100'}
              `}>
                <Upload className={`
                  h-12 w-12 
                  ${isDragActive ? 'text-primary-600' : 'text-gray-400'}
                `} />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-gray-500">
                  or <span className="text-primary-600 font-medium">browse files</span>
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>Supported formats: CSV, TXT, XLSX</span>
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between animate-fade-in">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{selectedFile.name}</p>
                  <p className="text-sm text-green-700">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  toast('File removed', { icon: '🗑️' });
                }}
                className="text-green-700 hover:text-green-900 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          {/* Analyze Button */}
          <div className="mt-6">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              className="btn-primary w-full text-lg py-4"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Activity'}
            </button>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="card animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold mb-4">
                1
              </div>
              <div className="flex justify-center mb-3">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Data</h3>
              <p className="text-sm text-gray-600">
                Upload your IMU sensor data file containing accelerometer and gyroscope readings
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold mb-4">
                2
              </div>
              <div className="flex justify-center mb-3">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-sm text-gray-600">
                Our ML model analyzes time and frequency domain features to classify activities
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold mb-4">
                3
              </div>
              <div className="flex justify-center mb-3">
                <BarChart3 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View Results</h3>
              <p className="text-sm text-gray-600">
                Get detailed predictions with confidence scores and visualizations
              </p>
            </div>
          </div>
        </div>

        {/* File Format Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Expected File Format:</p>
              <p>
                Your file should contain 6 columns: <code className="bg-blue-100 px-2 py-0.5 rounded">acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z</code>
              </p>
              <p className="mt-1 text-blue-700">
                Minimum 128 samples required for analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
