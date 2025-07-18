let mediaRecorder;
let audioChunks = [];
let sessionAudio = null;

const recordBtn = document.getElementById("recordBtn");
const audioPlayback = document.getElementById("audioPlayback");

recordBtn.addEventListener("click", async () => {
  if (recordBtn.innerText === "Start Recording") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;
      audioPlayback.style.display = "block";
      sessionAudio = audioUrl;
    });

    recordBtn.innerText = "Stop Recording";
  } else {
    mediaRecorder.stop();
    recordBtn.innerText = "Start Recording";
  }
});

function saveGoal() {
  const input = document.getElementById("goalInput").value.trim();
  const mood = document.getElementById("moodSlider").value;
  const energy = document.getElementById("energySlider").value;

  if (!input) return alert("Write something!");

  const session = {
    date: new Date().toLocaleString(),
    goal: input,
    mood,
    energy,
    audio: sessionAudio || null,
  };

  let logs = JSON.parse(localStorage.getItem("neuroSessions")) || [];
  logs.unshift(session);
  localStorage.setItem("neuroSessions", JSON.stringify(logs));

  document.getElementById("goalInput").value = "";
  sessionAudio = null; // reset for next session
  renderSessions();
  updateChart(logs);
}

function renderSessions() {
  const logs = JSON.parse(localStorage.getItem("neuroSessions")) || [];
  const list = document.getElementById("sessionList");
  list.innerHTML = "";

  logs.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "session-entry";
    li.innerHTML = `
      <strong>${entry.date}</strong><br>
      🧠 <em>${entry.goal}</em><br>
      Mood: ${entry.mood} / 5 &nbsp;&nbsp; Energy: ${entry.energy} / 5
    `;
    if (entry.audio) {
      li.innerHTML += `<br><audio controls src="${entry.audio}"></audio>`;
    }
    list.appendChild(li);
  });
}

function updateChart(logs) {
  const ctx = document.getElementById('progressChart').getContext('2d');
  const dates = logs.map(entry => entry.date);
  const moods = logs.map(entry => entry.mood);
  const energy = logs.map(entry => entry.energy);

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Mood',
          data: moods,
          borderColor: '#facc15',
          fill: false,
        },
        {
          label: 'Energy',
          data: energy,
          borderColor: '#38bdf8',
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 5 },
      }
    }
  });
}

window.onload = () => {
  const logs = JSON.parse(localStorage.getItem("neuroSessions")) || [];
  renderSessions();
  updateChart(logs);
};
function estimateCalories() {
  const duration = parseFloat(document.getElementById("duration").value) || 0;
  const weight = parseFloat(document.getElementById("weight").value) || 0;
  const type = document.getElementById("sessionType").value;

  // MET values based on activity
  const METS = {
    "Running": 9.8,
    "Gym Workout": 6.0,
    "HIIT": 8.0,
    "Yoga/Recovery": 3.0
  };

  const met = METS[type] || 6.0;
  const durationInHours = duration / 60;
  const calories = (met * weight * durationInHours).toFixed(1);

  document.getElementById("caloriesOutput").textContent = isNaN(calories) ? "0" : calories;
}

// Add event listeners
["sessionType", "duration", "weight"].forEach(id => {
  document.getElementById(id).addEventListener("input", estimateCalories);
});
document.getElementById("saveSession").addEventListener("click", function () {
  const type = document.getElementById("sessionType").value;
  const duration = parseFloat(document.getElementById("duration").value) || 0;
  const weight = parseFloat(document.getElementById("weight").value) || 0;
  const calories = document.getElementById("caloriesOutput").textContent;
  const date = new Date().toLocaleString();

  if (!duration || !weight) {
    alert("Please enter both duration and weight.");
    return;
  }

  const sessionItem = document.createElement("div");
  sessionItem.className = "bg-white bg-opacity-60 rounded p-3 mb-2 shadow";
  sessionItem.innerHTML = `
    <p><strong>${type}</strong> - ${duration} min, ${weight} kg</p>
    <p><span class="text-green-600 font-semibold">${calories} kcal</span> burned on ${date}</p>
  `;

  const history = document.getElementById("sessionHistory") || createSessionHistory();
  history.prepend(sessionItem);

  // Reset fields
  document.getElementById("duration").value = "";
  document.getElementById("weight").value = "";
  document.getElementById("caloriesOutput").textContent = "0";
});

function createSessionHistory() {
  const container = document.createElement("div");
  container.id = "sessionHistory";
  container.className = "mt-6 bg-white bg-opacity-70 rounded-2xl shadow-xl p-4";
  container.innerHTML = `<h2 class="text-xl font-bold mb-3">📚 Session History</h2>`;
  document.body.appendChild(container);
  return container;
}
