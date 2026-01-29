const REQUIRED_COLUMNS = [
  "API",
  "class",
  "stress",
  "level",
  "initial_API",
  "initial_deg",
  "stressed_API_meas",
  "stressed_deg_meas",
];

export const validateCSV = (rows) => {
  if (!rows || rows.length === 0) return false;

  const cols = Object.keys(rows[0]);
  return REQUIRED_COLUMNS.every((c) => cols.includes(c));
};
