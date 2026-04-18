"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ShoppingBag, X, ChevronRight, Store, ArrowRight, ClipboardList } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { ordersApi } from "@/lib/api";
import { clsx } from "clsx";

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(n);

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, kycCompleted, user } = useAuthStore();
  const { carts, fetchCarts, removeItem, clearCart, addItem, isLoading } = useCartStore();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) fetchCarts();
  }, [isAuthenticated]);

  const handleCheckout = async (cartId: string) => {
    setCheckingOut(cartId);
    try {
      const { data } = await ordersApi.checkout({
        cart_id: cartId,
        delivery_method: "supplier_delivery",
        payment_method: "bank_transfer",
      });
      toast.success(`Заказ ${data.order_number} оформлен! 🎉`);
      await fetchCarts();
      router.push(`/orders/${data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Ошибка оформления заказа");
    } finally {
      setCheckingOut(null);
    }
  };

  /* ── Unauthenticated state ─────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<ShoppingBag size={44} className="text-text-muted" />}
        title="Войдите в аккаунт"
        sub="Чтобы увидеть корзину и оформить заказ"
        cta={{ label: "Войти", href: "/login" }}
      />
    );
  }
  /* ── Buyer KYC not completed ─────────────────────────── */
  if (user?.role === "buyer" && !kycCompleted) {
    return (
      <EmptyState
        icon={<ClipboardList size={44} className="text-text-muted" />}
        title="Требуется верификация"
        sub="Заполните анкету о вашем бизнесе, чтобы разблокировать корзину"
        cta={{ label: "Пройти верификацию", href: "/kyc" }}
      />
    );
  }
  /* ── Empty cart ────────────────────────────────────────── */
  if (carts.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={44} className="text-text-muted" />}
        title="Корзина пустая"
        sub="Добавьте товары из каталога"
        cta={{ label: "Перейти в каталог", href: "/catalog" }}
      />
    );
  }

  const grandTotal = carts.reduce(
    (sum, cart) => sum + cart.items.reduce((s: number, i: any) => s + i.quantity * i.unit_price, 0),
    0
  );

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-screen-sm mx-auto px-4 pt-4 pb-nav">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold tracking-tight">Корзина</h1>
        <span className="text-sm text-text-muted">
          {carts.reduce((n, c) => n + c.items.length, 0)} позиций
        </span>
      </div>

      {/* ── Cart groups per supplier ──────────────────────── */}
      <div className="flex flex-col gap-4">
        {carts.map((cart) => {
          const subtotal = cart.items.reduce(
            (s: number, i: any) => s + i.quantity * i.unit_price,
            0
          );
          const isProcessing = checkingOut === cart.id;

          return (
            <div key={cart.id} className="card p-0 overflow-hidden">

              {/* Supplier header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-secondary">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-brand-500" />
                  <span className="text-sm font-semibold text-text-primary">
                    Поставщик
                  </span>
                </div>
                <button
                  onClick={() => clearCart(cart.id)}
                  className="flex items-center gap-1 text-[11px] text-text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                  Очистить
                </button>
              </div>

              {/* Items */}
              <div className="flex flex-col divide-y divide-surface-border px-4">
                {cart.items.map((item: any) => {
                  const img =
                    item.product.images?.find((i: any) => i.is_primary)?.url ??
                    item.product.images?.[0]?.url;

                  return (
                    <div key={item.id} className="flex gap-3 py-3">
                      {/* Thumbnail */}
                      <Link
                        href={`/product/${item.product.id}`}
                        className="w-16 h-16 rounded-xl bg-surface-secondary overflow-hidden shrink-0 relative"
                      >
                        {img ? (
                          <Image
                            src={img}
                            alt={item.product.name_ru}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-surface-border">
                            <ShoppingBag size={20} />
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold line-clamp-2 leading-snug text-text-primary">
                          {item.product.name_ru}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {fmt(item.unit_price)} / {item.product.unit}
                        </p>

                        {/* Quantity row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-surface-secondary rounded-xl px-1 py-0.5">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg
                                hover:bg-surface-border transition-colors active:scale-90"
                              aria-label="Уменьшить"
                            >
                              <Minus size={13} className="text-text-secondary" />
                            </button>
                            <span className="text-sm font-bold text-text-primary min-w-[28px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addItem(item.product.id, item.product.moq ?? 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg
                                hover:bg-surface-border transition-colors active:scale-90"
                              aria-label="Увеличить"
                            >
                              <Plus size={13} className="text-text-secondary" />
                            </button>
                          </div>
                          <span className="text-[13px] font-bold text-text-primary">
                            {fmt(item.quantity * item.unit_price)}
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="self-start p-1 btn-icon"
                        aria-label="Удалить"
                      >
                        <X size={16} className="text-text-muted" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Summary + CTA */}
              <div className="px-4 py-4 border-t border-surface-border bg-surface-secondary/50">
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="text-text-secondary">Товары</span>
                  <span className="font-medium">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-text-secondary">Доставка</span>
                  <span className="text-success font-semibold">Уточняется</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-base">Итого</span>
                  <span className="font-extrabold text-xl text-text-primary">{fmt(subtotal)}</span>
                </div>

                <button
                  onClick={() => handleCheckout(cart.id)}
                  disabled={isProcessing}
                  className={clsx(
                    "btn-primary flex items-center justify-center gap-2",
                    isProcessing && "opacity-70"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Оформляем...
                    </>
                  ) : (
                    <>
                      Оформить заказ
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-text-muted text-center mt-2">
                  💳 Оплата по счёту или наличными при получении
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand total if multiple suppliers */}
      {carts.length > 1 && (
        <div className="card mt-4 flex items-center justify-between">
          <span className="font-bold text-text-primary">Итого по всем заказам</span>
          <span className="font-extrabold text-xl text-brand-500">{fmt(grandTotal)}</span>
        </div>
      )}
      </div>
      <BottomNav />
    </div>
  );
}

/* ── Reusable empty state ──────────────────────────────── */
function EmptyState({
  icon,
  title,
  sub,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center pb-nav animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-surface-secondary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-bold text-lg text-text-primary mb-1">{title}</p>
        <p className="text-sm text-text-muted">{sub}</p>
      </div>
      <Link href={cta.href} className="btn-primary w-auto px-8">
        {cta.label}
      </Link>
    </div>
  );
}
