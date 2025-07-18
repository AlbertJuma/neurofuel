function saveGoal() {
  const input = document.getElementById("goalInput").value.trim();
  const mood = document.getElementById("moodSlider").value;
  const energy = document.getElementById("energySlider").value;

  if (!input) return alert("Write something!");

  const session = {
    goal: input,
    date: new Date().toLocaleString(),
    mood: mood,
    energy: energy,
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
 list.appendChild(li);
  });
}

window.onload = renderSessions;
