"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";
import { productsApi } from "@/lib/api";

const schema = z.object({
  name_ru:        z.string().min(2, "Введите название"),
  description_ru: z.string().optional(),
  price:          z.coerce.number().positive("Цена должна быть больше 0"),
  price_per_kg:   z.coerce.number().positive().optional().or(z.literal("")),
  unit:           z.string().min(1),
  moq:            z.coerce.number().positive().default(1),
  moq_unit:       z.string().default("шт"),
  in_stock:       z.boolean().default(true),
  is_halal:       z.boolean().default(false),
  is_organic:     z.boolean().default(false),
  is_local_farmer:z.boolean().default(false),
  delivery_days:  z.coerce.number().int().positive().optional().or(z.literal("")),
  sku:            z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const UNITS = ["шт", "кг", "л", "упак.", "коробка", "порция", "пачка"];

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { unit: "кг", moq: 1, moq_unit: "кг", in_stock: true },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const { data: product } = await productsApi.create({
        ...data,
        price_per_kg: data.price_per_kg || undefined,
        delivery_days: data.delivery_days || undefined,
      });

      // Upload images sequentially
      for (let i = 0; i < imageFiles.length; i++) {
        await productsApi.uploadImage(product.id, imageFiles[i], i === 0);
      }

      toast.success("Товар добавлен!");
      router.push("/supplier/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles((prev) => [...prev, ...files].slice(0, 5));
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 5));
  };

  const removeImage = (idx: number) => {
    setImageFiles((f) => f.filter((_, i) => i !== idx));
    setImagePreviews((p) => p.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-4 pb-nav">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="text-text-muted text-xl">←</button>
        <h1 className="text-xl font-bold">Новый товар</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Images */}
        <div className="card">
          <label className="label">Фото товара</label>
          <div className="flex gap-2 flex-wrap">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-secondary">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                >
                  <X size={12} className="text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 inset-x-0 text-[9px] text-center bg-brand-500/80 text-white py-0.5">
                    Главное
                  </span>
                )}
              </div>
            ))}
            {imageFiles.length < 5 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-surface-border
                flex flex-col items-center justify-center text-text-muted cursor-pointer hover:border-brand-300 transition-colors">
                <Upload size={20} />
                <span className="text-[10px] mt-1">Добавить</span>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-text-muted mt-2">Первое фото — главное. Максимум 5 фото.</p>
        </div>

        {/* Basic info */}
        <div className="card flex flex-col gap-4">
          <div>
            <label className="label">Название товара *</label>
            <input {...register("name_ru")} className="input" placeholder="Говядина охлаждённая" />
            {errors.name_ru && <p className="text-xs text-error mt-1">{errors.name_ru.message}</p>}
          </div>

          <div>
            <label className="label">Описание</label>
            <textarea {...register("description_ru")} className="input resize-none" rows={3}
              placeholder="Фермерская говядина без ГМО, охлаждённая..." />
          </div>

          <div>
            <label className="label">Артикул (SKU)</label>
            <input {...register("sku")} className="input" placeholder="MEAT-001" />
          </div>
        </div>

        {/* Pricing */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold">Цена</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Цена * (KZT)</label>
              <input {...register("price")} type="number" step="0.01" className="input" placeholder="1500" />
              {errors.price && <p className="text-xs text-error mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Ед. измерения</label>
              <select {...register("unit")} className="input">
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Цена за кг (KZT)</label>
              <input {...register("price_per_kg")} type="number" step="0.01" className="input" placeholder="1500" />
            </div>
            <div>
              <label className="label">Мин. заказ (MOQ)</label>
              <input {...register("moq")} type="number" step="0.001" className="input" placeholder="1" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="font-semibold mb-3">Теги и сертификаты</h2>
          <div className="flex flex-col gap-3">
            {[
              { name: "is_halal",        label: "🟢 Халяль",       desc: "Продукт сертифицирован как халяль" },
              { name: "is_organic",      label: "🌿 Органик",      desc: "Органическое производство" },
              { name: "is_local_farmer", label: "🌾 Местный фермер", desc: "Произведено местными фермерами" },
              { name: "in_stock",        label: "✅ В наличии",    desc: "Товар сейчас есть на складе" },
            ].map(({ name, label, desc }) => (
              <label key={name} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register(name as keyof FormData)}
                  className="w-5 h-5 rounded accent-brand-500"
                />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-text-muted">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div className="card">
          <h2 className="font-semibold mb-3">Доставка</h2>
          <div>
            <label className="label">Срок доставки (дней)</label>
            <input {...register("delivery_days")} type="number" className="input" placeholder="1" />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Сохраняем..." : "Добавить товар"}
        </button>
      </form>
    </div>
  );
}
