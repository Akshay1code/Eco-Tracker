function LeafSVG({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.6 3.4c-6.8.3-11.5 2.5-14.2 6.4C3.6 13.8 3.4 18 3.4 20.6c2.6 0 6.8-.2 10.8-3 3.9-2.7 6.1-7.4 6.4-14.2z"
        fill={color}
      />
      <path d="M5.2 18.8c3-3.2 6.2-5.6 10.1-7.6" stroke="#fff" strokeOpacity="0.65" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default LeafSVG;
