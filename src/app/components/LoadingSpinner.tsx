interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export default function LoadingSpinner({ size = 24, className = "", ariaLabel = "Загрузка" }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-block rounded-full border-2 border-[#dfe2ed] border-t-[#2c3a54] animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
