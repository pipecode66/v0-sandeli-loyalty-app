"use client"

import { useApp } from "@/lib/app-context"
import { Receipt, Star, Calendar, Heart } from "lucide-react"

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

function getFavoriteDish(purchases: { items: string[] }[]): string {
  const counts: Record<string, number> = {}
  for (const p of purchases) {
    for (const item of p.items) {
      counts[item] = (counts[item] || 0) + 1
    }
  }
  let maxCount = 0
  let favorite = ""
  for (const [item, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      favorite = item
    }
  }
  return favorite || "---"
}

export function HistoryTab() {
  const { purchases } = useApp()

  const totalPoints = purchases.reduce((sum, p) => sum + p.pointsEarned, 0)
  const favoriteDish = getFavoriteDish(purchases)

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-4">
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Historial de compras
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Revisa tus compras recientes y puntos ganados
      </p>

      {/* Summary */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-secondary p-3 text-center">
          <p className="text-lg font-bold text-foreground">{purchases.length}</p>
          <p className="text-[10px] text-muted-foreground">Compras</p>
        </div>
        <div className="rounded-xl bg-primary/5 p-3 text-center">
          <p className="text-lg font-bold text-primary">{totalPoints}</p>
          <p className="text-[10px] text-muted-foreground">Pts ganados</p>
        </div>
        <div className="rounded-xl bg-secondary p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Heart className="h-3.5 w-3.5 text-sandeli-magenta" fill="currentColor" />
          </div>
          <p className="mt-0.5 text-xs font-bold text-foreground leading-tight">
            {favoriteDish}
          </p>
          <p className="text-[10px] text-muted-foreground">Plato favorito</p>
        </div>
      </div>

      {/* Purchase list */}
      <div className="flex flex-col gap-3">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(purchase.total)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(purchase.date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
                <Star className="h-3 w-3 text-primary" fill="currentColor" />
                <span className="text-xs font-bold text-primary">
                  +{purchase.pointsEarned}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {purchase.items.map((item, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-secondary px-2.5 py-1 text-xs text-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {purchases.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Sin compras aun
          </p>
          <p className="text-sm text-muted-foreground">
            Tus compras apareceran aqui
          </p>
        </div>
      )}
    </div>
  )
}
