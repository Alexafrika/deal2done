"use client";

import { useState } from "react";

/* Slugs match backend category_slug values */
export const DONUT_CATEGORIES = [
  { slug: "vegetables", label: "Овощи",          color: "#7aaa7a" },
  { slug: "meat",       label: "Мясо",            color: "#c4816a" },
  { slug: "fish",       label: "Рыба",            color: "#6a9db8" },
  { slug: "dairy",      label: "Молочное",        color: "#c9b87a" },
  { slug: "bakery",     label: "Выпечка",         color: "#c4956a" },
  { slug: "beverages",  label: "Напитки",         color: "#8a9168" },
  { slug: "grocery",    label: "Соусы / Бакалея", color: "#9a8ab0" },
];

const CX = 100;
const CY = 100;
const R  = 68;   /* radius of stroke centre-line */
const SW = 28;   /* stroke width (ring thickness) */
const N  = DONUT_CATEGORIES.length;
const CIRC = 2 * Math.PI * R;
const EACH = CIRC / N;    /* pixels per segment inc. gap */
const GAP  = 3;
const ARC  = EACH - GAP;

interface Props {
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export function CategoryDonut({ activeSlug, onSelect }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const labelSlug = hovered !== null
    ? DONUT_CATEGORIES[hovered].slug
    : activeSlug;
  const centerCat = DONUT_CATEGORIES.find(c => c.slug === labelSlug);

  return (
    <div
      className="rounded-2xl border p-3.5 mb-3"
      style={{
        background: "#ffffff",
        borderColor: "#d8ddd4",
        boxShadow: "0 1px 4px rgba(30,42,30,0.07)",
      }}
    >
      {/* Title row */}
      <p
        className="text-[11px] font-semibold uppercase tracking-wider mb-2.5"
        style={{ color: "#8a9a8a" }}
      >
        Категории товаров
      </p>

      <div className="flex items-center gap-3">
        {/* SVG donut */}
        <div className="shrink-0">
          <svg
            width="150"
            height="150"
            viewBox="0 0 200 200"
            style={{ display: "block" }}
          >
            {/* Background ring */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="#f0f0ee"
              strokeWidth={SW}
            />

            {/* Category segments */}
            {DONUT_CATEGORIES.map((cat, i) => {
              const dashOffset = -(i * EACH);
              const isActive   = activeSlug === cat.slug;
              const isHovered  = hovered === i;
              const anyActive  = activeSlug !== "";
              const opacity    = anyActive && !isActive ? 0.25 : 1;
              const sw         = isActive ? SW + 6 : isHovered ? SW + 3 : SW;

              return (
                <g
                  key={cat.slug}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelect(cat.slug === activeSlug ? "" : cat.slug)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle
                    cx={CX} cy={CY} r={R}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={sw}
                    strokeDasharray={`${ARC} ${CIRC - ARC}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${CX} ${CY})`}
                    opacity={opacity}
                    style={{ transition: "all 0.18s ease" }}
                  />
                </g>
              );
            })}

            {/* Center text */}
            {centerCat ? (
              <>
                <text
                  x={CX} y={CY - 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#1e2a1e"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {centerCat.label.split(" /")[0]}
                </text>
                {centerCat.label.includes("/") && (
                  <text
                    x={CX} y={CY + 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fill="#8a9a8a"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    Бакалея
                  </text>
                )}
                {!centerCat.label.includes("/") && (
                  <text
                    x={CX} y={CY + 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fill="#8a9a8a"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    выбрано
                  </text>
                )}
              </>
            ) : (
              <>
                <text
                  x={CX} y={CY - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#4a5c4a"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  Все
                </text>
                <text
                  x={CX} y={CY + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill="#8a9a8a"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  категории
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1 flex-1">
          {DONUT_CATEGORIES.map((cat) => {
            const isActive = activeSlug === cat.slug;
            const anyActive = activeSlug !== "";
            return (
              <button
                key={cat.slug}
                onClick={() => onSelect(cat.slug === activeSlug ? "" : cat.slug)}
                className="flex items-center gap-2 w-full text-left"
                style={{ cursor: "pointer" }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity duration-150"
                  style={{
                    backgroundColor: cat.color,
                    opacity: anyActive && !isActive ? 0.3 : 1,
                  }}
                />
                <span
                  className="text-[12px] leading-tight transition-all duration-150"
                  style={{
                    color: isActive ? "#1e2a1e" : anyActive ? "#8a9a8a" : "#4a5c4a",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}

          {activeSlug && (
            <button
              onClick={() => onSelect("")}
              className="mt-1 text-[11px] font-semibold text-left transition-colors"
              style={{ color: "#5c7f5f" }}
            >
              Сбросить выбор
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
