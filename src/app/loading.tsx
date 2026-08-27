export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--bg)" }}
    >
      {/* Brand logo */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 h-12 px-5 rounded-full text-white font-extrabold bg-gradient-to-l from-dk-red to-[#f77f48] shadow-md">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="text-lg">دیجی‌کلون</span>
        </span>
      </div>

      {/* Volume knob loader */}
      <svg
        className="vol"
        viewBox="0 0 64 64"
        width="96"
        height="96"
        fill="none"
        role="img"
        aria-label="در حال بارگذاری"
        style={{ color: "#131316" }}
      >
        <style>{`
          svg { color: #131316; --rate: 1; }
          .vol { --dur: 3.4s; }
          .vol-ghost, .vol-line { stroke: currentColor; fill: none; stroke-linecap: round; }
          .vol-ghost { stroke-width: .8; opacity: .14; }
          .vol-rig {
            transform-box: view-box;
            transform-origin: center;
            animation: vol-turn calc(var(--dur) * var(--rate, 1) * 2.4) linear infinite;
          }
          .vol-line {
            stroke-width: 1.9;
            stroke-dasharray: 100 100;
            stroke-dashoffset: 100;
            animation: vol-draw calc(var(--dur) * var(--rate, 1)) infinite;
          }
          @keyframes vol-draw {
            0%   { stroke-dashoffset: 100;  animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
            50%  { stroke-dashoffset: 0;    animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
            100% { stroke-dashoffset: -100; }
          }
          @keyframes vol-turn { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) {
            .vol-line { animation: none; stroke-dashoffset: 0; }
            .vol-rig  { animation: none; }
          }
        `}</style>

        <path
          className="vol-ghost"
          d="M32.0,30.8L32.2,30.6L32.4,30.5L32.7,30.4L33.0,30.3L33.3,30.3L33.7,30.4L34.0,30.6L34.4,30.8L34.7,31.0L35.0,31.4L35.2,31.8L35.4,32.2L35.5,32.7L35.6,33.2L35.5,33.8L35.4,34.4L35.2,34.9L34.9,35.5L34.5,36.0L34.0,36.5L33.4,36.9L32.8,37.2L32.1,37.5L31.3,37.6L30.5,37.6L29.7,37.5L28.8,37.3L28.0,37.0L27.3,36.6L26.5,36.0L25.9,35.3L25.3,34.5L24.9,33.6L24.5,32.6L24.3,31.6L24.3,30.5L24.4,29.4L24.6,28.3L25.0,27.3L25.6,26.2L26.3,25.3L27.2,24.4L28.2,23.7L29.3,23.0L30.5,22.6L31.8,22.3L33.1,22.2L34.5,22.2L35.9,22.5L37.2,22.9L38.5,23.6L39.7,24.4L40.8,25.4L41.8,26.6L42.6,27.9L43.3,29.4L43.7,30.9L43.9,32.5L43.9,34.1L43.7,35.8L43.3,37.4L42.6,39.0L41.7,40.5L40.5,41.9L39.2,43.1L37.7,44.2L36.1,45.0L34.3,45.6L32.4,46.0L30.5,46.1L28.6,45.9L26.6,45.5L24.8,44.8L23.0,43.9L21.3,42.7L19.8,41.2L18.5,39.6L17.4,37.8L16.6,35.8L16.1,33.7L15.8,31.5L15.8,29.3L16.2,27.0L16.8,24.9L17.8,22.8L19.0,20.8L20.5,19.0L22.3,17.4L24.3,16.1L26.5,15.0L28.8,14.2L31.2,13.8L33.7,13.6L36.3,13.9L38.7,14.4L41.1,15.4L43.4,16.6L45.5,18.2L47.4,20.0L49.1,22.1L50.4,24.5L51.5,27.0L52.2,29.7L52.5,32.4L52.4,35.2L52.0,38.0L51.1,40.8L49.9,43.4L48.3,45.8L46.4,48.0L44.2,50.0L41.8,51.7L39.1,53.0L36.2,53.9L33.2,54.5L30.1,54.6L27.0,54.3L24.0,53.6L21.0,52.5L18.2,51.0L15.6,49.1L13.3,46.8L11.3,44.2L9.7,41.4L8.5,38.3L7.6,35.1L7.3,31.7L7.3,28.4L7.9,25.0L8.9,21.7L10.3,18.6L12.2,15.6L14.5,13.0L17.1,10.6L20.1,8.6L23.3,7.1L26.7,5.9L30.3,5.3L34.0,5.1L37.6,5.4L41.3,6.3L44.7,7.6L48.0,9.4L51.1,11.7L53.8,14.3L56.2,17.4L58.1,20.7L59.6,24.3L60.5,28.1L61.0,32.0"
        />
        <g className="vol-rig">
          <path
            className="vol-line"
            d="M32.0,30.8L32.2,30.6L32.4,30.5L32.7,30.4L33.0,30.3L33.3,30.3L33.7,30.4L34.0,30.6L34.4,30.8L34.7,31.0L35.0,31.4L35.2,31.8L35.4,32.2L35.5,32.7L35.6,33.2L35.5,33.8L35.4,34.4L35.2,34.9L34.9,35.5L34.5,36.0L34.0,36.5L33.4,36.9L32.8,37.2L32.1,37.5L31.3,37.6L30.5,37.6L29.7,37.5L28.8,37.3L28.0,37.0L27.3,36.6L26.5,36.0L25.9,35.3L25.3,34.5L24.9,33.6L24.5,32.6L24.3,31.6L24.3,30.5L24.4,29.4L24.6,28.3L25.0,27.3L25.6,26.2L26.3,25.3L27.2,24.4L28.2,23.7L29.3,23.0L30.5,22.6L31.8,22.3L33.1,22.2L34.5,22.2L35.9,22.5L37.2,22.9L38.5,23.6L39.7,24.4L40.8,25.4L41.8,26.6L42.6,27.9L43.3,29.4L43.7,30.9L43.9,32.5L43.9,34.1L43.7,35.8L43.3,37.4L42.6,39.0L41.7,40.5L40.5,41.9L39.2,43.1L37.7,44.2L36.1,45.0L34.3,45.6L32.4,46.0L30.5,46.1L28.6,45.9L26.6,45.5L24.8,44.8L23.0,43.9L21.3,42.7L19.8,41.2L18.5,39.6L17.4,37.8L16.6,35.8L16.1,33.7L15.8,31.5L15.8,29.3L16.2,27.0L16.8,24.9L17.8,22.8L19.0,20.8L20.5,19.0L22.3,17.4L24.3,16.1L26.5,15.0L28.8,14.2L31.2,13.8L33.7,13.6L36.3,13.9L38.7,14.4L41.1,15.4L43.4,16.6L45.5,18.2L47.4,20.0L49.1,22.1L50.4,24.5L51.5,27.0L52.2,29.7L52.5,32.4L52.4,35.2L52.0,38.0L51.1,40.8L49.9,43.4L48.3,45.8L46.4,48.0L44.2,50.0L41.8,51.7L39.1,53.0L36.2,53.9L33.2,54.5L30.1,54.6L27.0,54.3L24.0,53.6L21.0,52.5L18.2,51.0L15.6,49.1L13.3,46.8L11.3,44.2L9.7,41.4L8.5,38.3L7.6,35.1L7.3,31.7L7.3,28.4L7.9,25.0L8.9,21.7L10.3,18.6L12.2,15.6L14.5,13.0L17.1,10.6L20.1,8.6L23.3,7.1L26.7,5.9L30.3,5.3L34.0,5.1L37.6,5.4L41.3,6.3L44.7,7.6L48.0,9.4L51.1,11.7L53.8,14.3L56.2,17.4L58.1,20.7L59.6,24.3L60.5,28.1L61.0,32.0"
            pathLength="100"
          />
        </g>
      </svg>

      <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        در حال بارگذاری…
      </div>
    </div>
  );
}
