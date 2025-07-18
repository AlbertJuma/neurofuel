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
