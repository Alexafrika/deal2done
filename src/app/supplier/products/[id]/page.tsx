"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Upload, X, ArrowLeft } from "lucide-react";
import { productsApi } from "@/lib/api";
import Image from "next/image";

const schema = z.object({
  name_ru:         z.string().min(2, "Введите название"),
  description_ru:  z.string().optional(),
  price:           z.coerce.number().positive("Цена должна быть > 0"),
  price_per_kg:    z.coerce.number().optional(),
  unit:            z.string().min(1, "Укажите единицу"),
  moq:             z.coerce.number().positive("МЗ должен быть > 0"),
  moq_unit:        z.string().min(1),
  in_stock:        z.boolean(),
  delivery_days:   z.coerce.number().int().optional(),
  is_halal:        z.boolean(),
  is_organic:      z.boolean(),
  is_local_farmer: z.boolean(),
  sku:             z.string().optional(),
  weight_kg:       z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

const UNIT_OPTIONS = ["шт", "кг", "л", "упак.", "ящик", "кор.", "пак."];

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string | undefined;
  const isEdit = !!productId && productId !== "new";
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; file?: File }[]>([]);

  const { data: existing } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsApi.get(productId!),
    enabled: isEdit,
    select: (r) => r.data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: "шт", moq: 1, moq_unit: "шт",
      in_stock: true, is_halal: false, is_organic: false, is_local_farmer: false,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name_ru:         existing.name_ru,
        description_ru:  existing.description_ru ?? "",
        price:           Number(existing.price),
        price_per_kg:    existing.price_per_kg ? Number(existing.price_per_kg) : undefined,
        unit:            existing.unit,
        moq:             Number(existing.moq),
        moq_unit:        existing.moq_unit,
        in_stock:        existing.in_stock,
        delivery_days:   existing.delivery_days ?? undefined,
        is_halal:        existing.is_halal,
        is_organic:      existing.is_organic,
        is_local_farmer: existing.is_local_farmer,
        sku:             existing.sku ?? "",
        weight_kg:       existing.weight_kg ?? undefined,
      });
      setUploadedImages(existing.images?.map((i: any) => ({ url: i.url })) ?? []);
    }
  }, [existing, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? productsApi.update(productId!, data) : productsApi.create(data),
    onSuccess: async (res) => {
      const id = res.data.id;
      // Upload pending local files
      for (const img of uploadedImages) {
        if (img.file) {
          await productsApi.uploadImage(id, img.file, !isEdit && uploadedImages.indexOf(img) === 0);
        }
      }
      toast.success(isEdit ? "Товар обновлён" : "Товар создан — ожидает модерации");
      router.push("/supplier/products");
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? "Ошибка сохранения"),
  });

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setUploadedImages((prev) => [
      ...prev,
      ...files.map((f) => ({ url: URL.createObjectURL(f), file: f })),
    ]);
  };

  const removeImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-4 pb-nav">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-text-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">{isEdit ? "Редактировать товар" : "Новый товар"}</h1>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="flex flex-col gap-4">

        {/* Images */}
        <div className="card">
          <label className="label mb-2">Фотографии товара</label>
          <div className="flex gap-2 flex-wrap">
            {uploadedImages.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-secondary">
                <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                >
                  <X size={12} className="text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-brand-500/80 text-white text-[9px] text-center py-0.5">
                    Главное
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-surface-border rounded-lg flex flex-col items-center justify-center gap-1 text-text-muted hover:border-brand-300 transition-colors"
            >
              <Upload size={18} />
              <span className="text-[10px]">Добавить</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImagePick}
          />
        </div>

        {/* Basic info */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-text-secondary">Основная информация</h2>

          <div>
            <label className="label">Название товара *</label>
            <input {...register("name_ru")} className="input" placeholder="Например: Говядина охлаждённая" />
            {errors.name_ru && <p className="text-xs text-error mt-1">{errors.name_ru.message}</p>}
          </div>

          <div>
            <label className="label">Описание</label>
            <textarea {...register("description_ru")} rows={3} className="input resize-none" placeholder="Состав, характеристики, условия хранения..." />
          </div>

          <div>
            <label className="label">Артикул (SKU)</label>
            <input {...register("sku")} className="input" placeholder="ABC-001" />
          </div>
        </div>

        {/* Pricing */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-text-secondary">Цена</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Цена (₸) *</label>
              <input {...register("price")} type="number" step="0.01" className="input" placeholder="0" />
              {errors.price && <p className="text-xs text-error mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Единица *</label>
              <select {...register("unit")} className="input">
                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Цена за кг (₸)</label>
              <input {...register("price_per_kg")} type="number" step="0.01" className="input" placeholder="Необязательно" />
            </div>
            <div>
              <label className="label">Вес, кг</label>
              <input {...register("weight_kg")} type="number" step="0.01" className="input" placeholder="0" />
            </div>
          </div>
        </div>

        {/* MOQ & availability */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-text-secondary">Заказ и наличие</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Мин. заказ (МЗ) *</label>
              <input {...register("moq")} type="number" step="0.001" className="input" placeholder="1" />
              {errors.moq && <p className="text-xs text-error mt-1">{errors.moq.message}</p>}
            </div>
            <div>
              <label className="label">Ед. МЗ</label>
              <select {...register("moq_unit")} className="input">
                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Срок поставки (дней)</label>
            <input {...register("delivery_days")} type="number" className="input" placeholder="Например: 2" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input {...register("in_stock")} type="checkbox" className="w-5 h-5 rounded accent-brand-500" />
            <span className="text-sm font-medium">Есть в наличии</span>
          </label>
        </div>

        {/* Certifications */}
        <div className="card">
          <h2 className="font-semibold text-sm text-text-secondary mb-3">Теги и сертификаты</h2>
          <div className="flex flex-col gap-3">
            {[
              { name: "is_halal",        label: "🟢 Халяль", desc: "Есть сертификат халяль" },
              { name: "is_organic",      label: "🌿 Органик", desc: "Органическая продукция" },
              { name: "is_local_farmer", label: "🌾 Местный фермер", desc: "Продукция местных фермеров" },
            ].map(({ name, label, desc }) => (
              <label key={name} className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register(name as keyof FormData)}
                  type="checkbox"
                  className="w-5 h-5 rounded accent-brand-500"
                />
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-text-muted">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
          {saveMutation.isPending ? "Сохраняем..." : isEdit ? "Сохранить изменения" : "Создать товар"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={async () => {
              await productsApi.delete(productId!);
              toast.success("Товар удалён");
              router.push("/supplier/products");
            }}
            className="btn-secondary text-error border-red-200"
          >
            Удалить товар
          </button>
        )}
      </form>
    </div>
  );
}
