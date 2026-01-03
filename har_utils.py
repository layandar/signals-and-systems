import pandas as pd
import numpy as np
import joblib
from scipy.signal import medfilt, butter, filtfilt
from scipy.fft import rfft, rfftfreq
from scipy.stats import skew, kurtosis

FS = 50        # Hz
WIN_S = 128    # 2.56 s window

def butter_lowpass_filter(data, cutoff, fs=50, order=3):
    nyq = 0.5 * fs
    b, a = butter(order, cutoff / nyq, btype='low')
    return filtfilt(b, a, data, axis=0)

def compute_gravity(total_acc):
    return butter_lowpass_filter(total_acc, 0.3, order=4)

def compute_jerk(signal):
    return np.gradient(signal, axis=0) * 50

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

def freq_domain_features(sig, fs=50):
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

def process_all_pre_segmented_windows(total_acc_windows, gyro_windows):
    n_windows = total_acc_windows.shape[0]
    all_features = []
    for i in range(n_windows):
        tAcc_window = total_acc_windows[i]
        gyro_window = gyro_windows[i]
        features = process_single_window(tAcc_window, gyro_window)
        all_features.append(features)
    return np.array(all_features)

def load_and_preprocess_sensor_file(file_path, expected_columns=6):
    try:
        if file_path.endswith('.txt'):
            df = pd.read_csv(file_path, sep='\s+', header=None)
        elif file_path.endswith('.csv'):
            df = pd.read_csv(file_path, header=None)
        else:
            raise ValueError("Unsupported file format. Use .txt or .csv")
        
        print(f"Loaded data shape: {df.shape}")
        
        if df.shape[1] < expected_columns:
            raise ValueError(f"Expected at least {expected_columns} columns, got {df.shape[1]}")
        
        acc_data = df.iloc[:, :3].values
        gyro_data = df.iloc[:, 3:6].values
        
        window_size = 128
        acc_windows = []
        gyro_windows = []
        
        for start_idx in range(0, len(acc_data) - window_size + 1, window_size):
            acc_window = acc_data[start_idx:start_idx + window_size]
            gyro_window = gyro_data[start_idx:start_idx + window_size]
            acc_windows.append(acc_window)
            gyro_windows.append(gyro_window)
        
        return np.array(acc_windows), np.array(gyro_windows)
        
    except Exception as e:
        print(f"Error loading file: {e}")
        return None, None


class HARPredictor:
    def __init__(self, model, scaler, activity_mapping):
        self.model = model
        self.scaler = scaler
        self.activity_mapping = activity_mapping
    
    def predict_from_file(self, file_path):
        acc_windows, gyro_windows = load_and_preprocess_sensor_file(file_path)
        if acc_windows is None or gyro_windows is None:
            return ["Error processing file"]
        return self.predict(acc_windows, gyro_windows)
    
    def predict(self, total_acc_windows, gyro_windows):
        features = process_all_pre_segmented_windows(total_acc_windows, gyro_windows)
        features = np.nan_to_num(features, nan=0.0)
        features_scaled = self.scaler.transform(features)
        preds = self.model.predict(features_scaled)
        return [self.activity_mapping[pred] for pred in preds]



