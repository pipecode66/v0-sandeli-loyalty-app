"use client"

import { useApp } from "@/lib/app-context"
import { Copy, Check, TrendingUp, Gift, ChevronRight, LogOut } from "lucide-react"
import { useState } from "react"

const AVATAR_ICONS: Record<string, string> = {
  a1: "🥗",
  a2: "🍎",
  a3: "🥑",
  a4: "🌿",
  a5: "🍊",
  a6: "🥤",
}

export function HomeTab() {
  const { user, promotions, setMainTab, logout } = useApp()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.userCode)
    } catch {
      // Fallback
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Buenos dias"
    if (h < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      {/* Greeting card */}
      <div className="mb-5 rounded-2xl bg-primary p-5">
        <div className="flex items-center gap-4">
          {user.avatarType === "custom" && user.avatar ? (
            <img
              src={user.avatar}
              alt="Tu avatar"
              className="h-14 w-14 rounded-full border-2 border-primary-foreground/30 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/20 text-2xl">
              {AVATAR_ICONS[user.avatar || "a1"] || "🥗"}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-primary-foreground/70">
              {greeting() + ","}
            </p>
            <h2 className="text-xl font-bold text-primary-foreground">
              {user.name}
            </h2>
          </div>
        </div>

        {/* User code */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-4 py-2.5">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
              Codigo exclusivo
            </p>
            <p className="font-mono text-lg font-bold tracking-widest text-primary-foreground">
              {user.userCode}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20 text-primary-foreground transition-all active:scale-90"
            aria-label="Copiar codigo"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-secondary p-4">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{user.points}</p>
          <p className="text-xs text-muted-foreground">Puntos totales</p>
        </div>
        <div className="rounded-2xl bg-secondary p-4">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
            <Gift className="h-5 w-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {promotions.filter((p) => p.pointsCost <= user.points).length}
          </p>
          <p className="text-xs text-muted-foreground">Canjeables ahora</p>
        </div>
      </div>

      {/* Quick promo preview */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Promociones destacadas
          </h3>
          <button
            type="button"
            onClick={() => setMainTab("menu")}
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            Ver todo
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {promotions.slice(0, 3).map((promo) => (
            <div
              key={promo.id}
              className="min-w-[200px] rounded-2xl border border-border bg-card p-4"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl">
                {promo.image === "juice"
                  ? "🥤"
                  : promo.image === "bowl"
                    ? "🥗"
                    : promo.image === "dessert"
                      ? "🍨"
                      : "🍽️"}
              </div>
              <p className="mb-1 text-sm font-semibold text-foreground">
                {promo.title}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-primary">
                  {promo.pointsCost} pts
                </span>
                {promo.pointsCost <= user.points && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                    Disponible
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout button */}
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary active:scale-[0.98]"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesion
      </button>
    </div>
  )
}
