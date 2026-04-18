"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";
import { ClipboardList } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "bar",           label: "Бар" },
  { value: "restaurant",    label: "Ресторан" },
  { value: "hotel",         label: "Отель" },
  { value: "cafe",          label: "Кафе" },
  { value: "shop",          label: "Магазин" },
  { value: "private_order", label: "Частный заказ" },
] as const;

const schema = z.object({
  business_type:  z.string().min(1, "Выберите тип бизнеса"),
  business_name:  z.string().min(2, "Введите название"),
  city:           z.string().min(2, "Введите город"),
  address:        z.string().min(5, "Введите адрес"),
  phone:          z.string().min(7, "Введите номер телефона / WhatsApp"),
  email:          z.string().email("Введите корректный email"),
  contact_name:   z.string().min(2, "Введите имя контактного лица"),
  position:       z.string().min(2, "Введите должность"),
});

type FormData = z.infer<typeof schema>;

export default function KycPage() {
  const router = useRouter();
  const { setKycCompleted, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Non-authenticated users shouldn't reach this page, but guard anyway
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const onSubmit = (_data: FormData) => {
    // KYC data is local-only for now; mark completed and go to catalog
    setKycCompleted(true);
    toast.success("Верификация пройдена! 🎉");
    router.push("/catalog");
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-1">
          <ClipboardList size={28} className="text-brand-500" />
        </div>
        <h1 className="text-xl font-extrabold text-text-primary">Верификация клиента</h1>
        <p className="text-sm text-text-secondary">
          Расскажите о вашем бизнесе, чтобы получить доступ к ценам и заказам
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Business type */}
        <div>
          <label className="label">Тип бизнеса</label>
          <select {...register("business_type")} className="input">
            <option value="">— Выберите —</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.business_type && (
            <p className="text-xs text-error mt-1">{errors.business_type.message}</p>
          )}
        </div>

        {/* Business name */}
        <div>
          <label className="label">Название заведения / компании</label>
          <input
            {...register("business_name")}
            type="text"
            placeholder="ТОО «Вкусно»"
            className="input"
          />
          {errors.business_name && (
            <p className="text-xs text-error mt-1">{errors.business_name.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="label">Город</label>
          <input
            {...register("city")}
            type="text"
            placeholder="Алматы"
            className="input"
          />
          {errors.city && (
            <p className="text-xs text-error mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="label">Адрес</label>
          <input
            {...register("address")}
            type="text"
            placeholder="ул. Абая 10, офис 3"
            className="input"
          />
          {errors.address && (
            <p className="text-xs text-error mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Phone / WhatsApp */}
        <div>
          <label className="label">Телефон / WhatsApp</label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+7 777 000 00 00"
            className="input"
          />
          {errors.phone && (
            <p className="text-xs text-error mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="label">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="orders@company.kz"
            className="input"
          />
          {errors.email && (
            <p className="text-xs text-error mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Contact name */}
        <div>
          <label className="label">Контактное лицо</label>
          <input
            {...register("contact_name")}
            type="text"
            placeholder="Иван Иванов"
            className="input"
          />
          {errors.contact_name && (
            <p className="text-xs text-error mt-1">{errors.contact_name.message}</p>
          )}
        </div>

        {/* Position */}
        <div>
          <label className="label">Должность</label>
          <input
            {...register("position")}
            type="text"
            placeholder="Менеджер по закупкам"
            className="input"
          />
          {errors.position && (
            <p className="text-xs text-error mt-1">{errors.position.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Отправляем..." : "Подтвердить и перейти в каталог"}
        </button>
      </form>
    </div>
  );
}
