import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeft, Activity, TrendingUp, FileText, 
  Layers, CheckCircle, BarChart3, Award 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSignal, setSelectedSignal] = useState('acc');
  const [selectedAxis, setSelectedAxis] = useState('x');
  
  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate('/');
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  // Prepare data for time-domain chart
  const prepareTimeData = () => {
    if (!result.signals_preview) return [];
    
    const { t, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z } = result.signals_preview;
    
    return t.map((time, index) => ({
      time: time.toFixed(3),
      acc_x: acc_x[index],
      acc_y: acc_y[index],
      acc_z: acc_z[index],
      gyro_x: gyro_x[index],
      gyro_y: gyro_y[index],
      gyro_z: gyro_z[index],
    }));
  };

  // Prepare data for frequency-domain chart
  const prepareFreqData = () => {
    if (!result.fft_preview) return [];
    
    const { freq, mag_acc_x, mag_acc_y, mag_acc_z } = result.fft_preview;
    
    // Limit to meaningful frequencies (< 25 Hz typically for human motion)
    const maxFreqIndex = freq.findIndex(f => f > 25);
    const limit = maxFreqIndex > 0 ? maxFreqIndex : freq.length;
    
    return freq.slice(0, limit).map((frequency, index) => ({
      freq: frequency.toFixed(2),
      mag_x: mag_acc_x[index],
      mag_y: mag_acc_y[index],
      mag_z: mag_acc_z[index],
    }));
  };

  // Prepare probability data for bar chart
  const prepareProbabilityData = () => {
    if (!result.probabilities) return [];
    
    return Object.entries(result.probabilities).map(([activity, probability]) => ({
      activity: activity.replace(/_/g, ' ').toUpperCase(),
      probability: (probability * 100).toFixed(2),
    }));
  };

  const timeData = prepareTimeData();
  const freqData = prepareFreqData();
  const probabilityData = prepareProbabilityData();

  const getConfidenceBadgeColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getCurrentSignalKey = () => {
    return `${selectedSignal}_${selectedAxis}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-4 transition-all duration-200 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Analyze Another File</span>
          </Link>
          
          <h1 className="text-4xl font-extrabold">
            <span className="text-gradient">Analysis Results</span>
          </h1>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Prediction & Metadata */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prediction Card */}
            <motion.div 
              className="card-gradient"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Activity className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Prediction</h2>
              </div>
              
              <div className="text-center py-6">
                <motion.div 
                  className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 mb-4 shadow-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <Award className="h-12 w-12 text-white" />
                </motion.div>
                
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3">
                  {result.activity.replace(/_/g, ' ').toUpperCase()}
                </h3>
                
                {result.confidence > 0 && (
                  <div className="flex justify-center">
                    <span className={`
                      px-5 py-2 rounded-full text-sm font-bold border-2 shadow-md
                      ${getConfidenceBadgeColor(result.confidence)}
                    `}>
                      {(result.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Metadata Card */}
            <motion.div 
              className="card-gradient"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Metadata</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Filename</span>
                  <span className="text-sm font-medium text-gray-900 truncate ml-2" title={result.meta.filename}>
                    {result.meta.filename}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Samples</span>
                  <span className="text-sm font-medium text-gray-900">
                    {result.meta.samples.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Channels</span>
                  <span className="text-sm font-medium text-gray-900">
                    {result.meta.channels}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Sampling Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {result.meta.sampling_rate} Hz
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Windows Analyzed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {result.meta.windows_analyzed}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Prediction Distribution */}
            {result.prediction_distribution && (
              <motion.div 
                className="card-gradient"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Layers className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Distribution</h2>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(result.prediction_distribution).map(([activity, count]) => (
                    <div key={activity} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {activity.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${(count / result.meta.windows_analyzed) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Probabilities Chart */}
            {probabilityData.length > 0 && (
              <motion.div 
                className="card-gradient"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Class Probabilities</h2>
                </div>
                
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={probabilityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="activity" 
                      tick={{ fontSize: 12 }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <Bar dataKey="probability" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Time Domain Chart */}
            <motion.div 
              className="card-gradient"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Time Domain Signal</h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedSignal}
                    onChange={(e) => setSelectedSignal(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="acc">Accelerometer</option>
                    <option value="gyro">Gyroscope</option>
                  </select>
                  
                  <select
                    value={selectedAxis}
                    onChange={(e) => setSelectedAxis(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="x">X-Axis</option>
                    <option value="y">Y-Axis</option>
                    <option value="z">Z-Axis</option>
                  </select>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ 
                      value: selectedSignal === 'acc' ? 'Acceleration (m/s²)' : 'Angular Velocity (rad/s)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={getCurrentSignalKey()} 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name={`${selectedSignal.toUpperCase()} ${selectedAxis.toUpperCase()}`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Frequency Domain Chart */}
            <motion.div 
              className="card-gradient"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Frequency Domain (FFT)</h2>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={freqData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="freq" 
                    label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Magnitude', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="mag_x" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                    name="X-Axis"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mag_y" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="Y-Axis"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mag_z" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name="Z-Axis"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
