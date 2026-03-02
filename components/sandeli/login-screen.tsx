"use client"

import { useState } from "react"
import Image from "next/image"
import { useApp, generateUserCode } from "@/lib/app-context"
import { Mail, Phone, ArrowRight, Loader2 } from "lucide-react"

export function LoginScreen() {
  const { setScreen, setUser } = useApp()
  const [mode, setMode] = useState<"email" | "phone">("email")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const isValidPhone = (phone: string) =>
    /^[\d\s\-+()]{7,15}$/.test(phone.replace(/\s/g, ""))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (mode === "email" && !isValidEmail(value)) {
      setError("Ingresa un correo electronico valido")
      return
    }
    if (mode === "phone" && !isValidPhone(value)) {
      setError("Ingresa un numero telefonico valido")
      return
    }

    setLoading(true)

    // Simulate checking external platform
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newUser = {
      ...(mode === "email" ? { email: value } : { phone: value }),
      avatar: null,
      avatarType: "preset" as const,
      userCode: generateUserCode(),
      name: "",
      points: 117,
      joinDate: new Date().toISOString(),
    }

    setUser(newUser)
    setLoading(false)
    setScreen("avatar-setup")
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top decorative area */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pt-12 pb-8">
        {/* Subtle bg pattern */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/10" />
        </div>

        <div className="relative flex flex-col items-center">
          <Image
            src="/images/logo.png"
            alt="Sandeli - Sano y Delicioso"
            width={260}
            height={100}
            className="mb-6"
            priority
          />
          <p className="text-center text-sm text-muted-foreground">
            Tu programa de fidelizacion saludable
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="rounded-t-3xl bg-secondary px-6 pt-8 pb-10 safe-bottom">
        <h2 className="mb-1 text-xl font-semibold text-foreground">
          Iniciar sesion
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Ingresa tu correo o numero telefonico registrado
        </p>

        {/* Toggle */}
        <div className="mb-5 flex rounded-xl bg-background p-1">
          <button
            type="button"
            onClick={() => {
              setMode("email")
              setValue("")
              setError("")
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === "email"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Mail className="h-4 w-4" />
            Correo
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("phone")
              setValue("")
              setError("")
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === "phone"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Phone className="h-4 w-4" />
            Telefono
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              {mode === "email" ? (
                <Mail className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Phone className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <input
              type={mode === "email" ? "email" : "tel"}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError("")
              }}
              placeholder={
                mode === "email"
                  ? "tu@correo.com"
                  : "+57 300 000 0000"
              }
              className="w-full rounded-xl border border-border bg-background py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              autoComplete={mode === "email" ? "email" : "tel"}
              inputMode={mode === "email" ? "email" : "tel"}
            />
          </div>

          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Continuar
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar, aceptas los terminos y condiciones del programa de fidelizacion Sandeli.
        </p>
      </div>
    </div>
  )
}
