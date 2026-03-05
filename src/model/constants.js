export const APP = {
  storageKey: "retirementPlanner.plan.v2",
  version: 3,
  currentYear: new Date().getFullYear(),
  defaultProvince: "NL",
};


export const PROVINCES = {
  NL: "Newfoundland and Labrador",
  PE: "Prince Edward Island",
  NS: "Nova Scotia",
  NB: "New Brunswick",
  QC: "Quebec",
  ON: "Ontario",
  MB: "Manitoba",
  SK: "Saskatchewan",
  AB: "Alberta",
  BC: "British Columbia",
};

export const RISK_RETURNS = {
  conservative: 0.04,
  balanced: 0.055,
  aggressive: 0.07,
};

export const TAX_BRACKETS = {
  federal: {
    thresholds: [0, 57375, 114750, 177882, 253414],
    rates: [0.15, 0.205, 0.26, 0.29, 0.33],
  },
  provincial: {
    NL: { thresholds: [0, 43198, 86395, 154244, 215943, 275870, 551739, 1103478], rates: [0.087, 0.145, 0.158, 0.178, 0.198, 0.208, 0.213, 0.218] },
    PE: { thresholds: [0, 32656, 64313, 105000, 140000], rates: [0.098, 0.138, 0.167, 0.176, 0.19] },
    NS: { thresholds: [0, 29590, 59180, 93000, 150000], rates: [0.0879, 0.1495, 0.1667, 0.175, 0.21] },
    NB: { thresholds: [0, 49958, 99916, 185064], rates: [0.094, 0.14, 0.16, 0.195] },
    QC: { thresholds: [0, 51780, 103545, 126000], rates: [0.14, 0.19, 0.24, 0.2575] },
    ON: { thresholds: [0, 52886, 105775, 150000, 220000], rates: [0.0505, 0.0915, 0.1116, 0.1216, 0.1316] },
    MB: { thresholds: [0, 47000, 100000], rates: [0.108, 0.1275, 0.174] },
    SK: { thresholds: [0, 52057, 148734], rates: [0.105, 0.125, 0.145] },
    AB: { thresholds: [0, 151234, 181481, 241974, 362961], rates: [0.1, 0.12, 0.13, 0.14, 0.15] },
    BC: { thresholds: [0, 47937, 95875, 110076, 133664, 181232, 252752], rates: [0.0506, 0.077, 0.105, 0.1229, 0.147, 0.168, 0.205] },
  },
};

export const RRIF_MIN_WITHDRAWAL = {
  71: 0.0528,
  72: 0.054,
  73: 0.0553,
  74: 0.0567,
  75: 0.0582,
  76: 0.0598,
  77: 0.0617,
  78: 0.0636,
  79: 0.0658,
  80: 0.0682,
  81: 0.0708,
  82: 0.0738,
  83: 0.0771,
  84: 0.0808,
  85: 0.0851,
  86: 0.0899,
  87: 0.0955,
  88: 0.1021,
  89: 0.1099,
  90: 0.1192,
  91: 0.1306,
  92: 0.1449,
  93: 0.1634,
  94: 0.1879,
  95: 0.2,
};
