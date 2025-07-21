// Initialize empty array to store sessions
let sessions = [];
let calorieSessions = [];

// Chart setup
const ctx = document.getElementById('progressChart').getContext('2d');
let progressChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Mood',
      data: [],
      borderColor: 'blue',
      fill: false
    },
    {
      label: 'Energy',
      data: [],
      borderColor: 'orange',
      fill: false
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        suggestedMin: 1,
        suggestedMax: 5
      }
    }
  }
});

// Save session goal + mood + energy
function saveGoal() {
  const goal = document.getElementById('goalInput').value;
  const mood = parseInt(document.getElementById('moodSlider').value);
  const energy = parseInt(document.getElementById('energySlider').value);

  const timestamp = new Date().toLocaleString();
  const session = { goal, mood, energy, timestamp };

  sessions.push(session);
  updateSessionTimeline();
  updateChart();
  document.getElementById('goalInput').value = '';
}

// Update timeline UI
function updateSessionTimeline() {
  const list = document.getElementById('sessionList');
  list.innerHTML = '';
  sessions.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `(${s.timestamp}) Goal: ${s.goal} | Mood: ${s.mood} | Energy: ${s.energy}`;
    list.appendChild(li);
  });
}

// Update chart
function updateChart() {
  const labels = sessions.map((s, i) => `S${i + 1}`);
  const moodData = sessions.map(s => s.mood);
  const energyData = sessions.map(s => s.energy);

  progressChart.data.labels = labels;
  progressChart.data.datasets[0].data = moodData;
  progressChart.data.datasets[1].data = energyData;
  progressChart.update();
}

// Voice Recording
let mediaRecorder;
let audioChunks = [];

document.getElementById('recordBtn').addEventListener('click', async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/mp3' });
      const audioURL = URL.createObjectURL(blob);
      const audio = document.getElementById('audioPlayback');
      audio.src = audioURL;
      audio.style.display = 'block';
    };
    document.getElementById('recordBtn').textContent = "Stop Recording";
  } else {
    mediaRecorder.stop();
    document.getElementById('recordBtn').textContent = "Start Recording";
  }
});

// Estimate Calories
function estimateCalories(type, duration, weight) {
  const MET = {
    "Running": 9.8,
    "Gym Workout": 6.0,
    "HIIT": 8.0,
    "Yoga/Recovery": 3.0
  };

  const met = MET[type] || 6;
  return Math.round((met * 3.5 * weight / 200) * duration);
}

document.getElementById('saveSession').addEventListener('click', () => {
  const type = document.getElementById('sessionType').value;
  const duration = parseFloat(document.getElementById('duration').value);
  const weight = parseFloat(document.getElementById('weight').value);

  if (isNaN(duration) || isNaN(weight)) {
    alert("Please enter valid duration and weight.");
    return;
  }

  const calories = estimateCalories(type, duration, weight);
  document.getElementById('caloriesOutput').textContent = calories;

  const calSession = {
    type,
    duration,
    weight,
    calories,
    time: new Date().toLocaleString()
  };
  calorieSessions.push(calSession);
  updateCalorieHistory();
});

// Show Calorie History
function updateCalorieHistory() {
  const historyDiv = document.getElementById('sessionHistory');
  historyDiv.innerHTML = '<h3>Calorie Sessions</h3>';
  calorieSessions.forEach(s => {
    const p = document.createElement('p');
    p.textContent = `(${s.time}) ${s.type}, ${s.duration} min, ${s.weight}kg => ${s.calories} kcal`;
    historyDiv.appendChild(p);
  });
}
