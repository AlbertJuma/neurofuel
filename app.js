function saveGoal() {
  const input = document.getElementById("goalInput").value.trim();
  const mood = document.getElementById("moodSlider").value;
  const energy = document.getElementById("energySlider").value;

  if (!input) return alert("Write something!");

  const session = {
  date: new Date().toLocaleString(),
  goal,
  mood,
  energy,
  audio: audioPlayback.src || null,
};


  let logs = JSON.parse(localStorage.getItem("neuroSessions")) || [];
  logs.unshift(session); // newest first
  localStorage.setItem("neuroSessions", JSON.stringify(logs));

  document.getElementById("goalInput").value = "";
  renderSessions();
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

window.onload = renderSessions;
let mediaRecorder;
let audioChunks = [];

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

      // Save audio blob in memory as base64 string (for now)
      sessionAudio = audioUrl;
    });

    recordBtn.innerText = "Stop Recording";
  } else {
    mediaRecorder.stop();
    recordBtn.innerText = "Start Recording";
  }
});

