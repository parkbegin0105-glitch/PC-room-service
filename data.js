window.PCROOM_DATA = {
  app: {
    title: "PC방 유료게임 차감 분석기",
    subtitle: "유료게임 이용 중 PC방 시간이 실제로 얼마나 빠르게 차감됐는지 분석하는 서비스",
    version: "1.0.0",
  },

  games: [
    {
      id: "lol",
      name: "리그 오브 레전드",
      category: "MOBA",
      description: "PC방에서 많이 이용되는 대표 온라인 게임입니다.",
    },
    {
      id: "valorant",
      name: "발로란트",
      category: "FPS",
      description: "라이엇 게임즈의 전술 슈팅 게임입니다.",
    },
    {
      id: "pubg",
      name: "배틀그라운드",
      category: "배틀로얄",
      description: "PC방 유료게임 차감 여부를 확인하기 좋은 대표 게임입니다.",
    },
    {
      id: "fc-online",
      name: "FC 온라인",
      category: "스포츠",
      description: "축구 기반의 온라인 스포츠 게임입니다.",
    },
    {
      id: "overwatch2",
      name: "오버워치 2",
      category: "FPS",
      description: "팀 기반 슈팅 게임입니다.",
    },
    {
      id: "lostark",
      name: "로스트아크",
      category: "RPG",
      description: "PC방 혜택과 이용 시간 차감을 확인할 수 있는 온라인 RPG입니다.",
    },
    {
      id: "maplestory",
      name: "메이플스토리",
      category: "RPG",
      description: "장시간 플레이가 많은 온라인 RPG입니다.",
    },
    {
      id: "etc",
      name: "기타 유료게임",
      category: "기타",
      description: "목록에 없는 유료게임을 분석할 때 선택합니다.",
    },
  ],

  quickTimePresets: [
    {
      label: "30분",
      minutes: 30,
    },
    {
      label: "1시간",
      minutes: 60,
    },
    {
      label: "2시간",
      minutes: 120,
    },
    {
      label: "3시간",
      minutes: 180,
    },
    {
      label: "5시간",
      minutes: 300,
    },
  ],

  riskLevels: [
    {
      id: "normal",
      label: "정상",
      minRate: 0,
      maxRate: 1.1,
      message: "일반 사용 시간과 거의 비슷하게 차감되었습니다.",
    },
    {
      id: "caution",
      label: "주의",
      minRate: 1.1,
      maxRate: 1.4,
      message: "일반 시간보다 조금 더 빠르게 차감되었습니다.",
    },
    {
      id: "fast",
      label: "빠른 차감",
      minRate: 1.4,
      maxRate: 1.8,
      message: "유료게임 이용으로 시간이 눈에 띄게 빠르게 차감되었습니다.",
    },
    {
      id: "danger",
      label: "매우 빠른 차감",
      minRate: 1.8,
      maxRate: Infinity,
      message: "일반 시간보다 매우 빠르게 차감된 것으로 분석됩니다.",
    },
  ],

  guideSteps: [
    "PC방 프로그램에 표시된 시작 전 남은 시간을 입력합니다.",
    "플레이할 유료게임을 선택하고 유료게임 시작 버튼을 누릅니다.",
    "게임이 끝난 뒤 PC방 프로그램의 종료 후 남은 시간을 입력합니다.",
    "분석하기 버튼을 누르면 실제 차감 시간과 차감 배율을 확인할 수 있습니다.",
    "분석 결과는 최근 기록과 통계에 자동 저장됩니다.",
  ],

  formulas: {
    playedTime: "실제 플레이 시간 = 종료 시각 - 시작 시각",
    deductedTime: "PC방 차감 시간 = 시작 전 남은 시간 - 종료 후 남은 시간",
    extraTime: "추가 차감 시간 = PC방 차감 시간 - 실제 플레이 시간",
    deductionRate: "차감 배율 = PC방 차감 시간 ÷ 실제 플레이 시간",
    extraPercent: "추가 차감률 = (차감 배율 - 1) × 100",
  },
};

window.PCROOM_HELPERS = {
  getGameById(gameId) {
    return window.PCROOM_DATA.games.find((game) => game.id === gameId);
  },

  getRiskLevel(rate) {
    return window.PCROOM_DATA.riskLevels.find((level) => {
      return rate >= level.minRate && rate < level.maxRate;
    });
  },

  getDefaultGame() {
    return window.PCROOM_DATA.games[0];
  },
};