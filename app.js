// Load existing sessions or initialize
const savedSessions = JSON.parse(localStorage.getItem("calorieSessions")) || [];

// On page load, populate saved calorie sessions
window.addEventListener("DOMContentLoaded", () => {
  const history = document.getElementById("sessionHistory");
  savedSessions.forEach(sess => {
    const sessionItem = document.createElement("div");
    sessionItem.className = "bg-white bg-opacity-60 rounded p-3 mb-2 shadow";
    sessionItem.innerHTML = `
      <p><strong>${sess.type}</strong> - ${sess.duration} min, ${sess.weight} kg</p>
      <p><span class="text-green-600 font-semibold">${sess.calories} kcal</span> burned on ${sess.date}</p>
    `;
    history.appendChild(sessionItem);
  });
});

// Goal Tracking Save
document.getElementById("saveGoal").addEventListener("click", () => {
  const goal = document.getElementById("goalInput").value;
  document.getElementById("goalOutput").textContent = goal ? `🎯 ${goal}` : "No goal set";
});

// Mood & Energy Sliders
document.getElementById("moodSlider").addEventListener("input", e => {
  document.getElementById("moodValue").textContent = e.target.value;
});
document.getElementById("energySlider").addEventListener("input", e => {
  document.getElementById("energyValue").textContent = e.target.value;
});

// Voice Note Recorder
let mediaRecorder;
let audioChunks = [];

document.getElementById("startRecord").addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();
  audioChunks = [];

  mediaRecorder.ondataavailable = event => audioChunks.push(event.data);

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.controls = true;
    document.getElementById("voiceOutput").innerHTML = "";
    document.getElementById("voiceOutput").appendChild(audio);
  };
});

document.getElementById("stopRecord").addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
});

// Calorie Burn Calculator
document.getElementById("saveSession").addEventListener("click", () => {
  const type = document.getElementById("activityType").value;
  const duration = parseFloat(document.getElementById("activityDuration").value);
  const weight = parseFloat(document.getElementById("userWeight").value);

  if (!type || isNaN(duration) || isNaN(weight)) {
    alert("Please fill all fields correctly.");
    return;
  }

  const METS = {
    walking: 3.5,
    running: 7.5,
    cycling: 6.8,
    yoga: 2.5,
    swimming: 8.0
  };

  const mets = METS[type];
  const calories = ((mets * 3.5 * weight) / 200) * duration;
  const date = new Date().toLocaleString();

  document.getElementById("calorieOutput").textContent = `🔥 ${calories.toFixed(2)} kcal`;

  // Save session
  const session = { type, duration, weight, calories: calories.toFixed(2), date };
  savedSessions.push(session);
  localStorage.setItem("calorieSessions", JSON.stringify(savedSessions));

  // Add to history
  const history = document.getElementById("sessionHistory");
  const sessionItem = document.createElement("div");
  sessionItem.className = "bg-white bg-opacity-60 rounded p-3 mb-2 shadow";
  sessionItem.innerHTML = `
    <p><strong>${type}</strong> - ${duration} min, ${weight} kg</p>
    <p><span class="text-green-600 font-semibold">${calories.toFixed(2)} kcal</span> burned on ${date}</p>
  `;
  history.appendChild(sessionItem);
});
