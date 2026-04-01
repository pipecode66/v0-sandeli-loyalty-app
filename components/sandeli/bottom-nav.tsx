"use client"

import { useApp } from "@/lib/app-context"
import { Home, Receipt, Gift } from "lucide-react"

const tabs = [
  { key: "home" as const, label: "Inicio", icon: Home },
  { key: "history" as const, label: "Historial", icon: Receipt },
  { key: "redeemables" as const, label: "Reclamables", icon: Gift },
]

export function BottomNav() {
  const { mainTab, setMainTab, isIOSBrowser } = useApp()

  if (isIOSBrowser) return null

  return (
    <nav className="pointer-events-none fixed inset-x-0 floating-bottom-nav z-40 px-4">
      <div className="pointer-events-auto mx-auto flex w-full max-w-md items-stretch rounded-[1.75rem] border border-border/80 bg-background/95 shadow-[0_18px_48px_-28px_rgba(26,27,29,0.55)] backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = mainTab === tab.key
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMainTab(tab.key)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition-all active:scale-95 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-all ${
                    isActive ? "text-primary" : ""
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isActive ? "text-primary" : ""
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
