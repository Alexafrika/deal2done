"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Package, ShoppingBag, PlusCircle, Clock,
  TrendingUp, CheckCircle, XCircle, ChevronRight, Bell,
} from "lucide-react";
import toast from "react-hot-toast";
import { ordersApi, productsApi } from "@/lib/api";
import { clsx } from "clsx";

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Новый",      cls: "status-pending" },
  confirmed: { label: "Принят",     cls: "status-confirmed" },
  preparing: { label: "Готовится",  cls: "status-preparing" },
  shipped:   { label: "Отправлен",  cls: "status-shipped" },
  delivered: { label: "Доставлен",  cls: "status-delivered" },
  cancelled: { label: "Отменён",    cls: "status-cancelled" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(n);

export default function SupplierDashboard() {
  const qc = useQueryClient();

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["supplier-orders"],
    queryFn: () => ordersApi.supplierOrders({ page_size: 20 }),
    select: (r) => r.data,
  });

  const { data: productsData } = useQuery({
    queryKey: ["my-products"],
    queryFn: () => productsApi.myProducts({ page_size: 100 }),
    select: (r) => r.data,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateOrderStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-orders"] });
      toast.success("Статус обновлён");
    },
    onError: () => toast.error("Ошибка обновления статуса"),
  });

  const orders = ordersData?.items ?? [];
  const products = productsData?.items ?? [];
  const pendingOrders = orders.filter((o: any) => o.status === "pending");
  const activeOrders = orders.filter(
    (o: any) => !["delivered", "cancelled"].includes(o.status)
  );
  const totalRevenue = orders
    .filter((o: any) => o.status === "delivered")
    .reduce((s: number, o: any) => s + Number(o.total), 0);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-screen-md mx-auto px-4 pt-4 pb-nav">

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Панель поставщика</h1>
            <p className="text-xs text-text-muted mt-0.5">Управление заказами и товарами</p>
          </div>
          <Link
            href="/supplier/products/new"
            className="flex items-center gap-1.5 bg-brand-500 text-white
              text-sm font-semibold px-3 py-2 rounded-xl hover:bg-brand-600
              transition-colors active:scale-95"
          >
            <PlusCircle size={16} />
            Добавить
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            {
              label: "Новых",
              value: pendingOrders.length,
              icon: Clock,
              iconColor: "text-amber-500",
              bgColor: "bg-amber-50",
              borderColor: "border-l-amber-400",
              emphasis: pendingOrders.length > 0,
            },
            {
              label: "Активных",
              value: activeOrders.length,
              icon: ShoppingBag,
              iconColor: "text-blue-500",
              bgColor: "bg-blue-50",
              borderColor: "border-l-blue-400",
              emphasis: false,
            },
            {
              label: "Товаров",
              value: products.length,
              icon: Package,
              iconColor: "text-purple-500",
              bgColor: "bg-purple-50",
              borderColor: "border-l-purple-400",
              emphasis: false,
            },
          ].map(({ label, value, icon: Icon, iconColor, bgColor, borderColor, emphasis }) => (
            <div
              key={label}
              className={clsx(
                "card border-l-4 py-3 px-3",
                borderColor,
                emphasis && "ring-1 ring-amber-200"
              )}
            >
              <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center mb-2", bgColor)}>
                <Icon size={17} className={iconColor} />
              </div>
              <div className="text-2xl font-extrabold leading-none text-text-primary">{value}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Revenue card */}
        {totalRevenue > 0 && (
          <div
            className="rounded-2xl p-4 mb-5 flex items-center gap-4"
            style={{ background: "linear-gradient(135deg, #fff0f0 0%, #ffe4e4 100%)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shrink-0">
              <TrendingUp size={22} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-text-muted font-medium mb-0.5">Общая выручка</div>
              <div className="text-2xl font-extrabold text-brand-600 leading-none">
                {fmt(totalRevenue)}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">По доставленным заказам</div>
            </div>
          </div>
        )}

        {/* Pending orders */}
        {pendingOrders.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={15} className="text-amber-500" />
              <h2 className="section-title">Требуют подтверждения</h2>
              <span className="ml-auto bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {pendingOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="card border-l-4 border-l-amber-400 bg-amber-50/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-[15px] text-text-primary">
                        {order.order_number}
                      </span>
                      <p className="text-xs text-text-muted mt-0.5">
                        {order.items?.length ?? 0} позиций · {fmt(order.total)}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("ru-KZ", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: "confirmed" })}
                      disabled={updateStatus.isPending}
                      className="flex items-center justify-center gap-1.5 bg-green-500 text-white
                        text-sm font-semibold py-2.5 rounded-xl active:scale-[0.97]
                        transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={15} />
                      Принять
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: "cancelled" })}
                      disabled={updateStatus.isPending}
                      className="flex items-center justify-center gap-1.5 bg-white border
                        border-surface-border text-text-secondary text-sm font-semibold
                        py-2.5 rounded-xl active:scale-[0.97] transition-all disabled:opacity-50
                        hover:border-red-300 hover:text-red-500"
                    >
                      <XCircle size={15} />
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Последние заказы</h2>
            <Link href="/supplier/orders" className="text-sm text-brand-500 font-medium">
              Все
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-2xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="card text-center py-8 text-text-muted text-sm">
              Заказов пока нет
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {orders.slice(0, 8).map((order: any) => {
                const st = STATUS_CONFIG[order.status];
                return (
                  <Link key={order.id} href={`/supplier/orders/${order.id}`}>
                    <div className="card flex items-center gap-3 hover:shadow-card-hover transition-all p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold">{order.order_number}</span>
                          {st && (
                            <span className={st.cls}>{st.label}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">{fmt(order.total)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-text-muted">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("ru-KZ", {
                                day: "numeric",
                                month: "short",
                              })
                            : ""}
                        </span>
                        <ChevronRight size={15} className="text-text-muted" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Products shortcut */}
        <Link href="/supplier/products">
          <div className="card flex items-center gap-3 hover:shadow-card-hover transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Package size={20} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-text-primary">Мои товары</div>
              <div className="text-[11px] text-text-muted">
                {products.length} товаров опубликовано
              </div>
            </div>
            <ChevronRight size={18} className="text-text-muted" />
          </div>
        </Link>

      </div>
      <BottomNav />
    </div>
  );
}
