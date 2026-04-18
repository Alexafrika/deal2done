"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Truck, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";
import { clsx } from "clsx";

interface Product {
  id: string;
  name_ru: string;
  price: number;
  price_per_kg?: number;
  currency: string;
  unit: string;
  moq: number;
  moq_unit: string;
  in_stock: boolean;
  is_halal: boolean;
  is_organic: boolean;
  is_local_farmer: boolean;
  delivery_days?: number;
  images: Array<{ url: string; is_primary: boolean }>;
  supplier?: { company_name?: string; is_verified?: boolean };
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const fmt = (price: number, currency: string) =>
  new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

// Fallback placeholder when no image
function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-surface-border">
      <ShoppingCart size={28} className="text-surface-border" />
    </div>
  );
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated, kycCompleted, user } = useAuthStore();

  // Buyers must complete KYC; other roles (supplier, admin) always have access
  const canAccess =
    isAuthenticated && (user?.role !== "buyer" || kycCompleted);

  const accessHref = !isAuthenticated ? "/login" : "/kyc";

  const primaryImage =
    product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id, product.moq);
      toast.success("Добавлено в корзину", { icon: "🛒" });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Ошибка добавления");
    }
  };

  const isDeliveryFast = product.delivery_days && product.delivery_days <= 2;

  return (
    <div className="card flex flex-col gap-2 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150 active:scale-[0.99] p-0 overflow-hidden">
      <Link href={`/product/${product.id}`} className="flex flex-col gap-2 flex-1 p-3 pb-0">

        {/* ── Image ──────────────────────────────────────────── */}
        <div
          className={clsx(
            "relative bg-surface-secondary rounded-xl overflow-hidden",
            compact ? "h-28" : "h-40"
          )}
        >
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name_ru}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <ImagePlaceholder />
          )}

          {/* Out of stock overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-[11px] font-semibold bg-black/40 px-2 py-1 rounded-full">
                Нет в наличии
              </span>
            </div>
          )}

          {/* Delivery badge — top right */}
          {product.delivery_days && product.in_stock && (
            <div
              className={clsx(
                "absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                isDeliveryFast
                  ? "bg-green-500 text-white"
                  : "bg-white/90 text-text-secondary"
              )}
            >
              <Truck size={10} />
              {product.delivery_days}д
            </div>
          )}
        </div>

        {/* ── Tags ───────────────────────────────────────────── */}
        {(product.is_halal || product.is_organic || product.is_local_farmer) && (
          <div className="flex flex-wrap gap-1">
            {product.is_halal      && <span className="badge-halal">Халяль</span>}
            {product.is_organic    && <span className="badge-organic">Органик</span>}
            {product.is_local_farmer && <span className="badge-local">Фермер</span>}
          </div>
        )}

        {/* ── Name ───────────────────────────────────────────── */}
        <p className="text-[13px] font-semibold text-text-primary line-clamp-2 leading-snug">
          {product.name_ru}
        </p>

        {/* ── Price block ────────────────────────────────────── */}
        <div className="mt-auto pb-0">
          {canAccess ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-[17px] font-extrabold text-text-primary leading-none">
                  {fmt(product.price, product.currency)}
                </span>
                <span className="text-[11px] text-text-muted">/ {product.unit}</span>
              </div>

              {product.price_per_kg && (
                <p className="text-[11px] text-text-muted">
                  {fmt(product.price_per_kg, product.currency)} / кг
                </p>
              )}

              {/* MOQ chip */}
              {product.moq > 1 && (
                <span className="moq-chip mt-1">
                  Мин. {product.moq} {product.moq_unit}
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <span>🔒</span>
              <span>Цена после верификации</span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Add to cart CTA ────────────────────────────────── */}
      <div className="px-3 pb-3 pt-1">
        {canAccess ? (
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || isLoading}
            aria-label={`Добавить ${product.name_ru} в корзину`}
            className={clsx(
              "w-full flex items-center justify-center gap-2",
              "py-2.5 rounded-xl text-[13px] font-semibold",
              "transition-all duration-150 active:scale-[0.97]",
              product.in_stock
                ? "bg-brand-500 text-white hover:bg-brand-600"
                : "bg-surface-secondary text-text-muted cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            В корзину
          </button>
        ) : (
          <Link
            href={accessHref}
            className={clsx(
              "w-full flex items-center justify-center gap-2",
              "py-2.5 rounded-xl text-[13px] font-semibold",
              "bg-surface-secondary text-text-secondary hover:bg-surface-border",
              "transition-all duration-150 active:scale-[0.97]"
            )}
          >
            🔒 {!isAuthenticated ? "Войти для заказа" : "Пройти верификацию"}
          </Link>
        )}
      </div>
    </div>
  );
}
