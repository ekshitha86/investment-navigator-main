import { useEffect, useState } from "react";
import { CalculatorPanel } from "./CalculatorPanel";
import { HistoryPanel } from "./HistoryPanel";
import { CATEGORY_META, type Category } from "@/lib/calculations";
import { clearUser, getHistory, type HistoryEntry, type User } from "@/lib/storage";
import { TrendingUp } from "lucide-react";

const CATEGORIES: Category[] = [
  "monthly_sip",
  "daily_sip",
  "lump_sum",
  "yearly_step_up",
  "monthly_step_up",
];

export function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [active, setActive] = useState<Category>("monthly_sip");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Load history on mount and provide a refresh hook for children.
  useEffect(() => setEntries(getHistory()), []);
  const refresh = () => setEntries(getHistory());

  const handleLogout = () => {
    clearUser();
    onLogout();
  };

  return (
    <div className="min-h-dvh">
      {/* Top bar */}
      <header className="border-b border-clay-edge/60 backdrop-blur-sm sticky top-0 z-30 bg-background/80">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-8 rounded-lg bg-ember grid place-items-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-bone tracking-tight">InvestmentsCalc</span>
          </div>

          {/* Category tabs — top of page, always visible */}
          <nav className="flex-1 overflow-x-auto">
            <div className="flex p-1 bg-clay-raised/60 border border-clay-edge rounded-full shadow-pressed mx-auto w-fit">
              {CATEGORIES.map((c) => {
                const isActive = active === c;
                return (
                  <button
                    key={c}
                    onClick={() => setActive(c)}
                    className={`px-4 lg:px-5 h-9 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-terra text-primary-foreground shadow-coin"
                        : "text-bone-muted hover:text-bone"
                    }`}
                  >
                    {CATEGORY_META[c].label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-sm text-bone leading-tight">{user.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-bone-muted">
                {entries.length} {entries.length === 1 ? "market" : "markets"}
              </div>
            </div>
            <div className="size-9 rounded-full bg-ember grid place-items-center text-primary-foreground font-display">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main grid: calculator + history */}
      <div className="max-w-[1480px] mx-auto px-6 lg:px-10 py-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.25em] text-bone-muted">
              {CATEGORY_META[active].short}
            </div>
            <h1 className="font-display text-4xl text-bone tracking-tight mt-1">
              {CATEGORY_META[active].label}
            </h1>
            <p className="text-sm text-bone-muted mt-2 max-w-xl">
              {CATEGORY_META[active].description}
            </p>
          </div>

          {/* Re-mount on category change so per-category defaults reset cleanly. */}
          <CalculatorPanel key={active} category={active} onSaved={refresh} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start lg:h-[calc(100dvh-7rem)]">
          <HistoryPanel
            user={user}
            entries={entries}
            onChange={refresh}
            onLogout={handleLogout}
          />
        </aside>
      </div>
    </div>
  );
}