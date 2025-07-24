// NeuroFuel Speed Tracker Application
class SpeedTracker {
  constructor() {
    this.isTracking = false;
    this.useMeters = false; // false = km, true = meters
    this.currentPosition = null;
    this.trackingPath = [];
    this.startTime = null;
    this.totalDistance = 0;
    this.kmSplits = [];
    this.lastKmDistance = 0;
    this.sessionTimer = null;
    this.gpsWatchId = null;
    this.map = null;
    this.trackPolyline = null;
    this.currentMarker = null;
    
    // Performance tracking
    this.speedHistory = [];
    this.lastUpdateTime = null;
    
    this.initializeApp();
  }

  initializeApp() {
    this.initializeMap();
    this.bindEvents();
    this.loadSessions();
    this.updateDisplay();
  }

  initializeMap() {
    // Create a simple map display without external dependencies
    const mapElement = document.getElementById('map');
    
    // Set up map placeholder with tracking info
    const placeholder = mapElement.querySelector('.map-placeholder');
    if (placeholder) {
      // Map is ready for basic display
      this.updateMapStatus('Map ready - GPS tracking will show path info');
    }

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        this.updateCurrentPosition(lat, lng);
        this.updateMapStatus('GPS signal acquired');
      }, (error) => {
        console.warn('Geolocation error:', error);
        this.updateMapStatus('GPS signal not available - tracking may be limited');
      });
    } else {
      this.updateMapStatus('GPS not supported by this browser');
    }
  }

  bindEvents() {
    // Control buttons
    document.getElementById('startBtn').addEventListener('click', () => this.startTracking());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopTracking());
    document.getElementById('saveBtn').addEventListener('click', () => this.showSaveModal());
    document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
    
    // Unit toggle
    document.getElementById('unitToggle').addEventListener('change', (e) => {
      this.useMeters = e.target.checked;
      this.updateUnitLabels();
      this.updateDisplay();
    });
    
    // Modal events
    document.getElementById('saveSessionBtn').addEventListener('click', () => this.saveSession());
    document.getElementById('cancelSaveBtn').addEventListener('click', () => this.hideSaveModal());
    document.getElementById('closeHistoryBtn').addEventListener('click', () => this.hideHistory());
    document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  }

  updateUnitLabels() {
    const speedUnit = this.useMeters ? 'm/s' : 'km/h';
    const distanceUnit = this.useMeters ? 'm' : 'km';
    
    document.getElementById('speedUnit').textContent = speedUnit;
    document.getElementById('distanceUnit').textContent = distanceUnit;
    document.getElementById('avgSpeedUnit').textContent = speedUnit;
  }

  startTracking() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    this.isTracking = true;
    this.startTime = new Date();
    this.totalDistance = 0;
    this.trackingPath = [];
    this.kmSplits = [];
    this.lastKmDistance = 0;
    this.speedHistory = [];
    this.lastUpdateTime = null;

    // Clear previous track display
    document.getElementById('pathPoints').textContent = '0';
    this.updateMapStatus('Ready to track');

    // Update UI
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('saveBtn').disabled = true;
    document.getElementById('splitInfo').style.display = 'none';

    // Start GPS tracking
    this.gpsWatchId = navigator.geolocation.watchPosition(
      (position) => this.updatePosition(position),
      (error) => this.handleGPSError(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

    // Start timer
    this.sessionTimer = setInterval(() => this.updateTimer(), 1000);

    console.log('Tracking started');
  }

  stopTracking() {
    this.isTracking = false;

    // Stop GPS tracking
    if (this.gpsWatchId) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }

    // Stop timer
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    // Update UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('saveBtn').disabled = false;

    console.log('Tracking stopped');
  }

  updatePosition(position) {
    const newPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: new Date(),
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || 0
    };

    if (this.currentPosition) {
      // Calculate distance from last position
      const distance = this.calculateDistance(
        this.currentPosition.lat,
        this.currentPosition.lng,
        newPosition.lat,
        newPosition.lng
      );

      // Only update if we've moved significantly and accuracy is good
      if (distance > 0.005 && position.coords.accuracy < 50) { // 5m minimum movement
        this.totalDistance += distance;
        this.trackingPath.push([newPosition.lat, newPosition.lng]);

        // Update map display
        this.updateMapTrack();
        
        // Check for kilometer completion
        this.checkKilometerCompletion();
        
        // Calculate and store speed
        this.updateSpeed(newPosition, distance);
      }
    } else {
      // First position
      this.trackingPath.push([newPosition.lat, newPosition.lng]);
      this.updateCurrentPosition(newPosition.lat.toFixed(6), newPosition.lng.toFixed(6));
    }

    this.currentPosition = newPosition;
    this.updateDisplay();
  }

  updateCurrentPosition(lat, lng) {
    document.getElementById('currentPos').textContent = `${lat}, ${lng}`;
  }

  updateMapStatus(status) {
    document.getElementById('mapStatus').textContent = status;
  }

  updateMapTrack() {
    // Update path info in the map display
    document.getElementById('pathPoints').textContent = this.trackingPath.length;
    
    if (this.trackingPath.length > 1) {
      this.updateMapStatus(`Tracking path with ${this.trackingPath.length} points`);
    }
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  updateSpeed(newPosition, distance) {
    const now = newPosition.timestamp.getTime();
    
    if (this.lastUpdateTime) {
      const timeDiff = (now - this.lastUpdateTime) / 1000; // seconds
      if (timeDiff > 0) {
        const speed = (distance / timeDiff) * 3.6; // Convert to km/h
        this.speedHistory.push(speed);
        
        // Keep only last 10 speed readings for smoothing
        if (this.speedHistory.length > 10) {
          this.speedHistory.shift();
        }
      }
    }
    
    this.lastUpdateTime = now;
  }

  getCurrentSpeed() {
    if (this.speedHistory.length === 0) return 0;
    
    // Return average of recent speeds for smoothing
    const sum = this.speedHistory.reduce((a, b) => a + b, 0);
    const avgSpeed = sum / this.speedHistory.length;
    
    return this.useMeters ? avgSpeed / 3.6 : avgSpeed; // Convert to m/s if needed
  }

  getAverageSpeed() {
    if (!this.startTime || this.totalDistance === 0) return 0;
    
    const timeElapsedHours = (new Date() - this.startTime) / (1000 * 60 * 60);
    const avgSpeed = this.totalDistance / timeElapsedHours;
    
    return this.useMeters ? avgSpeed / 3.6 : avgSpeed;
  }



  checkKilometerCompletion() {
    const kmCompleted = Math.floor(this.totalDistance);
    const lastKmCompleted = Math.floor(this.lastKmDistance);
    
    if (kmCompleted > lastKmCompleted) {
      // New kilometer completed!
      const kmTime = new Date() - this.startTime;
      const kmSpeed = this.getAverageSpeed();
      
      this.kmSplits.push({
        km: kmCompleted,
        time: kmTime,
        speed: kmSpeed,
        timestamp: new Date()
      });
      
      this.showKilometerSplit(kmCompleted, kmTime, kmSpeed);
      this.playKilometerAlert();
      
      this.lastKmDistance = this.totalDistance;
    }
  }

  showKilometerSplit(km, time, speed) {
    const splitInfo = document.getElementById('splitInfo');
    const splitTime = document.getElementById('splitTime');
    const splitSpeed = document.getElementById('splitSpeed');
    
    const timeStr = this.formatTime(time);
    const speedStr = this.useMeters ? 
      `${speed.toFixed(1)} m/s` : 
      `${speed.toFixed(1)} km/h`;
    
    splitTime.textContent = timeStr;
    splitSpeed.textContent = speedStr;
    splitInfo.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
      splitInfo.style.display = 'none';
    }, 5000);
  }

  playKilometerAlert() {
    // Try to vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Play beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  updateTimer() {
    if (!this.startTime) return;
    
    const elapsed = new Date() - this.startTime;
    document.getElementById('sessionTime').textContent = this.formatTime(elapsed);
  }

  updateDisplay() {
    // Update speed
    const currentSpeed = this.getCurrentSpeed();
    document.getElementById('currentSpeed').textContent = currentSpeed.toFixed(1);
    
    // Update distance
    const distance = this.useMeters ? 
      (this.totalDistance * 1000).toFixed(0) : 
      this.totalDistance.toFixed(2);
    document.getElementById('totalDistance').textContent = distance;
    
    // Update average speed
    const avgSpeed = this.getAverageSpeed();
    document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(1);
  }

  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const sec = seconds % 60;
    const min = minutes % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    } else {
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
  }

  handleGPSError(error) {
    console.error('GPS Error:', error);
    let message = 'GPS Error: ';
    switch(error.code) {
      case error.PERMISSION_DENIED:
        message += 'Location access denied. Please enable location services.';
        break;
      case error.POSITION_UNAVAILABLE:
        message += 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        message += 'Location request timed out.';
        break;
      default:
        message += 'An unknown error occurred.';
        break;
    }
    alert(message);
  }

  showSaveModal() {
    document.getElementById('saveModal').style.display = 'block';
    document.getElementById('sessionNotes').focus();
  }

  hideSaveModal() {
    document.getElementById('saveModal').style.display = 'none';
    document.getElementById('sessionNotes').value = '';
  }

  saveSession() {
    if (!this.startTime) return;
    
    const sessionData = {
      id: Date.now(),
      date: new Date().toISOString(),
      startTime: this.startTime.toISOString(),
      endTime: new Date().toISOString(),
      duration: new Date() - this.startTime,
      distance: this.totalDistance,
      averageSpeed: this.getAverageSpeed(),
      path: this.trackingPath,
      splits: this.kmSplits,
      notes: document.getElementById('sessionNotes').value,
      units: this.useMeters ? 'meters' : 'kilometers'
    };
    
    this.saveSessionToStorage(sessionData);
    this.hideSaveModal();
    
    // Reset tracking data
    this.resetSession();
    
    alert('Session saved successfully!');
  }

  resetSession() {
    this.startTime = null;
    this.totalDistance = 0;
    this.trackingPath = [];
    this.kmSplits = [];
    this.speedHistory = [];
    this.currentPosition = null;
    
    document.getElementById('sessionTime').textContent = '00:00:00';
    document.getElementById('currentPos').textContent = 'Unknown';
    document.getElementById('pathPoints').textContent = '0';
    this.updateMapStatus('Ready for new session');
    this.updateDisplay();
  }

  saveSessionToStorage(sessionData) {
    let sessions = JSON.parse(localStorage.getItem('speedTrackerSessions') || '[]');
    sessions.push(sessionData);
    localStorage.setItem('speedTrackerSessions', JSON.stringify(sessions));
  }

  loadSessions() {
    const sessions = JSON.parse(localStorage.getItem('speedTrackerSessions') || '[]');
    return sessions;
  }

  showHistory() {
    const sessions = this.loadSessions();
    const historyList = document.getElementById('historyList');
    
    if (sessions.length === 0) {
      historyList.innerHTML = '<p class="no-sessions">No sessions recorded yet.</p>';
    } else {
      historyList.innerHTML = '';
      sessions.reverse().forEach(session => {
        const historyItem = this.createHistoryItem(session);
        historyList.appendChild(historyItem);
      });
    }
    
    document.getElementById('historyModal').style.display = 'block';
  }

  createHistoryItem(session) {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    const date = new Date(session.date);
    const distance = session.units === 'meters' ? 
      `${(session.distance * 1000).toFixed(0)} m` : 
      `${session.distance.toFixed(2)} km`;
    const speed = session.units === 'meters' ? 
      `${session.averageSpeed.toFixed(1)} m/s` : 
      `${session.averageSpeed.toFixed(1)} km/h`;
    
    item.innerHTML = `
      <div class="history-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
      <div class="history-stats">
        <div class="history-stat">
          <div class="history-stat-value">${distance}</div>
          <div class="history-stat-label">Distance</div>
        </div>
        <div class="history-stat">
          <div class="history-stat-value">${speed}</div>
          <div class="history-stat-label">Avg Speed</div>
        </div>
        <div class="history-stat">
          <div class="history-stat-value">${this.formatTime(session.duration)}</div>
          <div class="history-stat-label">Duration</div>
        </div>
        <div class="history-stat">
          <div class="history-stat-value">${session.splits.length}</div>
          <div class="history-stat-label">Km Splits</div>
        </div>
      </div>
      ${session.notes ? `<div class="history-notes">"${session.notes}"</div>` : ''}
    `;
    
    return item;
  }

  hideHistory() {
    document.getElementById('historyModal').style.display = 'none';
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear all session history? This cannot be undone.')) {
      localStorage.removeItem('speedTrackerSessions');
      this.showHistory(); // Refresh the history display
    }
  }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
  new SpeedTracker();
});
