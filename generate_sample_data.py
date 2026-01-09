"""
Sample Data Generator for HAR System Testing
Generates synthetic IMU sensor data for testing the HAR system
"""

import numpy as np
import pandas as pd

def generate_walking_data(n_samples=256, freq=50):
    """Generate synthetic walking pattern data"""
    t = np.arange(n_samples) / freq
    
    # Walking has periodic acceleration patterns
    # Typical walking frequency: 1-2 Hz
    walking_freq = 1.5
    
    # Accelerometer data (with gravity component)
    acc_x = 0.1 * np.sin(2 * np.pi * walking_freq * t) + np.random.normal(0, 0.05, n_samples)
    acc_y = 0.9 + 0.2 * np.sin(2 * np.pi * walking_freq * t + np.pi/4) + np.random.normal(0, 0.05, n_samples)
    acc_z = 0.1 * np.sin(2 * np.pi * walking_freq * t + np.pi/2) + np.random.normal(0, 0.05, n_samples)
    
    # Gyroscope data (angular velocity)
    gyro_x = 0.05 * np.sin(2 * np.pi * walking_freq * t) + np.random.normal(0, 0.02, n_samples)
    gyro_y = 0.03 * np.sin(2 * np.pi * walking_freq * t + np.pi/3) + np.random.normal(0, 0.02, n_samples)
    gyro_z = 0.04 * np.sin(2 * np.pi * walking_freq * t + np.pi/6) + np.random.normal(0, 0.02, n_samples)
    
    return acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z

def generate_sitting_data(n_samples=256):
    """Generate synthetic sitting (stationary) data"""
    
    # Sitting: mostly gravity, minimal movement
    acc_x = np.random.normal(0.05, 0.02, n_samples)
    acc_y = np.random.normal(0.05, 0.02, n_samples)
    acc_z = np.random.normal(0.98, 0.02, n_samples)  # Gravity component
    
    # Very low gyroscope activity
    gyro_x = np.random.normal(0, 0.01, n_samples)
    gyro_y = np.random.normal(0, 0.01, n_samples)
    gyro_z = np.random.normal(0, 0.01, n_samples)
    
    return acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z

def generate_standing_data(n_samples=256):
    """Generate synthetic standing data"""
    
    # Standing: gravity + small postural movements
    acc_x = np.random.normal(0.02, 0.03, n_samples)
    acc_y = np.random.normal(0.03, 0.03, n_samples)
    acc_z = np.random.normal(0.97, 0.03, n_samples)
    
    gyro_x = np.random.normal(0, 0.015, n_samples)
    gyro_y = np.random.normal(0, 0.015, n_samples)
    gyro_z = np.random.normal(0, 0.015, n_samples)
    
    return acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z

def save_sample_data(filename, activity='walking', n_samples=256):
    """Generate and save sample data to file"""
    
    if activity.lower() == 'walking':
        data = generate_walking_data(n_samples)
    elif activity.lower() == 'sitting':
        data = generate_sitting_data(n_samples)
    elif activity.lower() == 'standing':
        data = generate_standing_data(n_samples)
    else:
        raise ValueError(f"Unknown activity: {activity}")
    
    # Create DataFrame
    df = pd.DataFrame({
        'acc_x': data[0],
        'acc_y': data[1],
        'acc_z': data[2],
        'gyro_x': data[3],
        'gyro_y': data[4],
        'gyro_z': data[5]
    })
    
    # Save without headers (as expected by the system)
    if filename.endswith('.csv'):
        df.to_csv(filename, index=False, header=False)
    elif filename.endswith('.txt'):
        df.to_csv(filename, index=False, header=False, sep=' ')
    elif filename.endswith('.xlsx'):
        df.to_excel(filename, index=False, header=False)
    else:
        raise ValueError("Filename must end with .csv, .txt, or .xlsx")
    
    print(f"✓ Generated {activity} data: {filename}")
    print(f"  Samples: {n_samples}")
    print(f"  Shape: {df.shape}")

if __name__ == "__main__":
    print("=" * 50)
    print("HAR System - Sample Data Generator")
    print("=" * 50)
    print()
    
    # Generate sample files for testing
    save_sample_data('sample_walking.csv', 'walking', 300)
    save_sample_data('sample_sitting.csv', 'sitting', 300)
    save_sample_data('sample_standing.csv', 'standing', 300)
    save_sample_data('sample_walking.txt', 'walking', 300)
    save_sample_data('sample_walking.xlsx', 'walking', 300)
    
    print()
    print("=" * 50)
    print("Sample files generated successfully!")
    print("You can now upload these files to test the HAR system.")
    print("=" * 50)
