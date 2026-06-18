const remainHoursInput = document.querySelector("#remainHours");
const remainMinutesInput = document.querySelector("#remainMinutes");
const baseFeeInput = document.querySelector("#baseFee");
const extraFeeInput = document.querySelector("#extraFee");
const calculateBtn = document.querySelector("#calculateBtn");

const rateResult = document.querySelector("#rateResult");
const timeResult = document.querySelector("#timeResult");
const hourResult = document.querySelector("#hourResult");

calculateBtn.addEventListener("click", () => {
  const remainHours = Number(remainHoursInput.value);
  const remainMinutes = Number(remainMinutesInput.value);
  const baseFee = Number(baseFeeInput.value);
  const extraFee = Number(extraFeeInput.value);

  if (baseFee <= 0) {
    alert("기본 요금은 0원보다 커야 합니다.");
    return;
  }

  const totalRemainMinutes = remainHours * 60 + remainMinutes;

  if (totalRemainMinutes <= 0) {
    alert("남은 시간을 입력해주세요.");
    return;
  }

  const deductionRate = (baseFee + extraFee) / baseFee;
  const realPlayableMinutes = totalRemainMinutes / deductionRate;
  const minutesUsedPerHour = 60 * deductionRate;

  rateResult.textContent = `${deductionRate.toFixed(2)}배`;
  timeResult.textContent = formatMinutes(realPlayableMinutes);
  hourResult.textContent = `${Math.round(minutesUsedPerHour)}분 차감`;
});

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  if (hours <= 0) {
    return `${minutes}분`;
  }

  return `${hours}시간 ${minutes}분`;
}