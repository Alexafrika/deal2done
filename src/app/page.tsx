"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck, Star, RefreshCw, Users,
  Search, ClipboardList, Truck, ChevronRight,
  Leaf, Beef, Fish, Coffee, Wheat, Package,
} from "lucide-react";

/* ---- palette (matches catalog) ---- */
const BG = "#f0f2ed";
const WHITE = "#ffffff";
const SAGE = "#5c7f5f";
const SAGE_L = "#e4ede4";
const SAGE_B = "#d0dfd0";
const DARK = "#1e2a1e";
const TEXT = "#4a5c4a";
const MUTED = "#8a9a8a";
const BORDER = "#d8ddd4";
const SHADOW = "0 1px 4px rgba(30,42,30,0.07)";

/* ---- data ---- */

const TRUST = [
  { icon: ShieldCheck, label: "Проверенные поставщики" },
  { icon: Star, label: "Прозрачные цены" },
  { icon: RefreshCw, label: "Быстрый повтор заказа" },
  { icon: Users, label: "Удобно для ресторанов" },
];

const CATEGORIES = [
  { slug: "vegetables", label: "Овощи", icon: Leaf, color: "#7aaa7a", bg: "#f0fbf0" },
  { slug: "meat", label: "Мясо", icon: Beef, color: "#c4816a", bg: "#fdf5f3" },
  { slug: "fish", label: "Рыба", icon: Fish, color: "#6a9db8", bg: "#f0f6fb" },
  { slug: "dairy", label: "Молочное", icon: Package, color: "#c9b87a", bg: "#fdf9f0" },
  { slug: "bakery", label: "Выпечка", icon: Wheat, color: "#c4956a", bg: "#fdf7f0" },
  { slug: "beverages", label: "Напитки", icon: Coffee, color: "#8a9168", bg: "#f5f5f0" },
];

const STEPS = [
  { n: "1", icon: Search, label: "Найдите товар", desc: "Каталог от 120+ поставщиков с фильтрами по цене и сроку." },
  { n: "2", icon: ClipboardList, label: "Сравните условия", desc: "Цена, срок доставки и рейтинг поставщика — всё на виду." },
  { n: "3", icon: Truck, label: "Оформите заказ", desc: "Без звонков. Подтверждение и отслеживание онлайн." },
];

/* ---- page ---- */

export default function HomePage() {
  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <Header />

      <main className="pb-nav">

        {/* HERO */}
        <section
          className="px-4 pt-10 pb-10"
          style={{ background: DARK }}
        >
          <div className="max-w-screen-lg mx-auto">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              B2B маркетплейс для HoReCa
            </p>

            <h1 className="font-extrabold tracking-tight leading-[1.15] mb-4">
              <span
                className="block text-[26px] sm:text-[30px]"
                style={{ color: WHITE }}
              >
                Закупки для HoReCa —
              </span>
              <span
                className="block text-[26px] sm:text-[30px]"
                style={{ color: "#9abf9d" }}
              >
                быстрее, проще, прозрачнее
              </span>
            </h1>

            <p
              className="text-[14px] leading-relaxed mb-8 max-w-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Сравнивайте поставщиков, цены и сроки поставки в одном месте.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/catalog"
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.97]"
                style={{ background: SAGE, color: WHITE }}
              >
                Открыть каталог
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/register?role=supplier"
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-semibold text-[14px] border transition-all active:scale-[0.97]"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Стать поставщиком
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-screen-lg mx-auto px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 py-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: SAGE_L }}
                  >
                    <Icon size={14} style={{ color: SAGE }} />
                  </div>
                  <span
                    className="text-[12px] font-semibold leading-tight"
                    style={{ color: DARK }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-screen-lg mx-auto px-4 pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-[15px] font-extrabold"
                style={{ color: DARK }}
              >
                Категории
              </h2>
              <Link
                href="/catalog"
                className="flex items-center gap-0.5 text-[12px] font-semibold"
                style={{ color: SAGE }}
              >
                Все <ChevronRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {CATEGORIES.map(({ slug, label, icon: Icon, color, bg }) => (
                <Link
                  key={slug}
                  href={`/catalog?category=${slug}`}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all active:scale-[0.97]"
                  style={{
                    background: WHITE,
                    borderColor: BORDER,
                    boxShadow: SHADOW,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <span
                    className="text-[11px] font-semibold text-center"
                    style={{ color: DARK }}
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-screen-lg mx-auto px-4 py-6">
            <h2
              className="text-[15px] font-extrabold mb-4"
              style={{ color: DARK }}
            >
              Как это работает
            </h2>
            <div className="flex flex-col gap-2.5">
              {STEPS.map(({ n, icon: Icon, label, desc }) => (
                <div
                  key={n}
                  className="flex gap-4 rounded-2xl p-4 border"
                  style={{ background: WHITE, borderColor: BORDER, boxShadow: SHADOW }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: SAGE_L }}
                  >
                    <Icon size={17} style={{ color: SAGE }} />
                  </div>
                  <div>
                    <p
                      className="text-[13px] font-bold mb-0.5"
                      style={{ color: DARK }}
                    >
                      <span style={{ color: SAGE, marginRight: "4px" }}>{n}.</span>
                      {label}
                    </p>
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: MUTED }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUPPLIER BLOCK */}
        <section className="px-4 py-5" style={{ background: BG }}>
          <div
            className="relative overflow-hidden rounded-2xl px-5 py-6 border"
            style={{ background: DARK, borderColor: "rgba(255,255,255,0.07)" }}
          >
            {/* subtle dot grid */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="relative">
              <p
                className="font-extrabold text-[16px] mb-1"
                style={{ color: WHITE }}
              >
                Вы поставщик?
              </p>
              <p
                className="text-[13px] leading-relaxed mb-4"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Продавайте ресторанам и отелям по всему Казахстану. Бесплатно.
              </p>
              <Link
                href="/register?role=supplier"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95"
                style={{ background: WHITE, color: DARK }}
              >
                Зарегистрироваться
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <BottomNav />
    </div>
  );
}
