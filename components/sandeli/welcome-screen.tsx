"use client"

import { useState } from "react"
import { ArrowRight, Check, Copy } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { getPresetAvatarEmoji } from "@/lib/preset-avatars"

export function WelcomeScreen() {
  const { user, setScreen } = useApp()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.userCode)
    } catch {
      // Fallback silencioso.
    } finally {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const avatarDisplay =
    user.avatarType === "custom" && user.avatar ? (
      <img
        src={user.avatar}
        alt="Tu avatar"
        className="h-28 w-28 rounded-full border-4 border-primary-foreground object-cover shadow-xl"
      />
    ) : (
      <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary-foreground bg-primary-foreground/20 text-5xl shadow-xl">
        {getPresetAvatarEmoji(user.avatar)}
      </div>
    )

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="relative flex flex-col items-center bg-primary px-6 pb-20 pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary-foreground/5" />
        </div>

        <div className="relative mb-5">{avatarDisplay}</div>

        <h1 className="mb-2 text-center text-2xl font-bold text-primary-foreground">
          {`¡Hola, ${user.name}!`}
        </h1>
        <p className="text-center text-sm text-primary-foreground/80">
          Bienvenido/a al programa de fidelización Sandeli
        </p>
      </div>

      <div className="-mt-8 flex flex-1 flex-col rounded-t-3xl bg-background px-6 pb-8 pt-8">
        <div className="mb-6 rounded-2xl bg-secondary p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tu código exclusivo
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold tracking-widest text-foreground">
              {user.userCode}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all active:scale-90"
              aria-label="Copiar código"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Este código te identifica como usuario exclusivo de Sandeli.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary/5 p-4">
            <p className="text-2xl font-bold text-primary">{user.points}</p>
            <p className="text-xs text-muted-foreground">Puntos acumulados</p>
          </div>
          <div className="rounded-2xl bg-accent/10 p-4">
            <p className="text-2xl font-bold text-accent">Activa</p>
            <p className="text-xs text-muted-foreground">Cuenta fidelizada</p>
          </div>
        </div>

        <p className="mb-8 text-center text-sm text-muted-foreground">
          Acumula puntos con cada compra y canjéalos por promociones saludables.
        </p>

        <div className="mt-auto">
          <button
            type="button"
            onClick={() => setScreen("main")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Explorar Sandeli
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
