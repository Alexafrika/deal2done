"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Добро пожаловать!");
      // Guide unverified buyers to KYC before they can shop
      const { user, kycCompleted } = useAuthStore.getState();
      if (user?.role === "buyer" && !kycCompleted) {
        router.push("/kyc");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Неверный email или пароль");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-8 max-w-sm mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-500">Deal2Done</h1>
        <p className="text-text-secondary text-sm mt-1">Маркетплейс для HoReCa</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-5">Вход в аккаунт</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label">Email</label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="email@company.kz"
              className="input"
            />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Пароль</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
            {isLoading ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-5">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-brand-500 font-medium">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
