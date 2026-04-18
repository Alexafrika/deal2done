"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { ordersApi } from "@/lib/api";

const STATUS_FLOW = [
  { from: "pending",   to: "confirmed",  label: "Подтвердить заказ",  color: "btn-primary" },
  { from: "pending",   to: "cancelled",  label: "Отклонить",          color: "btn-secondary" },
  { from: "confirmed", to: "preparing",  label: "Начать сборку",      color: "btn-primary" },
  { from: "preparing", to: "shipped",    label: "Передать в доставку", color: "btn-primary" },
  { from: "shipped",   to: "delivered",  label: "Отметить доставлено", color: "btn-primary" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает", confirmed: "Подтверждён", preparing: "Готовится",
  shipped: "В пути", delivered: "Доставлен", cancelled: "Отменён",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-KZ", { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(n);

export default function SupplierOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [updating, setUpdating] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["supplier-order", id],
    queryFn: () => ordersApi.getOrder(id),
    select: (r) => r.data,
  });

  const transitions = STATUS_FLOW.filter((t) => t.from === order?.status);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await ordersApi.updateOrderStatus(id, { status: newStatus, comment });
      qc.invalidateQueries({ queryKey: ["supplier-order", id] });
      qc.invalidateQueries({ queryKey: ["supplier-orders"] });
      toast.success(`Статус изменён: ${STATUS_LABELS[newStatus]}`);
      setComment("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Ошибка обновления статуса");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) return <div className="flex justify-center pt-20">Загрузка...</div>;
  if (!order) return <div className="text-center pt-20 text-text-muted">Заказ не найден</div>;

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-4 pb-nav">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => history.back()} className="text-text-muted">←</button>
        <h1 className="text-xl font-bold flex-1">{order.order_number}</h1>
        <span className="badge bg-amber-100 text-amber-800">{STATUS_LABELS[order.status] ?? order.status}</span>
      </div>

      {/* Order items */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-3">Состав заказа</h2>
        <div className="flex flex-col divide-y divide-surface-border">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                <p className="text-xs text-text-muted">{item.quantity} {item.unit} × {fmt(item.unit_price)}</p>
              </div>
              <span className="text-sm font-semibold shrink-0">{fmt(item.total_price)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-surface-border mt-2 pt-3 flex justify-between">
          <span className="font-bold">Итого</span>
          <span className="font-bold text-brand-600">{fmt(order.total)}</span>
        </div>
      </div>

      {/* Order info */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-3">Детали заказа</h2>
        <div className="flex flex-col gap-2 text-sm">
          <Row label="Оплата" value={order.payment_method ?? "—"} />
          <Row label="Доставка" value={order.delivery_method ?? "—"} />
          <Row label="Статус оплаты" value={order.payment_status} />
          {order.notes && <Row label="Комментарий" value={order.notes} />}
          <Row
            label="Дата заказа"
            value={new Date(order.created_at).toLocaleDateString("ru-KZ", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          />
        </div>
      </div>

      {/* Status actions */}
      {transitions.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold mb-3">Обновить статус</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий (необязательно)"
            className="input mb-3 text-sm resize-none"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            {transitions.map((t) => (
              <button
                key={t.to}
                onClick={() => handleStatusUpdate(t.to)}
                disabled={updating}
                className={clsx(t.color, "disabled:opacity-50")}
              >
                {updating ? "Сохраняем..." : t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
