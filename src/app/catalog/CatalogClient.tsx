"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Package } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SkeletonCard } from "@/components/catalog/SkeletonCard";
import { CategoryWheel, WHEEL_CATEGORIES } from "@/components/catalog/CategoryWheel";
import { productsApi } from "@/lib/api";
import { clsx } from "clsx";

/* ---- constants ---- */

const SORT_OPTIONS = [
  { value: "created_at-desc",   label: "Новые" },
  { value: "price-asc",         label: "Дешевле" },
  { value: "price-desc",        label: "Дороже" },
  { value: "delivery_days-asc", label: "Быстрая доставка" },
];

const CATEGORY_CHIPS = [
  { label: "Все",             slug: "",            emoji: "🏪" },
  { label: "Овощи",           slug: "vegetables",  emoji: "🥦" },
  { label: "Мясо",            slug: "meat",        emoji: "🥩" },
  { label: "Рыба",            slug: "fish",        emoji: "🐟" },
  { label: "Молочное",        slug: "dairy",       emoji: "🥛" },
  { label: "Выпечка",         slug: "bakery",      emoji: "🥐" },
  { label: "Напитки",         slug: "beverages",   emoji: "☕" },
  { label: "Соусы/Бакалея",   slug: "grocery",     emoji: "🌾" },
];

/* Hint chips shown in the info block when a category is selected. */
const CATEGORY_HINTS: Record<string, string[]> = {
  vegetables: ["Помидоры", "Огурцы", "Картофель", "Зелень", "Прочее"],
  meat:       ["Говядина", "Свинина", "Курица", "Баранина", "Прочее"],
  fish:       ["Лосось", "Треска", "Тунец", "Креветки", "Прочее"],
  dairy:      ["Молоко", "Сыр", "Йогурт", "Масло", "Прочее"],
  bakery:     ["Хлеб", "Батон", "Булочки", "Торты", "Прочее"],
  beverages:  ["Соки", "Вода", "Чай", "Кофе", "Сиропы", "Прочее"],
  grocery:    ["Соусы", "Крупы", "Консервы", "Специи", "Прочее"],
};

const TAG_FILTERS = [
  { key: "is_halal",        label: "Халяль",    emoji: "🟢" },
  { key: "is_organic",      label: "Органик",   emoji: "🌿" },
  { key: "is_local_farmer", label: "Фермер",    emoji: "🌾" },
  { key: "in_stock",        label: "В наличии", emoji: "✅" },
] as const;

/* ---- palette helpers ---- */
const SAGE   = "#5c7f5f";
const SAGE_L = "#e4ede4";
const SAGE_B = "#d0dfd0";
const TEXT_D = "#1e2a1e";
const TEXT_M = "#8a9a8a";
const BORDER = "#d8ddd4";

/* ---- page ---- */

export default function CatalogPage() {
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ]               = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sort, setSort]         = useState("created_at-desc");
  const [filters, setFilters]   = useState({
    is_halal:        searchParams.get("is_halal") === "true",
    is_organic:      false,
    is_local_farmer: searchParams.get("is_local_farmer") === "true",
    in_stock:        true,
  });
  const [page, setPage] = useState(1);

  const [sort_by, sort_dir] = sort.split("-");

  const { data, isLoading } = useQuery({
    queryKey: ["products", q, category, filters, sort_by, sort_dir, page],
    queryFn: () =>
      productsApi.list({
        q: q || undefined,
        category_slug: category || undefined,
        sort_by,
        sort_dir,
        page,
        page_size: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      }),
    select: (res) => res.data,
  });

  const products    = data?.items ?? [];
  const totalPages  = data?.pages ?? 1;

  const activeFilterCount =
    Object.entries(filters).filter(([k, v]) => k !== "in_stock" && v).length +
    (category ? 1 : 0);

  const clearAll = () => {
    setQ("");
    setCategory("");
    setFilters({ is_halal: false, is_organic: false, is_local_farmer: false, in_stock: true });
    setSort("created_at-desc");
    setPage(1);
  };

  /* category from donut == category string, toggle on second tap */
  const handleCategorySelect = (slug: string) => {
    setCategory(slug);
    setPage(1);
  };

  /* active category label for display */
  const activeCategoryLabel =
    WHEEL_CATEGORIES.find(c => c.slug === category)?.label ??
    CATEGORY_CHIPS.find(c => c.slug === category)?.label ??
    "";

  const activeCategoryEmoji =
    WHEEL_CATEGORIES.find(c => c.slug === category)?.emoji ?? "";

  return (
    <div className="min-h-screen pb-nav" style={{ background: "#f0f2ed" }}>

      {/* TOP SECTION */}
      <div className="px-4 pt-5 pb-3" style={{ background: "#f0f2ed" }}>
        <h1
          className="text-[22px] font-extrabold tracking-tight mb-0.5"
          style={{ color: TEXT_D }}
        >
          Каталог
        </h1>
        <p className="text-[13px]" style={{ color: TEXT_M }}>
          {isLoading
            ? "Загрузка..."
            : `${data?.total ?? 0} товаров от проверенных поставщиков`}
        </p>
      </div>

      {/* CATEGORY WHEEL */}
      {!q && (
        <div className="flex justify-center py-2">
          <CategoryWheel
            activeSlug={category}
            onSelect={handleCategorySelect}
          />
        </div>
      )}

      {/* CATEGORY INFO BLOCK — appears below wheel when a category is selected */}
      {!q && category && (
        <div
          className="mx-3 mb-5 rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #f2f6ef 0%, #f5f0e6 100%)",
            border:     "1px solid #c4cebe",
            boxShadow:  "0 6px 24px rgba(30,42,30,0.13), 0 1px 4px rgba(30,42,30,0.06)",
          }}
        >
          {/* top accent bar — slightly thicker, richer gradient */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #5c8f62 0%, #7a9e7e 40%, #c4a55a 100%)" }} />

          <div className="px-4 pt-3.5 pb-4">
            {/* title row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex items-center justify-center rounded-xl text-[18px]"
                  style={{
                    width: 36, height: 36,
                    background: "rgba(92,143,98,0.14)",
                    border:     "1px solid rgba(92,143,98,0.2)",
                  }}
                >
                  {activeCategoryEmoji}
                </span>
                <span
                  className="text-[17px] font-extrabold tracking-tight"
                  style={{ color: "#1a2a1a", letterSpacing: "-0.01em" }}
                >
                  {activeCategoryLabel}
                </span>
              </div>

              <button
                onClick={() => handleCategorySelect("")}
                className="rounded-full text-[11px] font-semibold transition-opacity hover:opacity-60"
                style={{
                  padding:       "4px 11px",
                  background:    "rgba(92,143,98,0.1)",
                  border:        "1px solid rgba(92,143,98,0.3)",
                  color:         "#5c8f62",
                  letterSpacing: "0.02em",
                }}
              >
                сбросить
              </button>
            </div>

            {/* helper line */}
            <p
              className="text-[11px] mb-3"
              style={{ color: "#8aaa8a", letterSpacing: "0.02em" }}
            >
              Показаны товары этой категории
            </p>

            {/* divider */}
            <div style={{ height: 1, background: "rgba(92,143,98,0.15)", marginBottom: 11 }} />

            {/* hint chips */}
            <div className="flex flex-wrap gap-2">
              {(CATEGORY_HINTS[category] ?? []).map((hint) => (
                <span
                  key={hint}
                  className="rounded-full text-[11px] font-semibold"
                  style={{
                    padding:    "4px 11px",
                    background: "rgba(92,143,98,0.10)",
                    border:     "1px solid rgba(92,143,98,0.22)",
                    color:      "#3d6644",
                    letterSpacing: "0.02em",
                  }}
                >
                  {hint}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STICKY SEARCH + FILTER BAR */}
      <div
        className="sticky top-14 z-20 px-4 py-3 border-b"
        style={{ background: "#f0f2ed", borderColor: BORDER }}
      >
        <div className="flex gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: TEXT_M }}
            />
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Поиск товаров..."
              className="w-full rounded-xl pl-9 pr-8 h-10 text-[14px] border outline-none transition-all"
              style={{
                background: "#ffffff",
                borderColor: BORDER,
                color: TEXT_D,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = SAGE)}
              onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}
            />
            {q && (
              <button
                onClick={() => { setQ(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: TEXT_M }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 h-10 rounded-xl border text-[13px] font-semibold shrink-0 relative transition-all"
            style={{
              background: showFilters || activeFilterCount > 0 ? SAGE_L : "#ffffff",
              borderColor: showFilters || activeFilterCount > 0 ? SAGE_B : BORDER,
              color: showFilters || activeFilterCount > 0 ? SAGE : "#4a5c4a",
            }}
          >
            <SlidersHorizontal size={14} />
            Фильтры
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ background: SAGE }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div
          className="border-b px-4 py-4 animate-slide-down"
          style={{ background: "#ffffff", borderColor: BORDER }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold" style={{ color: TEXT_D }}>Фильтры</span>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[12px] font-semibold"
                  style={{ color: SAGE }}
                >
                  Сбросить все
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#f0f2ed]"
              >
                <X size={16} style={{ color: TEXT_M }} />
              </button>
            </div>
          </div>

          {/* Tag filters */}
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_M }}>
            Характеристики
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {TAG_FILTERS.map(({ key, label, emoji }) => {
              const active = filters[key as keyof typeof filters];
              return (
                <button
                  key={key}
                  onClick={() => setFilters(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border font-medium transition-all"
                  style={{
                    background: active ? SAGE_L : "#f0f2ed",
                    borderColor: active ? SAGE_B : BORDER,
                    color: active ? SAGE : "#4a5c4a",
                  }}
                >
                  <span>{emoji}</span> {label}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_M }}>
            Сортировка
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className="px-3 py-2 rounded-xl text-[13px] border text-center font-medium transition-all"
                  style={{
                    background: active ? SAGE_L : "#f0f2ed",
                    borderColor: active ? SAGE_B : BORDER,
                    color: active ? SAGE : "#4a5c4a",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORY CHIPS ROW */}
      <div
        className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide"
        style={{ background: "#f0f2ed" }}
      >
        {CATEGORY_CHIPS.map((cat) => {
          const active = category === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => { setCategory(cat.slug); setPage(1); }}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap border shrink-0 transition-all"
              style={{
                background: active ? SAGE_L : "#ffffff",
                borderColor: active ? SAGE_B : BORDER,
                color: active ? SAGE : "#4a5c4a",
              }}
            >
              <span className="text-[12px]">{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* RESULTS META */}
      {(category || q || activeFilterCount > 0) && (
        <div className="px-4 pb-2 flex items-center justify-between">
          <span className="text-[12px]" style={{ color: TEXT_M }}>
            {isLoading
              ? "Загрузка..."
              : activeCategoryLabel
              ? `${activeCategoryLabel} · ${data?.total ?? 0} товаров`
              : `${data?.total ?? 0} товаров`}
          </span>
          <button
            onClick={clearAll}
            className="text-[12px] font-semibold"
            style={{ color: SAGE }}
          >
            Сбросить
          </button>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          /* EMPTY STATE */
          <div
            className="flex flex-col items-center justify-center py-10 rounded-2xl border text-center"
            style={{ background: "#ffffff", borderColor: BORDER }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: SAGE_L }}
            >
              <Package size={24} style={{ color: SAGE }} />
            </div>
            <p
              className="text-[15px] font-bold mb-1"
              style={{ color: TEXT_D }}
            >
              Ничего не найдено
            </p>
            <p
              className="text-[13px] mb-5 max-w-[220px] leading-relaxed"
              style={{ color: TEXT_M }}
            >
              Попробуйте другой запрос или уберите фильтры
            </p>
            <button
              onClick={clearAll}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold border transition-all"
              style={{
                background: SAGE_L,
                borderColor: SAGE_B,
                color: SAGE,
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-in">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-5 px-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all disabled:opacity-40"
            style={{
              background: "#ffffff",
              borderColor: BORDER,
              color: "#4a5c4a",
            }}
          >
            Назад
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pn = i + 1;
              const active = page === pn;
              return (
                <button
                  key={pn}
                  onClick={() => setPage(pn)}
                  className="w-9 h-9 rounded-xl text-[13px] font-bold border transition-all"
                  style={{
                    background: active ? SAGE : "#ffffff",
                    borderColor: active ? SAGE : BORDER,
                    color: active ? "#ffffff" : "#4a5c4a",
                  }}
                >
                  {pn}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all disabled:opacity-40"
            style={{
              background: "#ffffff",
              borderColor: BORDER,
              color: "#4a5c4a",
            }}
          >
            Вперёд
          </button>
        </div>
      )}

    </div>
  );
}
