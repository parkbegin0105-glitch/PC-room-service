const DATA = window.PCROOM_DATA;
const HELPERS = window.PCROOM_HELPERS;

const gameSelect = document.querySelector("#gameSelect");

const startHoursInput = document.querySelector("#startHours");
const startMinutesInput = document.querySelector("#startMinutes");
const endHoursInput = document.querySelector("#endHours");
const endMinutesInput = document.querySelector("#endMinutes");
const manualPlayHoursInput = document.querySelector("#manualPlayHours");
const manualPlayMinutesInput = document.querySelector("#manualPlayMinutes");

const startBtn = document.querySelector("#startBtn");
const analyzeBtn = document.querySelector("#analyzeBtn");
const resetBtn = document.querySelector("#resetBtn");
const clearHistoryBtn = document.querySelector("#clearHistoryBtn");
const downloadCsvBtn = document.querySelector("#downloadCsvBtn");

const statusText = document.querySelector("#statusText");

const playTimeResult = document.querySelector("#playTimeResult");
const deductedTimeResult = document.querySelector("#deductedTimeResult");
const extraTimeResult = document.querySelector("#extraTimeResult");
const rateResult = document.querySelector("#rateResult");
const percentResult = document.querySelector("#percentResult");
const riskResult = document.querySelector("#riskResult");
const summaryText = document.querySelector("#summaryText");

const historyList = document.querySelector("#historyList");
const gameStatsList = document.querySelector("#gameStatsList");

const totalCount = document.querySelector("#totalCount");
const averageRate = document.querySelector("#averageRate");
const averagePercent = document.querySelector("#averagePercent");

let session = loadSession();

init();

function init() {
  renderGameOptions();
  renderQuickButtons("startQuickButtons", "start");
  renderQuickButtons("endQuickButtons", "end");
  updateStatus();
  renderHistory();
  renderStats();
}

function renderGameOptions() {
  gameSelect.innerHTML = DATA.games.map((game) => {
    return `<option value="${game.id}">${game.name} · ${game.category}</option>`;
  }).join("");
}

function renderQuickButtons(containerId, target) {
  const container = document.querySelector(`#${containerId}`);

  container.innerHTML = DATA.quickTimePresets.map((preset) => {
    return `
      <button type="button" class="quick-btn" data-target="${target}" data-minutes="${preset.minutes}">
        ${preset.label}
      </button>
    `;
  }).join("");

  container.querySelectorAll(".quick-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const minutes = Number(button.dataset.minutes);

      if (button.dataset.target === "start") {
        setTimeInputs(startHoursInput, startMinutesInput, minutes);
      }

      if (button.dataset.target === "end") {
        setTimeInputs(endHoursInput, endMinutesInput, minutes);
      }
    });
  });
}

startBtn.addEventListener("click", () => {
  const startRemainMinutes = getTotalMinutes(startHoursInput, startMinutesInput);

  if (startRemainMinutes <= 0) {
    alert("유료게임 시작 전 남은 시간을 입력해주세요.");
    return;
  }

  session = {
    gameId: gameSelect.value,
    startRemainMinutes,
    startTime: Date.now(),
  };

  saveSession(session);
  updateStatus();

  alert("측정을 시작했습니다. 게임이 끝나면 종료 후 남은 시간을 입력하고 분석하기를 눌러주세요.");
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

  const manualPlayMinutes = getTotalMinutes(manualPlayHoursInput, manualPlayMinutesInput);
  const autoPlayMinutes = (Date.now() - session.startTime) / 1000 / 60;
  const playMinutes = manualPlayMinutes > 0 ? manualPlayMinutes : autoPlayMinutes;

  if (playMinutes <= 0) {
    alert("플레이 시간이 너무 짧습니다.");
    return;
  }

  const deductedMinutes = session.startRemainMinutes - endRemainMinutes;
  const extraMinutes = deductedMinutes - playMinutes;
  const deductionRate = deductedMinutes / playMinutes;
  const extraPercent = (deductionRate - 1) * 100;

  const game = HELPERS.getGameById(session.gameId);
  const risk = HELPERS.getRiskLevel(deductionRate);

  playTimeResult.textContent = formatDuration(playMinutes);
  deductedTimeResult.textContent = formatDuration(deductedMinutes);
  extraTimeResult.textContent = formatSignedDuration(extraMinutes);
  rateResult.textContent = `${deductionRate.toFixed(2)}배`;
  percentResult.textContent = `${extraPercent.toFixed(1)}%`;
  riskResult.textContent = risk.label;
  riskResult.className = `risk-${risk.id}`;

  summaryText.textContent =
    `${game.name} 플레이 분석 결과, 실제 플레이 시간은 ${formatDuration(playMinutes)}이고 ` +
    `PC방 시간은 ${formatDuration(deductedMinutes)} 차감되었습니다. ` +
    `일반 시간보다 약 ${deductionRate.toFixed(2)}배 빠르게 차감된 것으로 분석됩니다. ` +
    `${risk.message}`;

  const historyItem = {
    id: Date.now(),
    gameId: game.id,
    gameName: game.name,
    gameCategory: game.category,
    playMinutes,
    deductedMinutes,
    extraMinutes,
    deductionRate,
    extraPercent,
    riskLabel: risk.label,
    riskId: risk.id,
    endRemainMinutes,
    createdAt: new Date().toISOString(),
  };

  saveHistory(historyItem);
  renderHistory();
  renderStats();

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
  riskResult.textContent = "-";
  riskResult.className = "";
  summaryText.textContent = "유료게임 시작 후 분석 결과가 여기에 표시됩니다.";

  updateStatus();
});

clearHistoryBtn.addEventListener("click", () => {
  if (!confirm("모든 분석 기록을 삭제할까요?")) {
    return;
  }

  localStorage.removeItem("pcbangHistory");
  renderHistory();
  renderStats();
});

downloadCsvBtn.addEventListener("click", () => {
  const history = loadHistory();

  if (history.length === 0) {
    alert("다운로드할 기록이 없습니다.");
    return;
  }

  const header = [
    "날짜",
    "게임",
    "카테고리",
    "실제 플레이 시간(분)",
    "PC방 차감 시간(분)",
    "추가 차감 시간(분)",
    "차감 배율",
    "추가 차감률(%)",
    "위험도",
  ];

  const rows = history.map((item) => [
    formatDate(item.createdAt),
    item.gameName,
    item.gameCategory,
    item.playMinutes.toFixed(1),
    item.deductedMinutes.toFixed(1),
    item.extraMinutes.toFixed(1),
    item.deductionRate.toFixed(2),
    item.extraPercent.toFixed(1),
    item.riskLabel,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "pcroom-analysis-history.csv";
  link.click();

  URL.revokeObjectURL(url);
});

function getTotalMinutes(hoursInput, minutesInput) {
  const hours = Number(hoursInput.value) || 0;
  const minutes = Number(minutesInput.value) || 0;

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

  const game = HELPERS.getGameById(session.gameId);
  const startDate = new Date(session.startTime);
  const hour = String(startDate.getHours()).padStart(2, "0");
  const minute = String(startDate.getMinutes()).padStart(2, "0");

  statusText.textContent =
    `${game.name} 측정 중 · 시작 시간 ${hour}:${minute} · 시작 전 남은 시간 ${formatDuration(session.startRemainMinutes)}`;
}

function saveHistory(item) {
  const history = loadHistory();

  history.unshift(item);

  const limitedHistory = history.slice(0, 30);

  localStorage.setItem("pcbangHistory", JSON.stringify(limitedHistory));
}

function loadHistory() {
  const saved = localStorage.getItem("pcbangHistory");

  if (!saved) {
    return [];
  }

  return JSON.parse(saved);
}

function deleteHistoryItem(id) {
  const history = loadHistory().filter((item) => item.id !== id);

  localStorage.setItem("pcbangHistory", JSON.stringify(history));

  renderHistory();
  renderStats();
}

function renderHistory() {
  const history = loadHistory();

  if (history.length === 0) {
    historyList.innerHTML = `<p class="empty-history">아직 분석 기록이 없습니다.</p>`;
    return;
  }

  historyList.innerHTML = history.map((item) => {
    return `
      <div class="history-item">
        <div class="history-item-top">
          <div>
            <h3>${item.gameName}</h3>
            <p class="history-date">${formatDate(item.createdAt)}</p>
          </div>
          <button type="button" class="delete-item-btn" data-id="${item.id}">삭제</button>
        </div>

        <p>실제 플레이 시간: <strong>${formatDuration(item.playMinutes)}</strong></p>
        <p>PC방 차감 시간: <strong>${formatDuration(item.deductedMinutes)}</strong></p>
        <p>추가 차감 시간: <strong>${formatSignedDuration(item.extraMinutes)}</strong></p>
        <p>차감 배율: <strong>${item.deductionRate.toFixed(2)}배</strong></p>
        <p>위험도: <strong>${item.riskLabel}</strong></p>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".delete-item-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      deleteHistoryItem(id);
    });
  });
}

function renderStats() {
  const history = loadHistory();

  if (history.length === 0) {
    totalCount.textContent = "0회";
    averageRate.textContent = "-";
    averagePercent.textContent = "-";
    gameStatsList.innerHTML = `<p class="empty-history">아직 게임별 통계가 없습니다.</p>`;
    return;
  }

  const count = history.length;

  const rateSum = history.reduce((sum, item) => {
    return sum + Number(item.deductionRate);
  }, 0);

  const percentSum = history.reduce((sum, item) => {
    return sum + Number(item.extraPercent);
  }, 0);

  totalCount.textContent = `${count}회`;
  averageRate.textContent = `${(rateSum / count).toFixed(2)}배`;
  averagePercent.textContent = `${(percentSum / count).toFixed(1)}%`;

  const grouped = {};

  history.forEach((item) => {
    if (!grouped[item.gameName]) {
      grouped[item.gameName] = [];
    }

    grouped[item.gameName].push(item);
  });

  gameStatsList.innerHTML = Object.entries(grouped).map(([gameName, items]) => {
    const avgRate = items.reduce((sum, item) => {
      return sum + Number(item.deductionRate);
    }, 0) / items.length;

    return `
      <div class="game-stat-item">
        <strong>${gameName}</strong>
        <span>${items.length}회 분석 · 평균 ${avgRate.toFixed(2)}배</span>
      </div>
    `;
  }).join("");
}

function formatDate(dateString) {
  const date = new Date(dateString);

  return (
    `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ` +
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  );
}