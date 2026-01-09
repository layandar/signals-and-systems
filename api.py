# api.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from har_utils import HARPredictor
import joblib
import pandas as pd
import numpy as np
from io import StringIO
import traceback
from scipy.signal import medfilt, butter, filtfilt
from scipy.fft import rfft, rfftfreq
from scipy.stats import skew, kurtosis


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

@app.post("/predict")
async def predict_activity(file: UploadFile = File(...)):
    try:
        
        contents = await file.read()
        
        
        try:
            
            data = pd.read_csv(StringIO(contents.decode()), delim_whitespace=True, header=None)
            print("Loaded as space-separated file without headers")
        except:
            try:
                #
                data = pd.read_csv(StringIO(contents.decode()))
                print("Loaded as CSV with headers")
            except:
                try:
                    
                    data = pd.read_csv(StringIO(contents.decode()), header=None)
                    print("Loaded as CSV without headers")
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")
        
        print(f"File shape: {data.shape}")
        print("First few rows:")
        print(data.head(3))
        
        
        if data.shape[1] != 6:
            raise HTTPException(
                status_code=400, 
                detail=f"Expected 6 columns (acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z). Got {data.shape[1]} columns."
            )
        
        
        sensor_data = data.values
        print(f"Sensor data shape: {sensor_data.shape}")
        
        
        window_size = 128
        overlap = 64
        
        acc_windows = []
        gyro_windows = []
        
        for i in range(0, len(sensor_data) - window_size + 1, window_size - overlap):
            window = sensor_data[i:i+window_size]
            acc_window = window[:, :3]  
            gyro_window = window[:, 3:] 
            
            acc_windows.append(acc_window)
            gyro_windows.append(gyro_window)
        
        print(f"Created {len(acc_windows)} windows")
        
        
        features = []
        for i, (acc_win, gyro_win) in enumerate(zip(acc_windows, gyro_windows)):
            if i % 10 == 0:
                print(f"Processing window {i+1}/{len(acc_windows)}")
            
            window_features = process_single_window(acc_win, gyro_win)
            features.append(window_features)
        
        features = np.array(features)
        print(f"Final features shape: {features.shape}")
        
        
        if features.shape[1] != predictor.scaler.n_features_in_:
            raise HTTPException(
                status_code=500, 
                detail=f"Feature extraction error: Got {features.shape[1]} features, expected {predictor.scaler.n_features_in_}"
            )
        
        
        features = np.nan_to_num(features, nan=0.0)
        features_scaled = predictor.scaler.transform(features)
        
        
        predictions = predictor.model.predict(features_scaled)
        
        
        if hasattr(predictor.model, 'predict_proba'):
            probabilities = predictor.model.predict_proba(features_scaled)
            confidence_scores = np.max(probabilities, axis=1) * 100
        else:
            
            confidence_scores = np.ones(len(predictions)) * 85
        
        
        if hasattr(predictor, 'activity_mapping'):
            if isinstance(predictor.activity_mapping, dict):
                activity_names = [predictor.activity_mapping.get(pred, f"Unknown_{pred}") for pred in predictions]
            else:
                activity_names = [predictor.activity_mapping[pred] for pred in predictions]
        else:
            activity_names = [f"Activity_{pred}" for pred in predictions]
        
        return {
            "success": True,
            "filename": file.filename,
            "predictions": activity_names,
            "confidence_scores": confidence_scores.tolist(),
            "total_windows": len(predictions),
            "message": "Analysis completed successfully"
        }
        
    except Exception as e:
        print(f"Error details: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "HAR API is running!"}

@app.get("/activities")
async def get_activities():
    return {
        "activities": predictor.activity_mapping,
        "available_activities": list(predictor.activity_mapping.values())
    }

if __name__ == "__main__":
    import uvicorn
    print(" Starting HAR API server...")
    print(" Available at: http://localhost:8030")
    print(" Documentation: http://localhost:8030/docs")
    uvicorn.run(app, host="0.0.0.0", port=8030)