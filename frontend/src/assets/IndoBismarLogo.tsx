export default function IndoBismarLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Star at top */}
      <polygon
        points="50,4 53,14 63,14 55,20 58,30 50,24 42,30 45,20 37,14 47,14"
        fill="#DC2626"
      />
      {/* Crown arches */}
      <path
        d="M15 55 Q15 30 30 30 Q30 45 50 45 Q70 45 70 30 Q85 30 85 55 Z"
        fill="#DC2626"
      />
      {/* Crown base */}
      <rect x="13" y="55" width="74" height="16" rx="3" fill="#DC2626" />
      {/* Notches on base */}
      <rect x="28" y="55" width="8" height="10" fill="#DC2626" />
      <rect x="46" y="55" width="8" height="10" fill="#DC2626" />
      <rect x="64" y="55" width="8" height="10" fill="#DC2626" />
      {/* Bottom base */}
      <rect x="13" y="68" width="74" height="8" rx="2" fill="#DC2626" />
    </svg>
  );
}