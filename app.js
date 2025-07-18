// 📦 Final app.js — Fully Enhanced Training Logger App with Smart AI Feedback, Chart & Voice Notes

// 🧠 Utility Functions
function generateID() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

function getSmartFeedback(mood, energy) {
  if (mood >= 4 && energy >= 4) return "🔥 You're crushing it! Keep that momentum!";
  if (mood >= 3 && energy >= 3) return "💪 Solid session. Stay consistent!";
  if (mood < 3 || energy < 3) return "🧘‍♀️ Take care. Rest and hydrate!";
  return "✅ Session saved!";
}

// 🎙️ Voice Recorder (Experimental Feature)
let mediaRecorder;
let recordedChunks = [];

async function initRecorder() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    document.getElementById('audioPreview').src = url;
    localStorage.setItem('lastVoiceNote', url);
    recordedChunks = [];
  };
}

function startRecording() {
  if (mediaRecorder) {
    recordedChunks = [];
    mediaRecorder.start();
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
}

// 📊 Chart Rendering
function updateProgressChart() {
  const sessionData = JSON.parse(localStorage.getItem("trainingSessions")) || [];
  const goalCounts = {};
  sessionData.forEach(session => {
    goalCounts[session.goal] = (goalCounts[session.goal] || 0) + 1;
  });
  const ctx = document.getElementById('progressChart').getContext('2d');
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(goalCounts),
      datasets: [{
        label: '# of Sessions',
        data: Object.values(goalCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderRadius: 12,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// 💾 Session Save Logic
function saveSession() {
  const mood = parseInt(document.getElementById("mood").value);
  const energy = parseInt(document.getElementById("energy").value);
  const goal = document.getElementById("goal").value;
  const calories = parseInt(document.getElementById("calories").value);
  const note = document.getElementById("note").value;

  const session = {
    id: generateID(),
    mood, energy, goal, calories, note,
    timestamp: new Date().toISOString()
  };

  let sessions = JSON.parse(localStorage.getItem("trainingSessions")) || [];
  sessions.push(session);
  localStorage.setItem("trainingSessions", JSON.stringify(sessions));

  alert(getSmartFeedback(mood, energy));

  displaySessions();
  updateProgressChart();
}

function deleteSession(id) {
  let sessions = JSON.parse(localStorage.getItem("trainingSessions")) || [];
  sessions = sessions.filter(s => s.id !== id);
  localStorage.setItem("trainingSessions", JSON.stringify(sessions));
  displaySessions();
  updateProgressChart();
}

function displaySessions() {
  const sessions = JSON.parse(localStorage.getItem("trainingSessions")) || [];
  const list = document.getElementById("sessionList");
  list.innerHTML = "";

  sessions.forEach(session => {
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${formatDate(session.timestamp)}</strong><br>
      Goal: ${session.goal}<br>
      Mood: ${session.mood}, Energy: ${session.energy}<br>
      Calories: ${session.calories}<br>
      Notes: ${session.note}<br>
      <button onclick="deleteSession('${session.id}')">Delete</button>
    `;
    list.appendChild(item);
  });

  updateProgressChart();
}

// 🚀 Initialize App
window.onload = async () => {
  await initRecorder();
  displaySessions();
  updateProgressChart();

  const lastNote = localStorage.getItem("lastVoiceNote");
  if (lastNote) {
    document.getElementById("audioPreview").src = lastNote;
  }
};
