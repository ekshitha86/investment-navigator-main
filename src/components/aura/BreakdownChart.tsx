import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmt } from "@/lib/calculations";

interface Point {
  year: number;
  invested: number;
  returns: number;
}

/** Stacked bar chart: invested vs estimated returns per year. */
export function BreakdownChart({ data, periodLabel }: { data: Point[]; periodLabel: string }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--clay-edge))" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="year"
            stroke="hsl(var(--bone-muted))"
            tick={{ fontSize: 11 }}
            tickFormatter={(y) => `${periodLabel}${y}`}
          />
          <YAxis
            stroke="hsl(var(--bone-muted))"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => fmt(v).replace("₹", "")}
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--clay-raised))",
              border: "1px solid hsl(var(--clay-edge))",
              borderRadius: 12,
              color: "hsl(var(--bone))",
            }}
            formatter={(value: number, key) => [fmt(value), key === "invested" ? "Invested" : "Est. Returns"]}
            labelFormatter={(y) => `Year ${y}`}
            cursor={{ fill: "hsl(var(--clay-edge) / 0.4)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "hsl(var(--bone-muted))" }}
            iconType="circle"
          />
          <Bar dataKey="invested" stackId="a" fill="hsl(var(--bone-muted) / 0.7)" name="Invested" radius={[0, 0, 0, 0]} />
          <Bar dataKey="returns" stackId="a" fill="hsl(var(--ochre))" name="Est. Returns" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}