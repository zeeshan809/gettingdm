"use client";

// Recharts is heavy. Load it only when a chart is on screen, with a same-size
// placeholder so the layout does not jump.
import dynamic from "next/dynamic";

const placeholder = (height: number) => function ChartPlaceholder() {
  return <div className="w-full animate-pulse rounded-xl bg-zinc-50" style={{ height }} />;
};

export const TrendChart = dynamic(() => import("./charts").then((m) => m.TrendChart), { ssr: false, loading: placeholder(260) });
export const LineTrend = dynamic(() => import("./charts").then((m) => m.LineTrend), { ssr: false, loading: placeholder(240) });
export const BarList = dynamic(() => import("./charts").then((m) => m.BarList), { ssr: false, loading: placeholder(260) });
export const Donut = dynamic(() => import("./charts").then((m) => m.Donut), { ssr: false, loading: placeholder(220) });
