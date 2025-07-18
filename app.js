// Chart.js progress chart setup
let moodData = [];
let energyData = [];
let sessionLabels = [];
const ctx = document.getElementById('progressChart').getContext('2d');
const progressChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: sessionLabels,
    datasets: [
      {
        label: 'Mood',
        data: moodData,
        borderColor: '#ff6384',
        fill: false
      },
      {
        label: 'Energy',
        data: energyData,
        borderColor: '#36a2eb',
        fill: false
      }
    ]
  }
});

// Save training session
function saveGoal() {
  const goal = document.getElementById('goalInput').value;
  const mood = document.getElementById('moodSlider').value;
  const energy = document.getElementById('energySlider').value;

  const session = {
    goal,
    mood,
    energy,
    time: new Date().toLocaleTimeString()
  };

  const sessionList = document.getElementById('sessionList');
  const item = document.createElement('li');
  item.textContent = `Goal: ${goal}, Mood: ${mood}, Energy: ${energy} (${session.time})`;
  sessionList.appendChild(item);

  // Update chart
  sessionLabels.push(session.time);
  moodData.push(mood);
  energyData.push(energy);
  progressChart.update();
}

// Calorie calculator
document.getElementById("saveSession").addEventListener("click", () => {
  const type = document.getElementById("sessionType").value;
  const duration = parseFloat(document.getElementById("duration").value);
  const weight = parseFloat(document.getElementById("weight").value);

  if (isNaN(duration) || isNaN(weight)) {
    alert("Please enter valid numbers for duration and weight.");
    return;
  }

  let met = 8; // default for running
  switch (type) {
    case "Gym Workout": met = 6; break;
    case "HIIT": met = 10; break;
    case "Yoga/Recovery": met = 3; break;
  }

  const calories = Math.round((met * 3.5 * weight / 200) * duration);
  document.getElementById("caloriesOutput").textContent = calories;

  const history = document.getElementById("sessionHistory");
  const entry = document.createElement("p");
  entry.textContent = `${type} | ${duration} mins | ${weight} kg → 🔥 ${calories} kcal`;
  history.appendChild(entry);
});
