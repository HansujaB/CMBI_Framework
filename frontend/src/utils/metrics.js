const RMBD_ALLOW = {
  small_nonvolatile: 0.20,
  small_volatile: 0.35,
  peptide: 0.40,
};

export const computeMetrics = (row) => {
  const SMB = row.stressed_API_meas + row.stressed_deg_meas;
  const initialTotal = row.initial_API + row.initial_deg;

  const AMB = (SMB / initialTotal) * 100;
  const AMBD = 100 - AMB;

  const apiLoss = row.initial_API - row.stressed_API_meas;
  const RMB = apiLoss > 0 ? row.stressed_deg_meas / apiLoss : null;
  const RMBD = RMB !== null ? 1 - RMB : null;

  let R_norm = null;
  if (row.level === "mid" && RMBD !== null) {
    R_norm = RMBD / (RMBD_ALLOW[row.class] ?? 0.3);
  }

  const Q =
    row.stress === "thermal" || row.stress === "photolysis" ? 0.7 : 1.0;

  const G = Math.abs(100 - AMB) / 2.0;

  return { SMB, AMB, AMBD, RMB, RMBD, R_norm, Q, G };
};

export const decideQuadrant = ({ AMB, R_norm }) => {
  if (R_norm !== null && R_norm <= 1 && AMB >= 95 && AMB <= 105) return "Q1";
  if (R_norm !== null && R_norm > 1 && AMB >= 95 && AMB <= 105) return "Q2";
  if (R_norm !== null && R_norm <= 1 && (AMB < 95 || AMB > 105)) return "Q3";
  return "Q4";
};
