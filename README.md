# Human Activity Recognition (HAR) System

A professional full-stack web application for Human Activity Recognition using IMU sensor data. This system uses machine learning to classify human activities from accelerometer and gyroscope data with high accuracy.

## 🌟 Features

- **Professional Web Interface**: Modern React + Tailwind CSS UI
- **Drag & Drop Upload**: Support for CSV, TXT, and XLSX files
- **Real-time Analysis**: Fast prediction using trained SVM model
- **Interactive Visualizations**: 
  - Time-domain signal plots
  - Frequency-domain FFT analysis
  - Confidence scores and probability distributions
- **Comprehensive Results**: Detailed metadata and prediction analytics
- **Robust Error Handling**: Clear feedback for validation errors
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🏗️ Architecture

### Backend (FastAPI)
- **har_utils.py** – Signal processing pipeline (filtering, feature extraction)
- **api.py** – REST API endpoints for predictions and health checks
- **har_predictor_complete.pkl** – Trained SVM model and scaler

### Frontend (React)
- **Upload Page** – Drag-and-drop file upload with validation
- **Results Page** – Interactive charts and prediction dashboard
- **About Page** – System documentation and technical details

## 📋 Requirements

### Backend
- Python 3.8+
- FastAPI
- scikit-learn
- scipy
- pandas
- NumPy
- joblib
- openpyxl (for Excel support)

### Frontend
- Node.js 16+
- npm or yarn

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to project root
cd signals-and-systems

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python api.py
```

The API will be available at `http://localhost:8030`
- API Docs: http://localhost:8030/docs
- Health Check: http://localhost:8030/api/health

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Usage

1. Open http://localhost:5173 in your browser
2. Upload a sensor data file (CSV, TXT, or XLSX)
   - File must contain 6 columns: `acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z`
   - Minimum 128 samples required
3. Click "Analyze Activity"
4. View detailed results with charts and predictions

## 📁 Project Structure

```
signals-and-systems/
├── backend/
│   ├── api.py                          # FastAPI backend
│   ├── har_utils.py                    # Signal processing utilities
│   ├── har_predictor_complete.pkl      # Trained ML model
│   └── requirements.txt                # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js              # API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Navigation component
│   │   │   └── LoadingSpinner.jsx     # Loading state
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx         # File upload page
│   │   │   ├── ResultsPage.jsx        # Results dashboard
│   │   │   └── AboutPage.jsx          # About page
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css                  # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── final_test.ipynb                   # Testing notebook
├── highacc.ipynb                      # Training notebook
└── README.md
```

## 🔧 API Endpoints

### `GET /api/health`
Health check endpoint
```json
{
  "ok": true,
  "status": "running",
  "model_loaded": true
}
```

### `POST /api/predict`
Predict activity from uploaded file

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (CSV/TXT/XLSX)

**Response:**
```json
{
  "activity": "WALKING",
  "confidence": 0.92,
  "probabilities": {
    "WALKING": 0.92,
    "SITTING": 0.04,
    "STANDING": 0.02,
    ...
  },
  "meta": {
    "samples": 1200,
    "channels": 6,
    "sampling_rate": 50,
    "windows_analyzed": 18,
    "filename": "test_data.csv"
  },
  "signals_preview": {
    "t": [0, 0.02, ...],
    "acc_x": [...],
    "acc_y": [...],
    "acc_z": [...],
    "gyro_x": [...],
    "gyro_y": [...],
    "gyro_z": [...]
  },
  "fft_preview": {
    "freq": [...],
    "mag_acc_x": [...],
    "mag_acc_y": [...],
    "mag_acc_z": [...]
  }
}
```

### `GET /api/activities`
Get available activity labels

## 🧪 Testing

### Sample Data Format

Your input file should have 6 columns (no headers required):

```
acc_x    acc_y    acc_z    gyro_x   gyro_y   gyro_z
0.257    0.923   -0.115    0.024   -0.015    0.003
0.261    0.931   -0.121    0.026   -0.012    0.001
...
```

Supported formats:
- **CSV**: Comma-separated values
- **TXT**: Space/tab-separated values
- **XLSX**: Excel spreadsheet

### Testing with curl

```bash
curl -X POST http://localhost:8030/api/predict \
  -F "file=@your_data.csv"
```

## 🎨 UI Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Smooth Animations**: Fade-in and slide-up transitions
- **Interactive Charts**: Recharts-powered visualizations
- **Responsive Layout**: Mobile-friendly design
- **Toast Notifications**: Real-time feedback for user actions
- **Error Handling**: Clear error messages and validation

## 📊 Technical Details

### Signal Processing Pipeline

1. **Window Segmentation**: 2.56s windows (128 samples) with 50% overlap
2. **Gravity Separation**: Butterworth low-pass filter (0.3 Hz cutoff)
3. **Derived Signals**: Compute jerk (time derivative) and magnitude
4. **Feature Extraction**: 561 features per window
   - Time-domain: mean, std, entropy, AR coefficients, etc.
   - Frequency-domain: FFT, power spectral density, spectral entropy
5. **Normalization**: Standard scaling
6. **Classification**: SVM model with probability estimates

### Supported Activities

- Walking
- Walking Upstairs
- Walking Downstairs
- Sitting
- Standing
- Laying

## 🛠️ Development

### Build for Production

```bash
# Backend: Already production-ready with uvicorn
python api.py

# Frontend: Build optimized production bundle
cd frontend
npm run build
npm run preview
```

### Environment Variables

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:8030
```

## 📝 Notes

- Maximum file size: 10MB
- Sampling rate: 50Hz
- Window size: 128 samples (2.56 seconds)
- Minimum data required: 128 samples
- Model accuracy: ~95% on UCI-HAR dataset

## 🤝 Contributing

This is a research/educational project. Feel free to fork and enhance!

## 📄 License

MIT License - Feel free to use for educational and research purposes.

## 🙏 Acknowledgments

- UCI HAR Dataset for training data
- FastAPI for the excellent web framework
- React and Tailwind CSS for the frontend stack
