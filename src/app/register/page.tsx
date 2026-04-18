"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ChefHat, Truck, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { clsx } from "clsx";

const schema = z.object({
  full_name: z.string().min(2, "Введите имя (минимум 2 символа)"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Пароль минимум 8 символов"),
  role: z.enum(["buyer", "supplier"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "buyer" },
  });

  const role = watch("role");

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      toast.success("Аккаунт создан!");
      router.push(data.role === "supplier" ? "/supplier/dashboard" : "/");
    } catch (err: any) {
      toast.error(err?.message ?? "Ошибка регистрации");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-8 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-500">Deal2Done</h1>
        <p className="text-text-secondary text-sm mt-1">Создать аккаунт</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-5">Регистрация</h2>

        {/* Role selector */}
        <div className="mb-5">
          <label className="label">Я регистрируюсь как</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "buyer", icon: ChefHat, label: "Покупатель", sub: "Ресторан, кафе, отель" },
              { value: "supplier", icon: Truck, label: "Поставщик", sub: "Производитель, дистрибьютор" },
            ].map(({ value, icon: Icon, label, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue("role", value as "buyer" | "supplier")}
                className={clsx(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors",
                  role === value
                    ? "border-brand-500 bg-brand-50"
                    : "border-surface-border bg-white"
                )}
              >
                <Icon size={24} className={role === value ? "text-brand-500" : "text-text-muted"} />
                <span className={clsx("text-sm font-medium", role === value ? "text-brand-600" : "text-text-primary")}>
                  {label}
                </span>
                <span className="text-[11px] text-text-muted text-center leading-tight">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label">Имя и фамилия</label>
            <input {...register("full_name")} placeholder="Асель Нурмагамбетова" className="input" />
            {errors.full_name && <p className="text-xs text-error mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input {...register("email")} type="email" placeholder="email@company.kz" className="input" />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Телефон <span className="text-text-muted font-normal">(необязательно)</span></label>
            <input {...register("phone")} type="tel" placeholder="+7 700 000 0000" className="input" />
          </div>

          <div>
            <label className="label">Пароль</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPass ? "text" : "password"}
                placeholder="Минимум 8 символов"
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary mt-1" disabled={isLoading}>
            {isLoading ? "Создаём аккаунт..." : "Зарегистрироваться"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-5">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-brand-500 font-medium">
          Войти
        </Link>
      </p>
    </div>
  );
}
