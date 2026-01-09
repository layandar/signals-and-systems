# api.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from har_utils import HARPredictor
import joblib
import pandas as pd
import numpy as np
from io import StringIO, BytesIO
import traceback
from scipy.signal import medfilt, butter, filtfilt
from scipy.fft import rfft, rfftfreq
from scipy.stats import skew, kurtosis
import openpyxl
from collections import Counter


app = FastAPI(
    title="HAR API",
    description="Human Activity Recognition API for motion analysis",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


try:
    predictor = joblib.load('har_predictor_complete.pkl')
    print(" HAR Model loaded successfully!")
    print(f"Scaler expects {predictor.scaler.n_features_in_} features")
except Exception as e:
    print(f" Failed to load model: {e}")
    raise e

FS = 50        # Hz
WIN_S = 128    # 2.56 s window

def butter_lowpass_filter(data, cutoff, fs=FS, order=3):
    nyq = 0.5 * fs
    b, a = butter(order, cutoff / nyq, btype='low')
    return filtfilt(b, a, data, axis=0)

def median_filter(data, kernel_size=3):
    if data.ndim == 1:
        return medfilt(data, kernel_size)
    out = np.zeros_like(data)
    for ax in range(data.shape[1]):
        out[:, ax] = medfilt(data[:, ax], kernel_size)
    return out

def compute_gravity(total_acc):
    return butter_lowpass_filter(total_acc, 0.3, order=4)

def compute_body_acc(total_acc):
    gravity = compute_gravity(total_acc)
    return total_acc - gravity

def compute_jerk(signal):
    return np.gradient(signal, axis=0) * FS

def magnitude(signal):
    return np.sqrt(np.sum(signal**2, axis=1))

def ar_coeffs_lstsq(x, order=4):
    x = np.asarray(x).flatten()
    N = x.size
    if N <= order:
        return [0.0] * order
    Y = x[order:]
    X = np.column_stack([x[order - k: N - k] for k in range(1, order + 1)])
    coeffs, *_ = np.linalg.lstsq(X, Y, rcond=None)
    return coeffs.flatten().tolist()

def signal_entropy(x, bins=30):
    hist, _ = np.histogram(x, bins=bins, density=True)
    hist = hist[hist > 0]
    entropy = -np.sum(hist * np.log2(hist + 1e-12))
    return entropy if np.isfinite(entropy) else 0.0

def time_domain_features(sig):
    sig = np.asarray(sig, dtype=float)
    
    if np.all(sig == sig[0]):
        return [0.0] * 16
    
    mean = sig.mean()
    std = sig.std()
    mad = np.median(np.abs(sig - np.median(sig)))
    maxi = sig.max()
    mini = sig.min()
    sma = np.mean(np.abs(sig))
    energy = np.sum(sig**2) / (sig.size + 1e-12)
    iqr = np.percentile(sig, 75) - np.percentile(sig, 25)
    ent = signal_entropy(sig)
    ar = ar_coeffs_lstsq(sig, order=4)
    sk = skew(sig, nan_policy='omit')
    kt = kurtosis(sig, nan_policy='omit')
    
    features = [mean, std, mad, maxi, mini, sma, energy, iqr, ent] + ar + [sk, kt]
    return [0.0 if not np.isfinite(f) else f for f in features]

def freq_domain_features(sig, fs=FS):
    N = len(sig)
    if N == 0:
        return [0.0] * 12
    
    fft_vals = rfft(sig * np.hanning(N))
    psd = np.abs(fft_vals)**2
    freqs = rfftfreq(N, 1/fs)
    
    if psd.sum() == 0:
        return [0.0] * 12
    
    psd_sum = psd.sum() + 1e-12
    meanFreq = (freqs * psd).sum() / psd_sum
    maxFreq = freqs[np.argmax(psd)] if psd.max() > 0 else 0.0
    sk = skew(psd, nan_policy='omit')
    kt = kurtosis(psd, nan_policy='omit')
    
    nbands = 8
    band_edges = np.linspace(0, len(psd), nbands + 1, dtype=int)
    bands = [psd[band_edges[i]:band_edges[i+1]].sum() for i in range(nbands)]
    
    features = [meanFreq, maxFreq, sk, kt] + bands
    return [0.0 if not np.isfinite(f) else f for f in features]

def features_from_window(signals_dict):
    fv = []
    tri_signals = ['tBodyAcc','tGravityAcc','tBodyAccJerk','tBodyGyro','tBodyGyroJerk']
    for name in tri_signals:
        X = signals_dict[name]
        for ax in range(3):
            s = X[:, ax]
            fv += time_domain_features(s)
            fv += freq_domain_features(s)
    
    mag_signals = ['tBodyAccMag','tGravityAccMag','tBodyAccJerkMag','tBodyGyroMag','tBodyGyroJerkMag']
    for m in mag_signals:
        s = signals_dict[m]
        fv += time_domain_features(s)
        fv += freq_domain_features(s)
    
    fv_array = np.array(fv)
    if np.any(~np.isfinite(fv_array)):
        fv_array[~np.isfinite(fv_array)] = 0.0
    
    return fv_array

def process_single_window(tAcc_window, gyro_window):
    """Process a single window of data (128 time steps, 3 axes)"""
    
    tAccJerk = compute_jerk(tAcc_window)
    gyroJerk = compute_jerk(gyro_window)
    
    tAccMag = magnitude(tAcc_window)
    gravityMag = magnitude(compute_gravity(tAcc_window))
    tAccJerkMag = magnitude(tAccJerk)
    gyroMag = magnitude(gyro_window)
    gyroJerkMag = magnitude(gyroJerk)
    
    signals_win = {
        'tBodyAcc': tAcc_window,
        'tGravityAcc': compute_gravity(tAcc_window),
        'tBodyAccJerk': tAccJerk,
        'tBodyGyro': gyro_window,
        'tBodyGyroJerk': gyroJerk,
        'tBodyAccMag': tAccMag,
        'tGravityAccMag': gravityMag,
        'tBodyAccJerkMag': tAccJerkMag,
        'tBodyGyroMag': gyroMag,
        'tBodyGyroJerkMag': gyroJerkMag
    }
    
    return features_from_window(signals_win)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"ok": True, "status": "running", "model_loaded": predictor is not None}

def parse_file_content(contents: bytes, filename: str):
    """Parse uploaded file content based on file extension"""
    try:
        # Try Excel first if .xlsx
        if filename.lower().endswith('.xlsx'):
            df = pd.read_excel(BytesIO(contents), header=None)
            return df
        
        # Try space-separated (common for .txt files)
        try:
            data = pd.read_csv(StringIO(contents.decode()), delim_whitespace=True, header=None)
            return data
        except:
            pass
        
        # Try CSV with headers
        try:
            data = pd.read_csv(StringIO(contents.decode()))
            return data
        except:
            pass
        
        # Try CSV without headers
        try:
            data = pd.read_csv(StringIO(contents.decode()), header=None)
            return data
        except:
            pass
        
        raise ValueError("Unable to parse file. Ensure it's a valid CSV, TXT, or XLSX file.")
    
    except Exception as e:
        raise ValueError(f"File parsing error: {str(e)}")

def compute_fft_preview(signal, fs=50, max_samples=500):
    """Compute FFT for preview (limited samples for performance)"""
    if len(signal) > max_samples:
        signal = signal[:max_samples]
    
    N = len(signal)
    fft_vals = rfft(signal * np.hanning(N))
    magnitude = np.abs(fft_vals)
    freqs = rfftfreq(N, 1/fs)
    
    return freqs.tolist(), magnitude.tolist()

@app.post("/api/predict")
async def predict_activity(file: UploadFile = File(...)):
    """Main prediction endpoint"""
    try:
        # Validate file extension
        allowed_extensions = ['.csv', '.txt', '.xlsx']
        file_ext = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read file content
        contents = await file.read()
        
        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Parse file
        data = parse_file_content(contents, file.filename)
        
        if data.shape[1] < 6:
            raise HTTPException(
                status_code=400, 
                detail=f"Expected at least 6 columns (acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z). Got {data.shape[1]} columns."
            )
        
        # Extract sensor data
        sensor_data = data.values
        
        # Window segmentation
        window_size = 128
        overlap = 64
        
        acc_windows = []
        gyro_windows = []
        
        for i in range(0, len(sensor_data) - window_size + 1, window_size - overlap):
            window = sensor_data[i:i+window_size]
            acc_window = window[:, :3]  
            gyro_window = window[:, 3:6]
            
            acc_windows.append(acc_window)
            gyro_windows.append(gyro_window)
        
        if len(acc_windows) == 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient data. Need at least {window_size} samples."
            )
        
        # Feature extraction
        features = []
        for acc_win, gyro_win in zip(acc_windows, gyro_windows):
            window_features = process_single_window(acc_win, gyro_win)
            features.append(window_features)
        
        features = np.array(features)
        
        # Validate feature dimensions
        if features.shape[1] != predictor.scaler.n_features_in_:
            raise HTTPException(
                status_code=500, 
                detail=f"Feature extraction error: Got {features.shape[1]} features, expected {predictor.scaler.n_features_in_}"
            )
        
        # Predict
        features = np.nan_to_num(features, nan=0.0)
        features_scaled = predictor.scaler.transform(features)
        predictions = predictor.model.predict(features_scaled)
        
        # Get probabilities if available
        probabilities_data = None
        confidence_score = 0.0
        
        if hasattr(predictor.model, 'predict_proba'):
            proba = predictor.model.predict_proba(features_scaled)
            # Average probabilities across all windows
            avg_proba = np.mean(proba, axis=0)
            confidence_score = float(np.max(avg_proba))
            
            # Map to activity names
            if hasattr(predictor, 'activity_mapping'):
                class_labels = [predictor.activity_mapping.get(i, f"Activity_{i}") 
                               for i in range(len(avg_proba))]
                probabilities_data = {label: float(prob) for label, prob in zip(class_labels, avg_proba)}
        
        # Get activity names
        if hasattr(predictor, 'activity_mapping'):
            activity_names = [predictor.activity_mapping.get(pred, f"Unknown_{pred}") 
                            for pred in predictions]
        else:
            activity_names = [f"Activity_{pred}" for pred in predictions]
        
        # Determine most common activity
        activity_counter = Counter(activity_names)
        most_common_activity = activity_counter.most_common(1)[0][0]
        
        # Generate signal preview (first window)
        preview_samples = min(256, len(sensor_data))
        time_axis = (np.arange(preview_samples) / FS).tolist()
        
        signals_preview = {
            "t": time_axis,
            "acc_x": sensor_data[:preview_samples, 0].tolist(),
            "acc_y": sensor_data[:preview_samples, 1].tolist(),
            "acc_z": sensor_data[:preview_samples, 2].tolist(),
            "gyro_x": sensor_data[:preview_samples, 3].tolist(),
            "gyro_y": sensor_data[:preview_samples, 4].tolist(),
            "gyro_z": sensor_data[:preview_samples, 5].tolist(),
        }
        
        # Generate FFT preview
        freq_x, mag_x = compute_fft_preview(sensor_data[:preview_samples, 0])
        freq_y, mag_y = compute_fft_preview(sensor_data[:preview_samples, 1])
        freq_z, mag_z = compute_fft_preview(sensor_data[:preview_samples, 2])
        
        fft_preview = {
            "freq": freq_x,
            "mag_acc_x": mag_x,
            "mag_acc_y": mag_y,
            "mag_acc_z": mag_z,
        }
        
        # Metadata
        meta = {
            "samples": int(len(sensor_data)),
            "channels": 6,
            "sampling_rate": FS,
            "windows_analyzed": len(predictions),
            "filename": file.filename
        }
        
        return {
            "activity": most_common_activity,
            "confidence": confidence_score,
            "probabilities": probabilities_data,
            "meta": meta,
            "signals_preview": signals_preview,
            "fft_preview": fft_preview,
            "all_predictions": activity_names,
            "prediction_distribution": dict(activity_counter)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "HAR API is running!", "version": "2.0.0"}

@app.get("/api/activities")
async def get_activities():
    """Get available activity labels"""
    if hasattr(predictor, 'activity_mapping'):
        return {
            "activities": predictor.activity_mapping,
            "available_activities": list(predictor.activity_mapping.values())
        }
    return {"activities": {}, "available_activities": []}

if __name__ == "__main__":
    import uvicorn
    print(" Starting HAR API server...")
    print(" Available at: http://localhost:8030")
    print(" Documentation: http://localhost:8030/docs")
    uvicorn.run(app, host="0.0.0.0", port=8030)