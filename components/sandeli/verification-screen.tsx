"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useApp, generateUserCode, generateVerificationCode } from "@/lib/app-context"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"

const WHATSAPP_SENDER = "3242773556"
const GLOBAL_TEST_VERIFICATION_CODE = "000000"

export function VerificationScreen() {
  const { pendingLogin, setPendingLogin, setScreen, setUser } = useApp()
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  if (!pendingLogin) return null

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const newDigits = [...digits]
    if (val.length > 1) {
      // Handle paste
      const pastedDigits = val.slice(0, 6).split("")
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedDigits[i] || ""
      }
      setDigits(newDigits)
      const lastFilled = Math.min(pastedDigits.length - 1, 5)
      inputRefs.current[lastFilled]?.focus()
      return
    }
    newDigits[index] = val
    setDigits(newDigits)
    setError("")
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const enteredCode = digits.join("")
    if (enteredCode.length !== 6) {
      setError("Ingresa el codigo completo de 6 digitos")
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const isValidCode =
      enteredCode === pendingLogin.code || enteredCode === GLOBAL_TEST_VERIFICATION_CODE

    if (!isValidCode) {
      setError("Codigo incorrecto. Intenta de nuevo.")
      setLoading(false)
      return
    }

    const newUser = {
      ...(pendingLogin.mode === "email"
        ? { email: pendingLogin.value }
        : { phone: pendingLogin.value }),
      avatar: null,
      avatarType: "preset" as const,
      userCode: generateUserCode(),
      name: "",
      points: 117,
      joinDate: new Date().toISOString(),
      redeemedToday: 0,
      lastRedeemDate: "",
    }

    setUser(newUser)
    setLoading(false)
    setScreen("avatar-setup")
  }

  const handleResend = () => {
    if (resendCooldown > 0) return
    const newCode = generateVerificationCode()
    setPendingLogin({ ...pendingLogin, code: newCode })
    setDigits(["", "", "", "", "", ""])
    setError("")
    setResendCooldown(60)
    inputRefs.current[0]?.focus()
  }

  const handleBack = () => {
    setPendingLogin(null)
    setScreen("login")
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="relative flex flex-1 flex-col items-center px-6 pt-8">
        {/* Back button */}
        <div className="mb-8 flex w-full items-center">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-all active:scale-90"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <Image
          src="/images/logo.png"
          alt="Sandeli"
          width={160}
          height={62}
          className="mb-8"
        />

        <h2 className="mb-2 text-xl font-bold text-foreground">
          Codigo de verificacion
        </h2>
        <p className="mb-2 text-center text-sm text-muted-foreground">
          Ingresa el codigo de 6 digitos enviado via WhatsApp
        </p>
        <p className="mb-1 text-center text-xs text-muted-foreground">
          {"Desde: " + WHATSAPP_SENDER}
        </p>
        <p className="mb-8 text-center text-xs font-medium text-primary">
          {"A: " + pendingLogin.value}
        </p>

        {/* Code input */}
        <div className="mb-6 flex justify-center gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`h-14 w-12 rounded-xl border-2 bg-secondary text-center text-xl font-bold text-foreground transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${error ? "border-destructive" : "border-border"
                }`}
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-destructive">{error}</p>
        )}

        {/* Dev helper: show code */}
        <div className="mb-6 rounded-xl bg-primary/5 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Codigo de prueba:</p>
          <p className="font-mono text-lg font-bold tracking-[0.3em] text-primary">
            {pendingLogin.code}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Codigo global:</p>
          <p className="font-mono text-lg font-bold tracking-[0.3em] text-primary">
            {GLOBAL_TEST_VERIFICATION_CODE}
          </p>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || digits.some((d) => !d)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Verificar"
          )}
        </button>

        {/* Resend */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-primary transition-all disabled:opacity-50 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          {resendCooldown > 0
            ? `Reenviar en ${resendCooldown}s`
            : "Reenviar codigo"}
        </button>
      </div>
    </div>
  )
}
