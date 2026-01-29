export const byZone = (data, zone) =>
  data.filter((d) => d.level === zone);

export const ambPassButFail = (data) =>
  data.filter(
    (d) => d.metrics.AMB >= 95 && d.metrics.AMB <= 105 && d.metrics.R_norm > 1
);

