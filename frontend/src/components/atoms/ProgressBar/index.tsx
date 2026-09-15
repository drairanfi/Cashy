interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-bar__fill" style={{ width: `${width}%` }} />
    </div>
  );
}
