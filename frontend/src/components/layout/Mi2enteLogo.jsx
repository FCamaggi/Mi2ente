export function Mi2enteLogo({ className = '', iconOnly = false }) {
  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={className}
        aria-label="Mi2ente"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="7" fill="var(--color-primary-500)" />
        <text
          x="16" y="22"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="17"
          textAnchor="middle"
          fill="white"
          letterSpacing="-0.5"
        >
          M<tspan fill="var(--color-primary-200)" fontSize="13" dy="-2">2</tspan>
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 96 24"
      className={className}
      aria-label="Mi2ente"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        y="19"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        fontWeight="800"
        fontSize="20"
        letterSpacing="-0.3"
      >
        <tspan fill="currentColor">Mi</tspan>
        <tspan fill="var(--color-primary-400)" fontSize="17" dy="-2">2</tspan>
        <tspan fill="currentColor" dy="2">ente</tspan>
      </text>
    </svg>
  );
}
