"use client"

import { useApp } from "@/lib/app-context"
import { Star, Filter } from "lucide-react"
import { useState } from "react"

const PROMO_ICONS: Record<string, string> = {
  juice: "🥤",
  bowl: "🥗",
  dessert: "🍨",
  combo: "🍽️",
  wrap: "🌯",
  smoothie: "🧃",
}

export function MenuTab() {
  const { promotions, user } = useApp()
  const [activeCategory, setActiveCategory] = useState("Todas")

  const categories = [
    "Todas",
    ...Array.from(new Set(promotions.map((p) => p.category))),
  ]

  const filtered =
    activeCategory === "Todas"
      ? promotions
      : promotions.filter((p) => p.category === activeCategory)

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Promociones
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Canjea tus puntos por estas increibles promociones
      </p>

      {/* Category filter */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Points bar */}
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3">
        <Star className="h-5 w-5 text-primary" fill="currentColor" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Tus puntos: <span className="text-primary">{user?.points ?? 0}</span>
          </p>
        </div>
      </div>

      {/* Promotions grid */}
      <div className="flex flex-col gap-3">
        {filtered.map((promo) => {
          const canRedeem = (user?.points ?? 0) >= promo.pointsCost
          return (
            <div
              key={promo.id}
              className={`rounded-2xl border p-4 transition-all ${
                canRedeem
                  ? "border-primary/20 bg-card"
                  : "border-border bg-card opacity-75"
              }`}
            >
              <div className="flex gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                  {PROMO_ICONS[promo.image] || "🍽️"}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="text-base font-semibold text-foreground">
                      {promo.title}
                    </h3>
                    <span
                      className={`ml-2 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        canRedeem
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {promo.pointsCost} pts
                    </span>
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground leading-relaxed">
                    {promo.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${
                        canRedeem
                          ? "bg-green-100 text-green-700"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {canRedeem
                        ? "Disponible para canjear"
                        : `Faltan ${promo.pointsCost - (user?.points ?? 0)} pts`}
                    </span>
                    <span className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      {promo.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
