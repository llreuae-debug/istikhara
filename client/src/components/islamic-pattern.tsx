export function IslamicPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="islamic-pattern"
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M50 0 L75 25 L50 50 L25 25 Z M50 50 L75 75 L50 100 L25 75 Z M0 50 L25 25 L50 50 L25 75 Z M50 50 L75 25 L100 50 L75 75 Z"
            fill="currentColor"
            opacity="0.3"
          />
          <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.2" />
          <circle cx="0" cy="0" r="4" fill="currentColor" opacity="0.2" />
          <circle cx="100" cy="0" r="4" fill="currentColor" opacity="0.2" />
          <circle cx="0" cy="100" r="4" fill="currentColor" opacity="0.2" />
          <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
    </svg>
  );
}
