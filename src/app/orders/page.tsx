"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { RefreshCw, ChevronRight, ClipboardList, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { ordersApi } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string; step: number }> = {
  pending:   { label: "Ожидает",     cls: "status-pending",   dot: "bg-amber-400",   step: 0 },
  confirmed: { label: "Подтверждён", cls: "status-confirmed", dot: "bg-blue-400",    step: 1 },
  preparing: { label: "Готовится",   cls: "status-preparing", dot: "bg-purple-400",  step: 2 },
  shipped:   { label: "В пути",      cls: "status-shipped",   dot: "bg-indigo-400",  step: 3 },
  delivered: { label: "Доставлен",   cls: "status-delivered", dot: "bg-green-400",   step: 4 },
  cancelled: { label: "Отменён",     cls: "status-cancelled", dot: "bg-red-400",     step: -1 },
};

const TIMELINE_STEPS = ["Ожидает", "Принят", "Готовится", "В пути", "Доставлен"];

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(n);

function MiniTimeline({ currentStep }: { currentStep: number }) {
  if (currentStep < 0) return null;
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {TIMELINE_STEPS.map((_, i) => (
        <div
          key={i}
          className={clsx(
            "h-1 flex-1 rounded-full transition-all duration-300",
            i <= currentStep ? "bg-brand-500" : "bg-surface-border"
          )}
        />
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="card">
      <div className="flex justify-between mb-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-3 w-48 rounded mb-3" />
      <div className="flex justify-between">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { fetchCarts } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersApi.myOrders({ page_size: 50 }),
    select: (r) => r.data,
  });

  const handleReorder = async (orderId: string) => {
    try {
      await ordersApi.reorder(orderId);
      await fetchCarts();
      toast.success("Товары добавлены в корзину");
      router.push("/cart");
    } catch {
      toast.error("Не удалось повторить заказ");
    }
  };

  const orders = data?.items ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-screen-sm mx-auto px-4 pt-4 pb-nav">
        <h1 className="text-xl font-extrabold tracking-tight mb-5">Мои заказы</h1>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mb-4">
              <ClipboardList size={36} className="text-surface-border" />
            </div>
            <p className="font-bold text-base text-text-primary mb-1">Заказов ещё нет</p>
            <p className="text-sm text-text-muted mb-5">Начните покупать в каталоге</p>
            <Link href="/catalog" className="btn-primary w-auto px-8 flex items-center gap-2">
              Перейти в каталог <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in">
            {orders.map((order: any) => {
              const status = STATUS_CONFIG[order.status] ?? {
                label: order.status,
                cls: "status-pill bg-gray-100 text-gray-700",
                dot: "bg-gray-300",
                step: -1,
              };

              const itemNames = order.items
                ?.slice(0, 2)
                .map((i: any) => i.product_name)
                .join(", ");
              const extra = order.items?.length > 2 ? ` +${order.items.length - 2}` : "";
              const dateStr = order.created_at
                ? new Date(order.created_at).toLocaleDateString("ru-KZ", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "";

              return (
                <div key={order.id} className="card hover:shadow-card-hover transition-all duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-text-primary">
                        {order.order_number}
                      </span>
                      <span className={status.cls}>{status.label}</span>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center text-text-muted hover:text-brand-500 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>

                  <p className="text-[13px] text-text-secondary mt-1.5 line-clamp-1">
                    {itemNames}{extra}
                  </p>

                  {order.status !== "cancelled" && (
                    <MiniTimeline currentStep={status.step} />
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="font-extrabold text-[17px] text-text-primary">
                        {fmt(order.total)}
                      </span>
                      <p className="text-[11px] text-text-muted">{dateStr}</p>
                    </div>

                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => handleReorder(order.id)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-brand-500
                          bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors
                          active:scale-95"
                      >
                        <RefreshCw size={13} />
                        Повторить
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
