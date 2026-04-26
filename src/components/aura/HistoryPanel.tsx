import { useState } from "react";
import { Pencil, Trash2, Check, X, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_META, fmt } from "@/lib/calculations";
import {
  deleteEntry,
  getHistory,
  totalCorpus,
  updateEntry,
  type HistoryEntry,
  type User,
} from "@/lib/storage";
import { toast } from "sonner";

interface Props {
  user: User;
  entries: HistoryEntry[];
  onChange: () => void;
  onLogout: () => void;
}

export function HistoryPanel({ user, entries, onChange, onLogout }: Props) {
  const corpus = totalCorpus(entries);

  return (
    <div className="rounded-3xl bg-clay-raised/60 border border-clay-edge p-6 h-full flex flex-col">
      {/* Profile header */}
      <div className="flex items-start justify-between gap-3 pb-5 border-b border-clay-edge">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-11 rounded-full bg-ember grid place-items-center text-primary-foreground font-display text-lg shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-bone truncate">{user.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-bone-muted">Investor</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="text-bone-muted hover:text-bone hover:bg-clay-edge size-9 shrink-0"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Total corpus */}
      <div className="py-5 border-b border-clay-edge">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-bone-muted mb-1">
          <Wallet className="w-3 h-3" /> Current Total Corpus
        </div>
        <div className="font-display text-3xl text-bone text-tabular">{fmt(corpus)}</div>
        <div className="text-xs text-bone-muted mt-1">
          Across {entries.length} {entries.length === 1 ? "market" : "markets"}
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto pt-4 -mr-2 pr-2 space-y-2 min-h-[200px]">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-sm text-bone-muted">
            No markets saved yet.
            <br />
            Enter a market name and tap <span className="text-terra">Save</span>.
          </div>
        ) : (
          entries.map((e) => (
            <EntryRow key={e.id} entry={e} onChange={onChange} />
          ))
        )}
      </div>
    </div>
  );
}

function EntryRow({ entry, onChange }: { entry: HistoryEntry; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entry.market);

  const meta = CATEGORY_META[entry.category];

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Market name cannot be empty.");
      return;
    }
    updateEntry(entry.id, { market: trimmed });
    setEditing(false);
    onChange();
  };

  const remove = () => {
    deleteEntry(entry.id);
    toast.success(`Removed "${entry.market}".`);
    onChange();
  };

  return (
    <div className="group rounded-2xl border border-clay-edge bg-clay-deep/60 hover:border-terra/40 transition-colors p-4">
      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <div className="flex-1 flex items-center gap-1">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 60))}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="h-8 bg-clay-edge border-clay-edge text-bone text-sm"
            />
            <Button size="icon" variant="ghost" onClick={save} className="size-8 text-terra hover:bg-clay-edge">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(false); setName(entry.market); }} className="size-8 text-bone-muted hover:bg-clay-edge">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="min-w-0">
              <div className="font-display text-lg text-bone truncate">{entry.market}</div>
              <div className="text-[10px] uppercase tracking-widest text-bone-muted mt-0.5">
                {meta.short} · {entry.inputs.years}y · {entry.inputs.ratePct}%
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="size-7 text-bone-muted hover:text-bone hover:bg-clay-edge">
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={remove} className="size-7 text-bone-muted hover:text-destructive hover:bg-clay-edge">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-clay-edge/60 text-[11px]">
        <Cell label="Invested" value={fmt(entry.result.invested)} />
        <Cell label="Returns" value={`+${fmt(entry.result.returns)}`} accent />
        <Cell label="Total" value={fmt(entry.result.total)} bold />
      </div>
    </div>
  );
}

function Cell({ label, value, accent, bold }: { label: string; value: string; accent?: boolean; bold?: boolean }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-bone-muted/70">{label}</div>
      <div className={`text-tabular mt-0.5 ${accent ? "text-ochre" : "text-bone"} ${bold ? "font-display text-sm" : "text-xs"}`}>
        {value}
      </div>
    </div>
  );
}