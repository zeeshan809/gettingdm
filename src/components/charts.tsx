"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const CHART_COLORS = ["#3f79c9", "#e47a54", "#5f98e2", "#f59e0b", "#10b981", "#64748b"];

type Series = { key: string; label: string; color?: string };

const shortDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

const axisProps = { tick: { fontSize: 11, fill: "#71717a" }, tickLine: false, axisLine: false } as const;
const tooltipStyle = { contentStyle: { borderRadius: 8, border: "1px solid #dad9ec", fontSize: 12 } };

export function TrendChart<T extends { date: string }>({ data, series, height = 260, stacked }: { data: T[]; series: Series[]; height?: number; stacked?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color ?? CHART_COLORS[i]} stopOpacity={0.25} />
              <stop offset="100%" stopColor={s.color ?? CHART_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9e8f8" vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} {...axisProps} />
        <YAxis {...axisProps} width={48} />
        <Tooltip labelFormatter={(l) => shortDate(String(l))} {...tooltipStyle} />
        {series.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? "1" : undefined}
            stroke={s.color ?? CHART_COLORS[i]}
            fill={`url(#fill-${s.key})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineTrend<T extends { date: string }>({ data, series, height = 240, valueFormatter }: { data: T[]; series: Series[]; height?: number; valueFormatter?: (v: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9e8f8" vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} {...axisProps} />
        <YAxis {...axisProps} width={56} tickFormatter={valueFormatter} />
        <Tooltip labelFormatter={(l) => shortDate(String(l))} formatter={(v) => (valueFormatter ? valueFormatter(Number(v)) : v)} {...tooltipStyle} />
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color ?? CHART_COLORS[i]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarList<T extends Record<string, unknown>>({ data, xKey, series, height = 260, horizontal }: { data: T[]; xKey: string; series: Series[]; height?: number; horizontal?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, left: horizontal ? 8 : -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9e8f8" horizontal={!horizontal} vertical={!!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey={xKey} width={150} {...axisProps} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} width={48} />
          </>
        )}
        <Tooltip cursor={{ fill: "#e9e8f8" }} {...tooltipStyle} />
        {series.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? CHART_COLORS[i]} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 220 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
