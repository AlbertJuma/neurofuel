let chart;
const goalInput = document.getElementById("goalInput");
const moodSlider = document.getElementById("moodSlider");
const energySlider = document.getElementById("energySlider");
const sessionList = document.getElementById("sessionList");
const caloriesOutput = document.getElementById("caloriesOutput");
const sessionType = document.getElementById("sessionType");
const durationInput = document.getElementById("duration");
const weightInput = document.getElementById("weight");
const sessionHistory = document.getElementById("sessionHistory");

let recordings = [];
let mediaRecorder;
let audioChunks = [];

// Initialize Chart
function initChart() {
  const ctx = document.getElementById("progressChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mood", "Energy"],
      datasets: [{
        label: "Today's Levels",
        data: [moodSlider.value, energySlider.value],
        backgroundColor: ["#4caf50", "#2196f3"]
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 5 }
      }
    }
  });
}

// Update chart on slider change
moodSlider.oninput = energySlider.oninput = () => {
  chart.data.datasets[0].data = [moodSlider.value, energySlider.value];
  chart.update();
};

// Save Goal Session
function saveGoal() {
  const mood = moodSlider.value;
  const energy = energySlider.value;
  const goal = goalInput.value.trim();
  const audioURL = recordings.length > 0 ? recordings[recordings.length - 1] : null;
  const time = new Date().toLocaleTimeString();

  if (goal === "") {
    alert("Please enter your training goal.");
    return;
  }

  const listItem = document.createElement("li");
  listItem.innerHTML = `
    <strong>${time}</strong><br>
    Goal: ${goal}<br>
    Mood: ${mood}, Energy: ${energy}
    ${audioURL ? `<br><audio controls src="${audioURL}"></audio>` : ""}
  `;
  sessionList.appendChild(listItem);
  goalInput.value = "";
}

// Calorie Estimate Logic
function estimateCalories(type, duration, weight) {
  const METs = {
    "Running": 9.8,
    "Gym Workout": 6.0,
    "HIIT": 8.0,
    "Yoga/Recovery": 3.0
  };
  const mets = METs[type];
  return ((mets * 3.5 * weight) / 200) * duration;
}

document.getElementById("saveSession").onclick = () => {
  const duration = parseFloat(durationInput.value);
  const weight = parseFloat(weightInput.value);
  const type = sessionType.value;

  if (isNaN(duration) || isNaN(weight)) {
    alert("Please enter valid numbers for duration and weight.");
    return;
  }

  const calories = Math.round(estimateCalories(type, duration, weight));
  caloriesOutput.textContent = calories;

  const historyEntry = document.createElement("p");
  historyEntry.textContent = `${new Date().toLocaleTimeString()} - ${type}: ${calories} kcal`;
  sessionHistory.appendChild(historyEntry);

  durationInput.value = "";
  weightInput.value = "";
};

// Audio Recording
document.getElementById("recordBtn").addEventListener("click", async () => {
  const btn = document.getElementById("recordBtn");
  const audio = document.getElementById("audioPlayback");

  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    btn.textContent = "Start Recording";
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks);
    const audioURL = URL.createObjectURL(blob);
    audio.src = audioURL;
    audio.style.display = "block";
    recordings.push(audioURL);
  };

  mediaRecorder.start();
  btn.textContent = "Stop Recording";
});

// Initialize chart on page load
window.onload = initChart;
