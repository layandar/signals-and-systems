import { motion } from 'framer-motion';
import { FileCheck, Zap, Brain, CheckCircle, Loader2 } from 'lucide-react';

const ProcessingAnimation = () => {
  const steps = [
    { icon: FileCheck, label: 'File Validation', delay: 0 },
    { icon: Zap, label: 'Signal Preprocessing', delay: 0.8 },
    { icon: Brain, label: 'Feature Extraction', delay: 1.6 },
    { icon: CheckCircle, label: 'Model Inference', delay: 2.4 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md">
      <div className="max-w-2xl w-full mx-4">
        <motion.div
          className="glass-card p-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-block"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-16 w-16 text-cyan-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mt-6 mb-2">
              Analyzing Your Data
            </h2>
            <p className="text-gray-400">
              Processing sensor signals through our ML pipeline
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.label}
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay, duration: 0.4 }}
              >
                <motion.div
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step.delay + 0.2, type: 'spring', stiffness: 200 }}
                >
                  <step.icon className="h-6 w-6 text-white" />
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{step.label}</span>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: step.delay + 0.6 }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </motion.div>
                  </div>
                  <motion.div
                    className="h-2 bg-gray-700 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: step.delay }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ delay: step.delay + 0.2, duration: 0.6, ease: 'easeOut' }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            <p>This usually takes just a few seconds...</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
