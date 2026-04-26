/**
 * Investment calculation utilities.
 *
 * All formulas use standard finance conventions:
 *  - SIP (Monthly):  M * (((1+i)^n − 1) / i) * (1+i)        where i = r/12, n = years*12
 *  - Daily SIP:      M * (((1+i)^n − 1) / i) * (1+i)        where i = r/365, n = years*365
 *  - Lump Sum:       P * (1+r)^t
 *  - Yearly Step-up: each year k uses contribution C*(1+s)^(k−1), compounded for remaining years
 *  - Monthly Step-up: contribution increases every 12 months by step-up %
 *
 * Each function also returns a per-period series so charts can render trajectories.
 */

export type Category =
  | "monthly_sip"
  | "daily_sip"
  | "lump_sum"
  | "yearly_step_up"
  | "monthly_step_up";

export interface CalcInputs {
  /** Per-period contribution OR lump sum principal */
  amount: number;
  /** Expected annual return rate, percent (e.g. 12 for 12%) */
  ratePct: number;
  /** Time horizon in YEARS */
  years: number;
  /** Annual step-up rate, percent — used by step-up categories only */
  stepUpPct?: number;
}

export interface CalcResult {
  invested: number;
  returns: number;
  total: number;
  /** Per-year cumulative series for charts */
  yearly: Array<{
    year: number;
    invested: number;
    value: number;
    returns: number;
  }>;
}

const r = (n: number) => Math.round(n);

/** Monthly SIP — contributions made at start of each month. */
export function calcMonthlySip({ amount, ratePct, years }: CalcInputs): CalcResult {
  const i = ratePct / 100 / 12;
  const yearly: CalcResult["yearly"] = [];
  let value = 0;
  let invested = 0;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      value = (value + amount) * (1 + i);
      invested += amount;
    }
    yearly.push({ year: y, invested: r(invested), value: r(value), returns: r(value - invested) });
  }
  return { invested: r(invested), returns: r(value - invested), total: r(value), yearly };
}

/** Daily SIP — contributions every day, compounded daily. */
export function calcDailySip({ amount, ratePct, years }: CalcInputs): CalcResult {
  const i = ratePct / 100 / 365;
  const yearly: CalcResult["yearly"] = [];
  let value = 0;
  let invested = 0;
  for (let y = 1; y <= years; y++) {
    for (let d = 0; d < 365; d++) {
      value = (value + amount) * (1 + i);
      invested += amount;
    }
    yearly.push({ year: y, invested: r(invested), value: r(value), returns: r(value - invested) });
  }
  return { invested: r(invested), returns: r(value - invested), total: r(value), yearly };
}

/** One-time Lump Sum compounded annually. */
export function calcLumpSum({ amount, ratePct, years }: CalcInputs): CalcResult {
  const r_ = ratePct / 100;
  const yearly: CalcResult["yearly"] = [];
  for (let y = 1; y <= years; y++) {
    const value = amount * Math.pow(1 + r_, y);
    yearly.push({ year: y, invested: r(amount), value: r(value), returns: r(value - amount) });
  }
  const final = yearly[yearly.length - 1];
  return { invested: final.invested, returns: final.returns, total: final.value, yearly };
}

/**
 * Yearly Step-up SIP — annual contribution that grows each year by stepUpPct.
 * Each year's contribution is treated as a single annual deposit at the start of that year.
 */
export function calcYearlyStepUp({ amount, ratePct, years, stepUpPct = 0 }: CalcInputs): CalcResult {
  const r_ = ratePct / 100;
  const s = stepUpPct / 100;
  const yearly: CalcResult["yearly"] = [];
  let value = 0;
  let invested = 0;
  let contribution = amount;
  for (let y = 1; y <= years; y++) {
    value = (value + contribution) * (1 + r_);
    invested += contribution;
    yearly.push({ year: y, invested: r(invested), value: r(value), returns: r(value - invested) });
    contribution = contribution * (1 + s);
  }
  return { invested: r(invested), returns: r(value - invested), total: r(value), yearly };
}

/**
 * Monthly Step-up SIP — monthly contribution that increases every 12 months by stepUpPct.
 */
export function calcMonthlyStepUp({ amount, ratePct, years, stepUpPct = 0 }: CalcInputs): CalcResult {
  const i = ratePct / 100 / 12;
  const s = stepUpPct / 100;
  const yearly: CalcResult["yearly"] = [];
  let value = 0;
  let invested = 0;
  let monthly = amount;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      value = (value + monthly) * (1 + i);
      invested += monthly;
    }
    yearly.push({ year: y, invested: r(invested), value: r(value), returns: r(value - invested) });
    monthly = monthly * (1 + s);
  }
  return { invested: r(invested), returns: r(value - invested), total: r(value), yearly };
}

/** Dispatcher that picks the right engine for a given category. */
export function simulate(category: Category, inputs: CalcInputs): CalcResult {
  switch (category) {
    case "monthly_sip": return calcMonthlySip(inputs);
    case "daily_sip": return calcDailySip(inputs);
    case "lump_sum": return calcLumpSum(inputs);
    case "yearly_step_up": return calcYearlyStepUp(inputs);
    case "monthly_step_up": return calcMonthlyStepUp(inputs);
  }
}

export const CATEGORY_META: Record<Category, {
  label: string;
  short: string;
  amountLabel: string;
  hasStepUp: boolean;
  stepUpLabel?: string;
  description: string;
}> = {
  monthly_sip: {
    label: "Monthly SIP",
    short: "SIP",
    amountLabel: "Monthly Investment",
    hasStepUp: false,
    description: "Invest a fixed amount every month. Compounding does the rest.",
  },
  daily_sip: {
    label: "Daily Investor",
    short: "Daily",
    amountLabel: "Daily Investment",
    hasStepUp: false,
    description: "Micro-deposits every single day, compounded daily.",
  },
  lump_sum: {
    label: "Lump Sum",
    short: "Lump",
    amountLabel: "One-time Investment",
    hasStepUp: false,
    description: "Park a one-time amount and let it compound.",
  },
  yearly_step_up: {
    label: "Yearly Step-up",
    short: "Yearly ↑",
    amountLabel: "Yearly Investment",
    hasStepUp: true,
    stepUpLabel: "Annual Step-up",
    description: "Annual contribution grows each year as your income grows.",
  },
  monthly_step_up: {
    label: "Monthly Step-up",
    short: "Monthly ↑",
    amountLabel: "Monthly Investment",
    hasStepUp: true,
    stepUpLabel: "Annual Step-up",
    description: "Monthly SIP that automatically increases every 12 months.",
  },
};

/** Format a number as currency (₹ by default). */
export function fmt(n: number, currency = "₹"): string {
  if (!isFinite(n)) return `${currency}0`;
  if (Math.abs(n) >= 1e7) return `${currency}${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `${currency}${(n / 1e5).toFixed(2)} L`;
  return `${currency}${Math.round(n).toLocaleString("en-IN")}`;
}