"use client"

import { useState } from "react"
import Image from "next/image"
import { useApp } from "@/lib/app-context"
import { fetchPublicJson, setAccessToken } from "@/lib/public-api-client"
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Lock,
  Mail,
  Phone,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

type LoginResponse = {
  error?: string
  success?: boolean
  requiresPasswordSetup?: boolean
  clientId?: string
  clientName?: string
  accessToken?: string
}

const heroHighlights = [
  {
    icon: Sparkles,
    title: "Puntos vivos",
    subtitle: "Actualización en tiempo real",
  },
  {
    icon: Receipt,
    title: "Tus compras",
    subtitle: "Historial siempre a la mano",
  },
  {
    icon: Gift,
    title: "Canjes fáciles",
    subtitle: "Promociones listas para ti",
  },
]

export function LoginScreen() {
  const { setScreen, setPendingLogin, refreshData } = useApp()
  const [mode, setMode] = useState<"email" | "phone">("phone")
  const [value, setValue] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPhone = (phone: string) => /^\d{10}$/.test(phone)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    const trimmed = value.trim()
    if (!trimmed) {
      setError("Ingresa un correo o teléfono.")
      return
    }

    let identifier = trimmed
    let displayValue = trimmed

    if (mode === "email") {
      const normalizedEmail = trimmed.toLowerCase()
      if (!isValidEmail(normalizedEmail)) {
        setError("Ingresa un correo electrónico válido.")
        return
      }
      identifier = normalizedEmail
      displayValue = normalizedEmail
    } else {
      const normalizedPhone = trimmed.replace(/[^\d]/g, "")
      if (!isValidPhone(normalizedPhone)) {
        setError("Ingresa un número telefónico de 10 dígitos.")
        return
      }
      identifier = normalizedPhone
      displayValue = normalizedPhone
    }

    setLoading(true)
    try {
      const response = await fetchPublicJson<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      })

      if (!response.ok || !response.data) {
        setError(response.data?.error || "No se pudo iniciar sesión.")
        return
      }

      if (response.data.requiresPasswordSetup) {
        setPendingLogin({
          mode,
          identifier,
          displayValue,
          clientId: response.data.clientId || "",
        })
        setScreen("verification")
        return
      }

      if (!response.data.accessToken) {
        setError("No se recibió un token de acceso.")
        return
      }

      setAccessToken(response.data.accessToken)
      setPendingLogin(null)
      await refreshData()
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-screen relative overflow-hidden bg-[linear-gradient(180deg,#fcf8ff_0%,#f6effa_42%,#ffffff_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-brand-drift absolute -left-14 top-20 h-40 w-40 rounded-full bg-primary/18 blur-3xl" />
        <div className="animate-brand-drift-reverse absolute -right-10 top-12 h-52 w-52 rounded-full bg-sandeli-magenta/12 blur-3xl" />
        <div className="animate-brand-float absolute left-10 top-[28rem] h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,#ffffff_0%,rgba(255,255,255,0.55)_34%,transparent_74%)]" />
      </div>

      <div className="safe-top relative flex min-h-full flex-1 flex-col px-5 pt-4">
        <div className="animate-in fade-in-0 slide-in-from-top-6 duration-700">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-[0_30px_80px_-40px_rgba(159,31,238,0.55)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(159,31,238,0.12),rgba(164,28,130,0.06)_42%,transparent_100%)]" />
            <div className="animate-brand-drift absolute -right-8 top-4 h-24 w-24 rounded-full bg-primary/16 blur-2xl" />
            <div className="animate-brand-drift-reverse absolute -left-8 bottom-4 h-20 w-20 rounded-full bg-sandeli-magenta/14 blur-2xl" />

            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="Sandeli - Sano y Delicioso"
                width={260}
                height={100}
                className="mb-5 h-auto w-auto"
                style={{ width: "auto", height: "auto" }}
                priority
              />

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acceso cliente Sandeli
              </div>

              <h1 className="max-w-[13ch] font-serif text-[2.35rem] leading-[0.95] text-foreground sm:text-[2.7rem]">
                Tus puntos se ven mejor desde aquí.
              </h1>

              <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-muted-foreground">
                Consulta tu saldo, revisa tus compras y descubre canjes en una experiencia
                más cómoda, visual y rápida.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {heroHighlights.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/70 bg-background/76 px-3 py-3 shadow-[0_14px_28px_-24px_rgba(26,27,29,0.45)] backdrop-blur-sm"
                    >
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-semibold leading-tight text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 animate-in fade-in-0 slide-in-from-bottom-6 duration-700 delay-150">
          <div className="screen-safe-bottom rounded-[2rem] border border-white/80 bg-background/92 px-5 pt-6 shadow-[0_22px_70px_-38px_rgba(26,27,29,0.5)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Iniciar sesión</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Usa tu correo o tu teléfono de 10 dígitos con tu contraseña.
                </p>
              </div>
              <div className="animate-brand-float rounded-full bg-primary/10 p-3 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-2xl bg-secondary/90 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode("phone")
                  setValue("")
                  setError("")
                }}
                className={`flex items-center justify-center gap-2 rounded-[1rem] py-3 text-sm font-semibold transition-all ${
                  mode === "phone"
                    ? "bg-background text-primary shadow-[0_14px_34px_-22px_rgba(159,31,238,0.8)]"
                    : "text-muted-foreground"
                }`}
              >
                <Phone className="h-4 w-4" />
                Teléfono
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("email")
                  setValue("")
                  setError("")
                }}
                className={`flex items-center justify-center gap-2 rounded-[1rem] py-3 text-sm font-semibold transition-all ${
                  mode === "email"
                    ? "bg-background text-primary shadow-[0_14px_34px_-22px_rgba(159,31,238,0.8)]"
                    : "text-muted-foreground"
                }`}
              >
                <Mail className="h-4 w-4" />
                Correo
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {mode === "phone" ? (
                  <div className="rounded-[1.4rem] border border-border/70 bg-white/90 p-1 shadow-[0_14px_30px_-26px_rgba(26,27,29,0.4)]">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                        <Phone className="h-5 w-5" />
                      </div>
                      <input
                        type="tel"
                        value={value}
                        onChange={(event) => {
                          setValue(event.target.value.replace(/[^\d]/g, "").slice(0, 10))
                          setError("")
                        }}
                        placeholder="Número Telefónico"
                        className="w-full rounded-[1.1rem] bg-transparent py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/75 focus:outline-none"
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={10}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.4rem] border border-border/70 bg-white/90 p-1 shadow-[0_14px_30px_-26px_rgba(26,27,29,0.4)]">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        type="email"
                        value={value}
                        onChange={(event) => {
                          setValue(event.target.value)
                          setError("")
                        }}
                        placeholder="tu@correo.com"
                        className="w-full rounded-[1.1rem] bg-transparent py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/75 focus:outline-none"
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-[1.4rem] border border-border/70 bg-white/90 p-1 shadow-[0_14px_30px_-26px_rgba(26,27,29,0.4)]">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setError("")
                      }}
                      placeholder="Contraseña"
                      className="w-full rounded-[1.1rem] bg-transparent py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground/75 focus:outline-none"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#a41c82_0%,#9f1fee_56%,#b867ff_100%)] py-4 text-base font-semibold text-primary-foreground shadow-[0_22px_40px_-22px_rgba(159,31,238,0.9)] transition-all hover:scale-[1.01] hover:shadow-[0_26px_48px_-24px_rgba(159,31,238,0.85)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-center">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Si es tu primer ingreso, después de continuar podrás crear tu contraseña
                y dejar tu perfil listo en segundos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
