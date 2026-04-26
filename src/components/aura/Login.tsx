import { useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setUser } from "@/lib/storage";

/** Name-based login screen (no password). */
export function Login({ onAuthed }: { onAuthed: () => void }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    setSubmitting(true);
    setUser(trimmed);
    onAuthed();
  };

  return (
    <main className="min-h-dvh grid lg:grid-cols-2">
      {/* Hero side */}
      <section className="hidden lg:flex relative bg-vault border-r border-clay-edge p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_30%,hsl(var(--terra)/0.18),transparent_60%)] pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="size-10 rounded-xl bg-ember grid place-items-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl text-bone tracking-tight">InvestmentsCalc</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="font-display text-5xl xl:text-6xl text-bone leading-[1.05] tracking-tight">
            Stack coins.
            <br />
            <span className="text-terra">Watch them grow.</span>
          </h1>
          <p className="text-bone-muted max-w-md text-lg leading-relaxed">
            </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3 max-w-md">
          {[
            { k: "Analytical" },
            { k: "strategies" },
            { k: "calculations"},
          ].map((s) => (
            <div key={s.k} className="rounded-2xl border border-clay-edge bg-clay-raised/40 p-4">
              <div className="text-[15px] uppercase tracking-widest text-bone-muted">{s.k}</div>
              <div className="font-display text-2xl text-bone mt-1">{}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Form side */}
      <section className="flex items-center justify-center p-8">
        <form onSubmit={handle} className="w-full max-w-md space-y-8">
          <header className="space-y-3">
            <div className="text-xs uppercase tracking-[0.25em] text-bone-muted">Welcome</div>
            <h2 className="font-display text-4xl text-bone tracking-tight">
              TO InvestmentsCalc
            </h2>
            <p className="text-bone-muted text-sm">
              Login with your name to get started.
            </p>
          </header>

          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-widest text-bone-muted">
              
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Your name"
              autoFocus
              className="h-14 text-lg bg-clay-raised border-clay-edge focus-visible:ring-terra/50 rounded-2xl px-5"
            />
          </div>

          <Button
            type="submit"
            disabled={name.trim().length < 2 || submitting}
            className="w-full h-14 rounded-full bg-terra hover:bg-terra/90 text-primary-foreground text-base font-medium tracking-wide disabled:opacity-40"
          >
            Enter 
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-bone-muted/70 text-center">
            
          </p>
        </form>
      </section>
    </main>
  );
}