// app.js

document.addEventListener('DOMContentLoaded', () => {
  const mood = document.getElementById('mood');
  const energy = document.getElementById('energy');
  const moodValue = document.getElementById('mood-value');
  const energyValue = document.getElementById('energy-value');
  const goalInput = document.getElementById('goal');
  const timeline = document.getElementById('timeline');
  const recordBtn = document.getElementById('record-btn');
  const saveSessionBtn = document.getElementById('save-session');
  const sessionType = document.getElementById('session-type');
  const durationInput = document.getElementById('duration');
  const weightInput = document.getElementById('weight');
  const caloriesDisplay = document.getElementById('calories');
  const saveCalorieBtn = document.getElementById('save-calorie');

  // Update sliders in real-time
  mood.addEventListener('input', () => {
    moodValue.textContent = mood.value;
  });

  energy.addEventListener('input', () => {
    energyValue.textContent = energy.value;
  });

  // Recording feature placeholder
  recordBtn.addEventListener('click', () => {
    alert('Voice recording feature coming soon!');
  });

  // Save training session
  saveSessionBtn.addEventListener('click', () => {
    const goal = goalInput.value.trim();
    if (!goal) {
      alert('Please enter your training goal.');
      return;
    }

    const sessionData = {
      timestamp: new Date().toLocaleString(),
      goal,
      mood: mood.value,
      energy: energy.value
    };

    const li = document.createElement('li');
    li.textContent = `[${sessionData.timestamp}] Goal: ${sessionData.goal}, Mood: ${sessionData.mood}, Energy: ${sessionData.energy}`;
    timeline.appendChild(li);

    goalInput.value = '';
    mood.value = 3;
    energy.value = 3;
    moodValue.textContent = '3';
    energyValue.textContent = '3';
  });

  // Save calorie session
  saveCalorieBtn.addEventListener('click', () => {
    const type = sessionType.value;
    const duration = parseFloat(durationInput.value);
    const weight = parseFloat(weightInput.value);

    if (!duration || !weight) {
      alert('Please enter both duration and weight.');
      return;
    }

    const caloriesBurned = calculateCalories(type, duration, weight);
    caloriesDisplay.textContent = caloriesBurned.toFixed(2);

    const li = document.createElement('li');
    li.textContent = `[${new Date().toLocaleTimeString()}] ${type} for ${duration}min, burned ${caloriesBurned.toFixed(2)} kcal`;
    timeline.appendChild(li);

    durationInput.value = '';
    weightInput.value = '';
  });

  function calculateCalories(type, duration, weight) {
    const METs = {
      Running: 9.8,
      Walking: 3.5,
      Cycling: 7.5
    };
    const met = METs[type] || 6;
    return (met * 3.5 * weight / 200) * duration;
  }
});
