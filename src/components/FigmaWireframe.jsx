import './FigmaWireframe.css'

// kind: booking | dashboard | event | system
export default function FigmaWireframe({ kind = 'system', drawn = true, style }) {
  const bars = [12, 20, 9, 26, 16, 22]
  const range = (n) => Array.from({ length: n }, (_, i) => i + 1)

  return (
    // Esquema (wireframe) desenhado em linhas: não é a tela real, é o "blueprint" do tipo de projeto.
    <svg className={`wire${drawn ? ' is-drawn' : ''}`} viewBox="0 0 320 200" aria-hidden="true" style={style}>
      <rect className="wire__frame" x="1" y="1" width="318" height="198" rx="6" pathLength="1" />
      <line className="wire__l" x1="1" y1="22" x2="319" y2="22" pathLength="1" />
      <circle className="wire__dot" cx="12" cy="11.5" r="3" />
      <circle className="wire__dot" cx="22" cy="11.5" r="3" />
      <circle className="wire__dot" cx="32" cy="11.5" r="3" />

      {kind === 'booking' ? (
        <g>
          <rect className="wire__l" x="16" y="36" width="140" height="62" pathLength="1" />
          <line className="wire__l" x1="16" y1="112" x2="130" y2="112" pathLength="1" />
          <line className="wire__l" x1="16" y1="124" x2="100" y2="124" pathLength="1" />
          <rect className="wire__fill" x="16" y="140" width="70" height="18" />
          {Array.from({ length: 15 }, (_, i) => (
            <g key={i}>
              <rect
                className="wire__l"
                x={176 + (i % 5) * 26}
                y={40 + Math.floor(i / 5) * 26}
                width="20"
                height="20"
                pathLength="1"
              />
            </g>
          ))}
          <rect className="wire__fill" x="202" y="66" width="20" height="20" />
          <rect className="wire__l" x="176" y="128" width="128" height="16" pathLength="1" />
          <rect className="wire__l" x="176" y="150" width="128" height="16" pathLength="1" />
        </g>
      ) : kind === 'dashboard' ? (
        <g>
          <line className="wire__l" x1="62" y1="22" x2="62" y2="199" pathLength="1" />
          {range(5).map((i) => (
            <line key={i} className="wire__l" x1="14" y1={30 + i * 16} x2="50" y2={30 + i * 16} pathLength="1" />
          ))}
          {range(3).map((i) => (
            <rect key={`k${i}`} className="wire__l" x={74 + (i - 1) * 80} y="34" width="70" height="36" pathLength="1" />
          ))}
          <polyline
            className="wire__l wire__accent"
            points="76,160 110,132 140,146 176,104 210,118 246,86 300,96"
            pathLength="1"
          />
          <line className="wire__l" x1="74" y1="180" x2="306" y2="180" pathLength="1" />
          {range(6).map((i) => (
            <rect
              key={`b${i}`}
              className="wire__fill"
              x={80 + (i - 1) * 38}
              y={180 - bars[i - 1]}
              width="14"
              height={bars[i - 1]}
            />
          ))}
        </g>
      ) : kind === 'event' ? (
        <g>
          <rect className="wire__fill wire__soft" x="16" y="34" width="288" height="70" />
          <line className="wire__l" x1="30" y1="56" x2="190" y2="56" pathLength="1" />
          <line className="wire__l" x1="30" y1="72" x2="150" y2="72" pathLength="1" />
          <rect className="wire__fill" x="30" y="84" width="60" height="12" />
          {range(3).map((i) => (
            <rect key={i} className="wire__l" x={16 + (i - 1) * 98} y="116" width="88" height="70" pathLength="1" />
          ))}
          {range(3).map((i) => (
            <circle key={`c${i}`} className="wire__l" cx={60 + (i - 1) * 98} cy="142" r="12" pathLength="1" />
          ))}
        </g>
      ) : (
        <g>
          <rect className="wire__l" x="16" y="34" width="288" height="20" pathLength="1" />
          {range(6).map((i) => (
            <line key={i} className="wire__l" x1="16" y1={66 + i * 18} x2="304" y2={66 + i * 18} pathLength="1" />
          ))}
          {range(3).map((i) => (
            <line key={`v${i}`} className="wire__l" x1={16 + i * 72} y1="66" x2={16 + i * 72} y2="174" pathLength="1" />
          ))}
          <rect className="wire__fill" x="236" y="182" width="68" height="10" />
        </g>
      )}
    </svg>
  )
}
