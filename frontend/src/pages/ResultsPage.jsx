import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  ArrowLeft, Activity, TrendingUp, FileText, Layers, CheckCircle, 
  BarChart3, Award, Zap, Radio, Waves, Info, RefreshCw, Brain
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CircularProgress from '../components/CircularProgress';
import Footer from '../components/Footer';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSignal, setSelectedSignal] = useState('acc');
  const [selectedAxis, setSelectedAxis] = useState('x');
  const [viewMode, setViewMode] = useState('time'); // 'time' or 'frequency'
  
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
      fill: activity === result.activity ? '#06b6d4' : '#374151',
    }));
  };

  // Calculate insights
  const calculateInsights = () => {
    const freqData = prepareFreqData();
    if (freqData.length === 0) return null;

    // Find dominant frequency
    const maxMag = Math.max(...freqData.map(d => d.mag_x));
    const dominantFreqData = freqData.find(d => d.mag_x === maxMag);
    const dominantFreq = dominantFreqData ? parseFloat(dominantFreqData.freq) : 0;

    // Calculate signal energy (simplified)
    const avgMagnitude = freqData.reduce((sum, d) => sum + d.mag_x, 0) / freqData.length;
    const energyLevel = avgMagnitude > 1 ? 'High' : avgMagnitude > 0.5 ? 'Medium' : 'Low';

    // Determine stability (based on frequency spread)
    const freqVariance = freqData.reduce((sum, d) => sum + Math.pow(d.mag_x - avgMagnitude, 2), 0) / freqData.length;
    const stability = freqVariance < 0.5 ? 'Stable' : freqVariance < 2 ? 'Moderate' : 'Noisy';

    return {
      dominantFreq: dominantFreq.toFixed(2),
      energyLevel,
      stability,
    };
  };

  // Get activity explanation
  const getActivityExplanation = (activity) => {
    const explanations = {
      walking: "Walking produces periodic low-frequency components (1-2 Hz) with consistent amplitude patterns across all axes. The rhythmic nature creates clear spectral peaks.",
      jogging: "Jogging exhibits higher frequency components (2-4 Hz) with increased amplitude variations. The impact patterns show distinct peaks in the vertical acceleration.",
      sitting: "Sitting shows minimal movement with very low frequency content (<0.5 Hz) and small amplitude variations, primarily reflecting minor postural adjustments.",
      standing: "Standing displays low-frequency oscillations from body sway and balance maintenance, with relatively small amplitudes across all axes.",
      upstairs: "Climbing stairs generates distinct periodic patterns with higher energy in vertical acceleration and characteristic frequency signatures around 1.5-2.5 Hz.",
      downstairs: "Descending stairs produces controlled deceleration patterns with unique spectral characteristics differing from upward movement.",
    };

    return explanations[activity] || "This activity shows unique signal characteristics that distinguish it from other movement patterns.";
  };

  const timeData = prepareTimeData();
  const freqData = prepareFreqData();
  const probabilityData = prepareProbabilityData();
  const insights = calculateInsights();

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCurrentSignalKey = () => {
    return `${selectedSignal}_${selectedAxis}`;
  };

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 animated-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
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
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-cyan-400 mb-6 transition-all duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Analyze Another File</span>
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2">
                  <span className="text-gradient">Analysis Results</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Detailed breakdown of your activity recognition</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 whitespace-nowrap"
              >
                <RefreshCw className="h-5 w-5" />
                <span>New Analysis</span>
              </button>
            </div>
          </motion.div>

          {/* Prediction Spotlight */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="glass-card p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                  <div className="w-full lg:w-auto">
                    <motion.div
                      className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-6 shadow-2xl shadow-cyan-500/50"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                      <Award className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                    </motion.div>
                    
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-2 break-words">
                      {result.activity.replace(/_/g, ' ').toUpperCase()}
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg">Detected Activity</p>
                  </div>

                  {result.confidence > 0 && (
                    <div className="flex flex-col items-center">
                      <CircularProgress 
                        value={Math.round(result.confidence * 100)} 
                        size={window.innerWidth < 640 ? 180 : 220}
                        strokeWidth={window.innerWidth < 640 ? 12 : 14}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Banner */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 text-center hover:border-cyan-500/50 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {result.meta.samples.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total Samples</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 text-center hover:border-purple-500/50 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {result.meta.windows_analyzed}
              </div>
              <div className="text-xs text-gray-400">Windows</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 text-center hover:border-green-500/50 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {result.meta.sampling_rate}
              </div>
              <div className="text-xs text-gray-400">Hz</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/30 rounded-xl p-4 text-center hover:border-orange-500/50 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {result.meta.channels}
              </div>
              <div className="text-xs text-gray-400">Channels</div>
            </div>
          </motion.div>

          {/* Activity Stability Card */}
          {insights && (
            <motion.div
              className="card-gradient mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-xl border border-green-500/30">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Activity Stability</h2>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Signal consistency and pattern regularity</p>
                <span className={`text-2xl font-bold ${
                  insights.stability === 'Stable' ? 'text-green-400' :
                  insights.stability === 'Moderate' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {insights.stability}
                </span>
              </div>
            </motion.div>
          )}

          {/* Probabilities Chart */}
          {probabilityData.length > 0 && (
            <motion.div 
              className="card-gradient mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                  <BarChart3 className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Class Probabilities</h2>
              </div>
              
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={probabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="activity" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="probability" radius={[8, 8, 0, 0]}>
                    {probabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Signal Visualization */}
          <motion.div 
            className="card-gradient mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-xl border border-green-500/30">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Signal Analysis</h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700 w-full sm:w-auto">
                  <button
                    onClick={() => setViewMode('time')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      viewMode === 'time'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Time
                  </button>
                  <button
                    onClick={() => setViewMode('frequency')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      viewMode === 'frequency'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Frequency
                  </button>
                </div>

                {viewMode === 'time' && (
                  <>
                    <select
                      value={selectedSignal}
                      onChange={(e) => setSelectedSignal(e.target.value)}
                      className="px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full sm:w-auto"
                    >
                      <option value="acc">Accelerometer</option>
                      <option value="gyro">Gyroscope</option>
                    </select>
                    
                    <select
                      value={selectedAxis}
                      onChange={(e) => setSelectedAxis(e.target.value)}
                      className="px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full sm:w-auto"
                    >
                      <option value="x">X-Axis</option>
                      <option value="y">Y-Axis</option>
                      <option value="z">Z-Axis</option>
                    </select>
                  </>
                )}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {viewMode === 'time' ? (
                <motion.div
                  key="time"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                      />
                      <YAxis 
                        label={{ 
                          value: selectedSignal === 'acc' ? 'Acceleration (m/s²)' : 'Angular Velocity (rad/s)', 
                          angle: -90, 
                          position: 'insideLeft',
                          fill: '#9ca3af'
                        }}
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '12px',
                          fontSize: '14px',
                          color: '#fff'
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#9ca3af' }} />
                      <Line 
                        type="monotone" 
                        dataKey={getCurrentSignalKey()} 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={false}
                        name={`${selectedSignal.toUpperCase()} ${selectedAxis.toUpperCase()}`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <motion.div
                  key="frequency"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={freqData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="freq" 
                        label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                      />
                      <YAxis 
                        label={{ value: 'Magnitude', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '12px',
                          fontSize: '14px',
                          color: '#fff'
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#9ca3af' }} />
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
              )}
            </AnimatePresence>
          </motion.div>

          {/* Prediction Distribution */}
          {result.prediction_distribution && (
            <motion.div 
              className="card-gradient mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <Layers className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Window Distribution</h2>
              </div>
              
              <div className="space-y-3">
                {Object.entries(result.prediction_distribution).map(([activity, count]) => {
                  const percentage = (count / result.meta.windows_analyzed) * 100;
                  return (
                    <div key={activity} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 font-medium">
                        {activity.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-3 flex-1 ml-4">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Explainability Section */}
          <motion.div
            className="card-gradient mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                <Brain className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Why This Activity?</h2>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/20">
              <p className="text-gray-300 leading-relaxed mb-4">
                {getActivityExplanation(result.activity)}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs text-cyan-300 font-medium">
                  Frequency Analysis
                </span>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium">
                  Pattern Recognition
                </span>
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
                  ML Classification
                </span>
              </div>
            </div>
          </motion.div>

          {/* File Information Card - Moved to Bottom */}
          <motion.div 
            className="card-gradient mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">File Information</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Filename', value: result.meta.filename, icon: FileText },
                { label: 'Total Samples', value: result.meta.samples.toLocaleString(), icon: Layers },
                { label: 'Channels', value: result.meta.channels, icon: Radio },
                { label: 'Sampling Rate', value: `${result.meta.sampling_rate} Hz`, icon: Zap },
                { label: 'Windows Analyzed', value: result.meta.windows_analyzed, icon: BarChart3 },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex items-center justify-between py-3 px-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-200"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm font-medium text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white truncate ml-2" title={item.value}>
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default ResultsPage;
