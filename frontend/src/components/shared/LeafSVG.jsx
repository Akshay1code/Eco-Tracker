import { useId } from 'react';

function LeafSVG({ size = 18, color = 'currentColor' }) {
  const gradientId = useId();
  const useGradient = color === 'currentColor';
  const width = size * 0.62;
  const fill = useGradient ? `url(#${gradientId})` : color;

  return (
    <svg width={width} height={size} viewBox="0 0 82 150" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="10" y1="72" x2="72" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0c8b3b" />
          <stop offset="0.48" stopColor="#7cc31c" />
          <stop offset="1" stopColor="#92c81f" />
        </linearGradient>
      </defs>

      <ellipse cx="67.5" cy="18" rx="14.5" ry="15.5" fill={fill} />
      <ellipse cx="48.5" cy="16" rx="11" ry="13.5" fill={fill} />
      <ellipse cx="31.5" cy="23.5" rx="8.5" ry="11.5" fill={fill} />
      <ellipse cx="19" cy="34" rx="7" ry="9" fill={fill} />

      <path
        d="M63 27C34 26 12 48 12 81c0 18 6 35 14 48c8-23 17-37 30-47c8-6 16-18 17-33c1-8-2-16-10-22Z"
        fill={fill}
      />
      <path
        d="M46 82c-10 9-17 24-22 45c7 12 19 20 33 20c14 0 24-6 24-18c0-9-4-15-11-22c-7-7-13-14-14-25c-1 0-4 0-10 0Z"
        fill={fill}
      />

      <path
        d="M57 26c-2 14-6 25-10 35c-7 2-14 5-20 10"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 60c6 1 11 3 16 7"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M37 72c5 1 10 4 15 8"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M31 87c4 2 8 6 12 10"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      <path
        d="M48 96c-3 13-7 23-11 30"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M35 118c4-1 9-1 14 2"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M29 129c4-1 8 0 12 3"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default LeafSVG;
