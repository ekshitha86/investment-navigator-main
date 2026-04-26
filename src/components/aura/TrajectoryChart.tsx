import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmt } from "@/lib/calculations";

interface Point {
  year: number;
  invested: number;
  value: number;
}

/** Smooth area chart of corpus growth over time. */
export function TrajectoryChart({ data }: { data: Point[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="g-value" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--terra))" stopOpacity={0.6} />
              <stop offset="100%" stopColor="hsl(var(--terra))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-invested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--bone-muted))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(var(--bone-muted))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--clay-edge))" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="year"
            stroke="hsl(var(--bone-muted))"
            tick={{ fontSize: 11 }}
            tickFormatter={(y) => `Yr ${y}`}
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
            formatter={(value: number, key) => [fmt(value), key === "value" ? "Total Value" : "Invested"]}
            labelFormatter={(y) => `Year ${y}`}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="hsl(var(--bone-muted))"
            strokeWidth={1.5}
            fill="url(#g-invested)"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--terra))"
            strokeWidth={2.5}
            fill="url(#g-value)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}