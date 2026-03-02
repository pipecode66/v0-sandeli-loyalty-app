"use client"

import { useState } from "react"
import Image from "next/image"
import { useApp, generateVerificationCode } from "@/lib/app-context"
import { Mail, Phone, ArrowRight, Loader2 } from "lucide-react"
import { CountryCodeSelector } from "./country-code-selector"
import { countryCodes, type CountryCode } from "@/lib/country-codes"

// Test credentials (local, no DB needed)
const TEST_EMAIL = "prueba@gmail.com"
const TEST_PHONE = "0123456789"
const WHATSAPP_SENDER = "3242773556"

const defaultCountry = countryCodes.find((c) => c.code === "CO")!

export function LoginScreen() {
  const { setScreen, setPendingLogin } = useApp()
  const [mode, setMode] = useState<"email" | "phone">("phone")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry)

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const isValidPhone = (phone: string) =>
    /^\d{7,15}$/.test(phone.replace(/[\s\-()]/g, ""))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (mode === "email") {
      if (!isValidEmail(value)) {
        setError("Ingresa un correo electronico valido")
        return
      }
      if (value.toLowerCase() !== TEST_EMAIL) {
        setError("Correo no registrado. Usa: prueba@gmail.com")
        return
      }
    }

    if (mode === "phone") {
      const cleanPhone = value.replace(/[\s\-()]/g, "")
      if (!isValidPhone(cleanPhone)) {
        setError("Ingresa un numero telefonico valido")
        return
      }
      if (cleanPhone !== TEST_PHONE) {
        setError("Numero no registrado. Usa: 0123456789")
        return
      }
    }

    setLoading(true)

    // Generate a random verification code
    const code = generateVerificationCode()

    // Simulate sending code via WhatsApp from 3242773556
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const contactValue =
      mode === "email" ? value : `${selectedCountry.dial} ${value}`

    setPendingLogin({ mode, value: contactValue, code })
    setLoading(false)
    setScreen("verification")
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top decorative area */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pt-12 pb-8">
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
          Ingresa tu telefono o correo registrado
        </p>

        {/* Toggle - Phone first */}
        <div className="mb-5 flex rounded-xl bg-background p-1">
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
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "phone" ? (
            /* Phone input with country code selector */
            <div className="mb-4 flex">
              <CountryCodeSelector
                selected={selectedCountry}
                onSelect={setSelectedCountry}
              />
              <input
                type="tel"
                value={value}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d\s]/g, "")
                  setValue(cleaned)
                  setError("")
                }}
                placeholder="300 000 0000"
                className="w-full min-w-0 rounded-r-xl border border-border bg-background py-3.5 pl-4 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
          ) : (
            /* Email input */
            <div className="relative mb-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="email"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError("")
                }}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-border bg-background py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                autoComplete="email"
                inputMode="email"
              />
            </div>
          )}

          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Enviando codigo...</span>
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {"Se enviara un codigo de verificacion via WhatsApp desde el numero " + WHATSAPP_SENDER}
        </p>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Al continuar, aceptas los terminos y condiciones del programa de fidelizacion Sandeli.
        </p>
      </div>
    </div>
  )
}
