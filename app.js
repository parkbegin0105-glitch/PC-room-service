const gameSelect = document.querySelector("#gameSelect");

const startHoursInput = document.querySelector("#startHours");
const startMinutesInput = document.querySelector("#startMinutes");
const endHoursInput = document.querySelector("#endHours");
const endMinutesInput = document.querySelector("#endMinutes");

const startBtn = document.querySelector("#startBtn");
const analyzeBtn = document.querySelector("#analyzeBtn");
const resetBtn = document.querySelector("#resetBtn");

const statusText = document.querySelector("#statusText");

const playTimeResult = document.querySelector("#playTimeResult");
const deductedTimeResult = document.querySelector("#deductedTimeResult");
const extraTimeResult = document.querySelector("#extraTimeResult");
const rateResult = document.querySelector("#rateResult");
const percentResult = document.querySelector("#percentResult");
const remainResult = document.querySelector("#remainResult");
const summaryText = document.querySelector("#summaryText");

let session = loadSession();

updateStatus();

document.querySelectorAll(".quick-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    const minutes = Number(button.dataset.minutes);

    if (target === "start") {
      setTimeInputs(startHoursInput, startMinutesInput, minutes);
    }

    if (target === "end") {
      setTimeInputs(endHoursInput, endMinutesInput, minutes);
    }
  });
});

startBtn.addEventListener("click", () => {
  const startRemainMinutes = getTotalMinutes(startHoursInput, startMinutesInput);

  if (startRemainMinutes <= 0) {
    alert("유료게임 시작 전 남은 시간을 입력해주세요.");
    return;
  }

  session = {
    game: gameSelect.value,
    startRemainMinutes,
    startTime: Date.now(),
  };

  saveSession(session);
  updateStatus();

  alert("유료게임 측정을 시작했습니다. 게임이 끝나면 종료 후 남은 시간을 입력하고 분석하기를 눌러주세요.");
});

analyzeBtn.addEventListener("click", () => {
  if (!session) {
    alert("먼저 유료게임 시작 버튼을 눌러주세요.");
    return;
  }

  const endRemainMinutes = getTotalMinutes(endHoursInput, endMinutesInput);

  if (endRemainMinutes < 0) {
    alert("종료 후 남은 시간을 올바르게 입력해주세요.");
    return;
  }

  if (endRemainMinutes >= session.startRemainMinutes) {
    alert("종료 후 남은 시간은 시작 전 남은 시간보다 적어야 합니다.");
    return;
  }

  const now = Date.now();
  const playMinutes = (now - session.startTime) / 1000 / 60;

  if (playMinutes <= 0) {
    alert("플레이 시간이 너무 짧습니다. 잠시 후 다시 분석해주세요.");
    return;
  }

  const deductedMinutes = session.startRemainMinutes - endRemainMinutes;
  const extraMinutes = deductedMinutes - playMinutes;
  const deductionRate = deductedMinutes / playMinutes;
  const extraPercent = (deductionRate - 1) * 100;

  playTimeResult.textContent = formatDuration(playMinutes);
  deductedTimeResult.textContent = formatDuration(deductedMinutes);
  extraTimeResult.textContent = formatSignedDuration(extraMinutes);
  rateResult.textContent = `${deductionRate.toFixed(2)}배`;
  percentResult.textContent = `${extraPercent.toFixed(1)}%`;
  remainResult.textContent = formatDuration(endRemainMinutes);

  summaryText.textContent =
    `${session.game} 플레이를 분석한 결과, 실제 플레이 시간은 ${formatDuration(playMinutes)}이고 ` +
    `PC방 시간은 ${formatDuration(deductedMinutes)} 차감되었습니다. ` +
    `즉, 일반 시간보다 약 ${deductionRate.toFixed(2)}배 빠르게 차감된 것으로 분석됩니다.`;

  clearSession();
  session = null;
  updateStatus();
});

resetBtn.addEventListener("click", () => {
  clearSession();
  session = null;

  playTimeResult.textContent = "-";
  deductedTimeResult.textContent = "-";
  extraTimeResult.textContent = "-";
  rateResult.textContent = "-";
  percentResult.textContent = "-";
  remainResult.textContent = "-";
  summaryText.textContent = "유료게임 시작 후 분석 결과가 여기에 표시됩니다.";

  updateStatus();
});

function getTotalMinutes(hoursInput, minutesInput) {
  const hours = Number(hoursInput.value);
  const minutes = Number(minutesInput.value);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

function setTimeInputs(hoursInput, minutesInput, totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  hoursInput.value = hours;
  minutesInput.value = minutes;
}

function formatDuration(totalMinutes) {
  if (totalMinutes < 1) {
    const seconds = Math.max(1, Math.round(totalMinutes * 60));
    return `${seconds}초`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours <= 0) {
    return `${minutes}분`;
  }

  if (minutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${minutes}분`;
}

function formatSignedDuration(minutes) {
  if (minutes >= 0) {
    return `+${formatDuration(minutes)}`;
  }

  return `-${formatDuration(Math.abs(minutes))}`;
}

function saveSession(data) {
  localStorage.setItem("pcbangSession", JSON.stringify(data));
}

function loadSession() {
  const saved = localStorage.getItem("pcbangSession");

  if (!saved) {
    return null;
  }

  return JSON.parse(saved);
}

function clearSession() {
  localStorage.removeItem("pcbangSession");
}

function updateStatus() {
  if (!session) {
    statusText.textContent = "아직 시작하지 않았습니다.";
    return;
  }

  const startDate = new Date(session.startTime);
  const hour = String(startDate.getHours()).padStart(2, "0");
  const minute = String(startDate.getMinutes()).padStart(2, "0");

  statusText.textContent =
    `${session.game} 측정 중 · 시작 시간 ${hour}:${minute} · 시작 전 남은 시간 ${formatDuration(session.startRemainMinutes)}`;
}