export interface SparklineChartProps {
  data: number[];
  color?: string; // e.g. "text-green-500"
  height?: number;
  width?: number;
}

export function SparklineChart({ data, color = "text-green-500", height = 40, width = 120 }: SparklineChartProps) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / (range || 1)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={color}
        points={points}
      />
    </svg>
  );
}
