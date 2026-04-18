import { Suspense } from "react";
import CatalogClient from "./CatalogClient";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

function CatalogFallback() {
  return (
    <div className="max-w-screen-lg mx-auto px-4 pt-4 pb-nav">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card p-0 overflow-hidden">
            <div
              className="h-40 w-full"
              style={{
                background:
                  "linear-gradient(90deg,#ebebeb 25%,#f5f5f5 50%,#ebebeb 75%)",
                backgroundSize: "400px 100%",
                animation: "shimmer 1.4s ease-in-out infinite",
              }}
            />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-4 w-full rounded" style={{ background: "#ebebeb" }} />
              <div className="h-5 w-24 rounded" style={{ background: "#ebebeb" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Suspense fallback={<CatalogFallback />}>
        <CatalogClient />
      </Suspense>
      <BottomNav />
    </div>
  );
}
