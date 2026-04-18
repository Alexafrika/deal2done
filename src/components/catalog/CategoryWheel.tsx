"use client";

import { useState } from "react";

/* ─────────────────────────── category data ──────────────────────────── */
/* Slugs intentionally match DONUT_CATEGORIES for a future drop-in swap. */
export const WHEEL_CATEGORIES = [
  { slug: "vegetables", label: "Овощи",   emoji: "🥦", color: "#7a9e7e" },
  { slug: "meat",       label: "Мясо",    emoji: "🥩", color: "#b87060" },
  { slug: "fish",       label: "Рыба",    emoji: "🐟", color: "#5f8fa8" },
  { slug: "dairy",      label: "Молочное",emoji: "🧀", color: "#c4a55a" },
  { slug: "bakery",     label: "Выпечка", emoji: "🍞", color: "#b87c4e" },
  { slug: "beverages",  label: "Напитки", emoji: "🍵", color: "#6b7a52" },
  { slug: "grocery",    label: "Бакалея", emoji: "🥫", color: "#8a7a9e" },
];

/* ──────────────────────────── geometry ─────────────────────────────────
 *  viewBox: 320 × 320 (1 unit = 1 CSS px)
 *
 *  Center circle radius  Rc = 58  →  ⌀ 116 px  (spec: ~120 px)
 *  Ring centre-line      R  = 109
 *  Ring stroke width     SW = 96
 *    inner edge = R − SW/2 = 109 − 48 =  61  (3 px gap from Rc outer edge 58)
 *    outer edge = R + SW/2 = 109 + 48 = 157  (3 px gap from SVG edge 160)
 * ─────────────────────────────────────────────────────────────────────── */
const CX   = 160;
const CY   = 160;
const Rc   = 58;   /* center circle radius */
const R    = 109;  /* ring centre-line radius */
const SW   = 96;   /* ring stroke width */
const N    = WHEEL_CATEGORIES.length;
const CIRC = 2 * Math.PI * R;  /* full circumference ≈ 684.9 px */
const EACH = CIRC / N;          /* arc length per sector ≈ 97.8 px */
const GAP  = 4;                 /* gap between sectors in px */
const ARC  = EACH - GAP;        /* filled arc per sector ≈ 93.8 px */

/* Midpoint angle of sector i in radians (0 = top, clockwise). */
function sectorMidAngle(i: number): number {
  const deg = (i + 0.5) * (360 / N) - 90;
  return (deg * Math.PI) / 180;
}

/* Lighten a hex colour toward white by fraction t ∈ [0, 1]. */
function lighten(hex: string, t = 0.22): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const m = (c: number) => Math.round(c + (255 - c) * t);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

/* ─────────────────────────────── props ─────────────────────────────── */
interface Props {
  /** Currently selected category slug, or "". Supplied by parent when wired. */
  activeSlug?: string;
  /** Called with the toggled slug (or "" to clear) on user click. */
  onSelect?: (slug: string) => void;
}

/* ──────────────────────────── component ────────────────────────────── */
export function CategoryWheel({ activeSlug, onSelect }: Props) {
  /* Internal state: active while component runs standalone (no props supplied). */
  const [localActive, setLocalActive] = useState("");
  const [hovered, setHovered]         = useState<number | null>(null);
  /* Accumulated rotation in degrees — allows shortest-arc animation. */
  const [rotation, setRotation]       = useState(0);

  /* Parent prop takes precedence when provided. */
  const active = activeSlug !== undefined ? activeSlug : localActive;

  function handleClick(slug: string) {
    const next = slug === active ? "" : slug;
    setLocalActive(next);
    onSelect?.(next);

    /* Rotate ring so sector i's midpoint lands at 12 o'clock.
     * Sector i midpoint sits at (i + 0.5) × (360/N) degrees from top,
     * so the ring must rotate by −(i + 0.5) × (360/N) degrees.
     * Shortest-arc: ((diff % 360) + 360) % 360 normalises JS negative
     * modulo to [0, 360), then map values > 180 to negative. */
    setRotation((prev) => {
      const targetRaw =
        next === ""
          ? 0
          : -((WHEEL_CATEGORIES.findIndex((c) => c.slug === next) + 0.5) *
              (360 / N));
      const diff  = targetRaw - prev;
      const mod   = ((diff % 360) + 360) % 360;   // [0, 360)
      const delta = mod > 180 ? mod - 360 : mod;  // (−180, 180]
      return prev + delta;
    });
  }

  const activeCat = WHEEL_CATEGORIES.find((c) => c.slug === active);

  return (
    <div
      style={{
        width:           320,
        height:          320,
        display:         "inline-flex",
        alignItems:      "center",
        justifyContent:  "center",
        position:        "relative",
      }}
    >
      <svg
        width={320}
        height={320}
        viewBox="0 0 320 320"
        aria-label="Колесо категорий"
        role="img"
        style={{ display: "block", overflow: "visible" }}
      >
        {/* ── background track ring ── */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="#e8e3d8"        /* warm milk */
          strokeWidth={SW}
        />

        {/* ── rotating ring group — center circle stays outside ── */}
        <g
          style={{
            transform:       `rotate(${rotation}deg)`,
            transformBox:    "view-box",
            transformOrigin: "50% 50%",
            transition:      "transform 300ms ease-out",
          }}
        >
        {WHEEL_CATEGORIES.map((cat, i) => {
          const isActive  = active === cat.slug;
          const isHovered = hovered === i;
          const anyActive = active !== "";

          /* SVG dash trick: sector i starts at offset −(i × EACH) */
          const dashOffset = -(i * EACH);

          /* Stroke expands outward for selected / hovered states */
          const sw = isActive ? SW + 10 : isHovered ? SW + 5 : SW;

          /* Lighten on hover (unless already selected) */
          const strokeColor =
            isHovered && !isActive ? lighten(cat.color, 0.22) : cat.color;

          /* Non-selected sectors: slightly muted but still legible */
          const sectorOpacity = anyActive && !isActive ? 0.55 : 1;

          /* Label positioned at ring centre-line */
          const θ  = sectorMidAngle(i);
          const lx = CX + R * Math.cos(θ);
          const ly = CY + R * Math.sin(θ);

          return (
            <g
              key={cat.slug}
              onClick={() => handleClick(cat.slug)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Soft radial glow layer behind the selected arc */}
              {isActive && (
                <circle
                  cx={CX} cy={CY} r={R}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth={SW + 26}
                  strokeDasharray={`${ARC} ${CIRC - ARC}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${CX} ${CY})`}
                  opacity={0.16}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Main filled arc */}
              <circle
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={strokeColor}
                strokeWidth={sw}
                strokeDasharray={`${ARC} ${CIRC - ARC}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${CX} ${CY})`}
                opacity={sectorOpacity}
                style={{ transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)" }}
              />

              {/* Label: emoji + short name, centered on the arc midpoint */}
              <g
                opacity={anyActive && !isActive ? 0.7 : 1}
                style={{ transition: "opacity 0.22s ease", pointerEvents: "none" }}
              >
                <text
                  x={lx}
                  y={ly - 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isActive || isHovered ? 19 : 16}
                  style={{ userSelect: "none" }}
                >
                  {cat.emoji}
                </text>
                <text
                  x={lx}
                  y={ly + 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={8.5}
                  fontWeight={isActive ? 700 : 600}
                  fill={isActive ? "#ffffff" : "#2a3a2a"}
                  fontFamily="Inter, system-ui, sans-serif"
                  style={{ userSelect: "none" }}
                >
                  {cat.label}
                </text>
              </g>
            </g>
          );
        })}
        </g>{/* end rotating ring group */}

        {/* ── center circle ── */}
        <circle
          cx={CX} cy={CY} r={Rc}
          fill="#f5f0e8"
          stroke="#cdc8be"
          strokeWidth={1}
        />

        {/* ── center text ── */}
        {activeCat ? (
          /* Active: emoji + label + subtle dismiss */
          <>
            <text
              x={CX} y={CY - 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={22}
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {activeCat.emoji}
            </text>
            <text
              x={CX} y={CY + 7}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={700}
              fill="#1e2a1e"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="-0.2"
              style={{ pointerEvents: "none" }}
            >
              {activeCat.label}
            </text>
            <text
              x={CX} y={CY + 23}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="#b0bab0"
              fontFamily="Inter, system-ui, sans-serif"
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(active)}
            >
              ✕ сбросить
            </text>
          </>
        ) : (
          /* Idle: Deal2Done wordmark */
          <>
            <text
              x={CX} y={CY - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={15}
              fontWeight={800}
              fill="#4a5c4a"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="-0.3"
              style={{ pointerEvents: "none" }}
            >
              Deal
            </text>
            <text
              x={CX} y={CY + 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={15}
              fontWeight={800}
              fill="#7a9e6a"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="-0.3"
              style={{ pointerEvents: "none" }}
            >
              2Done
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
