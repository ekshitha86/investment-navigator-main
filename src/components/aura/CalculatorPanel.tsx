import { useMemo, useState } from "react";
import { TrendingUp, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { simulate, fmt, CATEGORY_META, type Category } from "@/lib/calculations";
import { addEntry, buildEntry } from "@/lib/storage";
import { TrajectoryChart } from "./TrajectoryChart";
import { BreakdownChart } from "./BreakdownChart";
import { toast } from "sonner";

interface Props {
  category: Category;
  onSaved: () => void;
}

/** Per-category sane defaults for the sliders. */
const DEFAULTS: Record<Category, { amount: number; rate: number; years: number; stepUp: number }> = {
  monthly_sip: { amount: 10000, rate: 12, years: 15, stepUp: 0 },
  daily_sip: { amount: 500, rate: 12, years: 15, stepUp: 0 },
  lump_sum: { amount: 500000, rate: 12, years: 15, stepUp: 0 },
  yearly_step_up: { amount: 100000, rate: 12, years: 15, stepUp: 10 },
  monthly_step_up: { amount: 10000, rate: 12, years: 15, stepUp: 10 },
};

const AMOUNT_BOUNDS: Record<Category, { min: number; max: number; step: number }> = {
  monthly_sip: { min: 500, max: 200000, step: 500 },
  daily_sip: { min: 50, max: 10000, step: 50 },
  lump_sum: { min: 10000, max: 10000000, step: 10000 },
  yearly_step_up: { min: 10000, max: 2000000, step: 5000 },
  monthly_step_up: { min: 500, max: 200000, step: 500 },
};

export function CalculatorPanel({ category, onSaved }: Props) {
  const meta = CATEGORY_META[category];
  const defs = DEFAULTS[category];
  const bounds = AMOUNT_BOUNDS[category];

  // Inputs — reset implicitly on category change because parent remounts via key.
  const [market, setMarket] = useState("");
  const [amount, setAmount] = useState(defs.amount);
  const [ratePct, setRatePct] = useState(defs.rate);
  const [years, setYears] = useState(defs.years);
  const [stepUpPct, setStepUpPct] = useState(defs.stepUp);

  const result = useMemo(
    () => simulate(category, { amount, ratePct, years, stepUpPct }),
    [category, amount, ratePct, years, stepUpPct]
  );

  const periodLabel = category === "yearly_step_up" || category === "lump_sum" ? "Y" : "Y";
  const canSave = market.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      toast.error("Enter a market name first to start tracking.");
      return;
    }
    addEntry(
      buildEntry({
        market: market.trim(),
        category,
        inputs: { amount, ratePct, years, stepUpPct: meta.hasStepUp ? stepUpPct : undefined },
        result,
      })
    );
    toast.success(`Saved "${market.trim()}" to your portfolio.`);
    setMarket("");
    onSaved();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Inputs (the workbench) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Market name — gates the Save action */}
        <div className="rounded-3xl bg-clay-raised/60 border border-clay-edge p-6 shadow-pressed">
          <label className="text-xs uppercase tracking-[0.2em] text-bone-muted">Market / Stock Name</label>
          <Input
            value={market}
            onChange={(e) => setMarket(e.target.value.slice(0, 60))}
            placeholder="e.g. NIFTY 50, AAPL, Tata Motors…"
            className="mt-3 h-12 bg-transparent border-0 border-b border-clay-edge rounded-none px-0 text-2xl font-display focus-visible:ring-0 focus-visible:border-terra placeholder:text-bone-muted/50"
          />
          <p className="text-xs text-bone-muted mt-2">
            Required to save this calculation to your history.
          </p>
        </div>

        {/* Sliders */}
        <div className="rounded-3xl bg-clay-raised/60 border border-clay-edge p-8 shadow-pressed space-y-8">
          <SliderRow
            label={meta.amountLabel}
            value={amount}
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            onChange={setAmount}
            display={fmt(amount)}
          />
          <div className="h-px bg-clay-edge" />
          <SliderRow
            label="Expected Return Rate"
            value={ratePct}
            min={1}
            max={30}
            step={0.1}
            onChange={setRatePct}
            display={`${ratePct.toFixed(1)} %`}
            accent="ochre"
          />
          <div className="h-px bg-clay-edge" />
          <SliderRow
            label="Time Horizon"
            value={years}
            min={1}
            max={40}
            step={1}
            onChange={setYears}
            display={`${years} ${years === 1 ? "Year" : "Years"}`}
            accent="bone"
          />
          {meta.hasStepUp && (
            <>
              <div className="h-px bg-clay-edge" />
              <SliderRow
                label={meta.stepUpLabel ?? "Step-up"}
                value={stepUpPct}
                min={0}
                max={25}
                step={0.5}
                onChange={setStepUpPct}
                display={`${stepUpPct.toFixed(1)} %`}
                accent="ochre"
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-clay-raised/60 border border-clay-edge p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-[0.2em] text-bone-muted">Growth Trajectory</h3>
              <TrendingUp className="w-4 h-4 text-terra" />
            </div>
            <TrajectoryChart data={result.yearly} />
          </div>
          <div className="rounded-3xl bg-clay-raised/60 border border-clay-edge p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-[0.2em] text-bone-muted">
                Yearly Breakdown
              </h3>
              <Sparkles className="w-4 h-4 text-ochre" />
            </div>
            <BreakdownChart data={result.yearly} periodLabel={periodLabel} />
          </div>
        </div>
      </div>

      {/* Vault — projected outcome */}
      <aside className="lg:col-span-5">
        <div className="sticky top-6 rounded-[2rem] bg-vault border border-clay-edge p-10 shadow-pillar relative overflow-hidden">
          <div className="absolute -top-24 -right-20 size-64 rounded-full bg-terra/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-bone-muted text-xs uppercase tracking-[0.25em] mb-3">
              Projected Wealth
            </h2>
            <div className="font-display text-5xl md:text-6xl text-bone tracking-tight text-tabular leading-[1.05]">
              {fmt(result.total)}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 mt-8 border-t border-clay-edge/80">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-bone-muted">
                  Total Invested
                </div>
                <div className="font-display text-2xl text-bone mt-1 text-tabular">
                  {fmt(result.invested)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-bone-muted">
                  Est. Returns
                </div>
                <div className="font-display text-2xl text-ochre mt-1 text-tabular">
                  +{fmt(result.returns)}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="mt-8 w-full h-12 rounded-full bg-terra hover:bg-terra/90 text-primary-foreground font-medium tracking-wide disabled:opacity-40"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to portfolio
            </Button>
            <p className="text-[11px] text-bone-muted mt-3 text-center">
              {meta.description}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ---------- Slider sub-component ---------- */

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  accent = "terra",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  display: string;
  accent?: "terra" | "ochre" | "bone";
}) {
  const accentClass =
    accent === "ochre" ? "[&_[role=slider]]:border-ochre [&>span:first-child>span]:bg-ochre"
    : accent === "bone" ? "[&_[role=slider]]:border-bone [&>span:first-child>span]:bg-bone"
    : "[&_[role=slider]]:border-terra [&>span:first-child>span]:bg-terra";

  return (
    <div>
      <div className="flex justify-between items-end mb-4">
        <label className="text-xs uppercase tracking-[0.2em] text-bone-muted">{label}</label>
        <span className="font-display text-3xl text-bone text-tabular">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className={`${accentClass} [&_[role=slider]]:size-5 [&_[role=slider]]:bg-clay-deep [&_[role=slider]]:shadow-coin [&>span:first-child]:h-2 [&>span:first-child]:bg-clay-edge`}
      />
      <div className="flex justify-between text-[10px] text-bone-muted/60 mt-2 font-mono">
        <span>{typeof min === "number" && min < 1 ? min : fmt(min).replace("₹", display.includes("%") || display.includes("Year") ? "" : "₹")}</span>
        <span>{fmt(max).replace("₹", display.includes("%") || display.includes("Year") ? "" : "₹")}</span>
      </div>
    </div>
  );
}