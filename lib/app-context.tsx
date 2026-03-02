"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

// Types
export interface UserProfile {
  email?: string
  phone?: string
  avatar: string | null
  avatarType: "preset" | "custom"
  userCode: string
  name: string
  points: number
  joinDate: string
}

export interface Notification {
  id: string
  title: string
  message: string
  date: string
  read: boolean
}

export interface PurchaseRecord {
  id: string
  date: string
  items: string[]
  total: number
  pointsEarned: number
}

export interface Promotion {
  id: string
  title: string
  description: string
  pointsCost: number
  image: string
  category: string
}

type AppScreen = "login" | "avatar-setup" | "welcome" | "main"
type MainTab = "home" | "history" | "menu"

interface AppState {
  screen: AppScreen
  mainTab: MainTab
  user: UserProfile | null
  notifications: Notification[]
  purchases: PurchaseRecord[]
  promotions: Promotion[]
  showIOSTutorial: boolean
  setScreen: (screen: AppScreen) => void
  setMainTab: (tab: MainTab) => void
  setUser: (user: UserProfile | null) => void
  updateUser: (updates: Partial<UserProfile>) => void
  markNotificationRead: (id: string) => void
  dismissIOSTutorial: () => void
  logout: () => void
}

const AppContext = createContext<AppState | undefined>(undefined)

function generateUserCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  const specials = "#$@*!"
  let code = ""
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const specialChar = specials.charAt(Math.floor(Math.random() * specials.length))
  const insertPos = Math.floor(Math.random() * (code.length + 1))
  return code.slice(0, insertPos) + specialChar + code.slice(insertPos)
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true)
  )
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Bienvenido a Sandeli",
    message: "Gracias por unirte a nuestro programa de fidelizacion. Disfruta de tus beneficios exclusivos.",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Promo de temporada",
    message: "Doble puntos en todos los bowls esta semana. No te lo pierdas.",
    date: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
  {
    id: "3",
    title: "Nuevo menu disponible",
    message: "Descubre nuestros nuevos wraps saludables con ingredientes de temporada.",
    date: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
]

const samplePurchases: PurchaseRecord[] = [
  {
    id: "p1",
    date: new Date(Date.now() - 86400000).toISOString(),
    items: ["Bowl Tropical", "Jugo Verde"],
    total: 28500,
    pointsEarned: 29,
  },
  {
    id: "p2",
    date: new Date(Date.now() - 259200000).toISOString(),
    items: ["Wrap Mediterraneo", "Smoothie Frutal"],
    total: 32000,
    pointsEarned: 32,
  },
  {
    id: "p3",
    date: new Date(Date.now() - 518400000).toISOString(),
    items: ["Ensalada Caesar Fit", "Agua Infusionada"],
    total: 25000,
    pointsEarned: 25,
  },
  {
    id: "p4",
    date: new Date(Date.now() - 691200000).toISOString(),
    items: ["Bowl de Quinoa", "Te Matcha"],
    total: 31000,
    pointsEarned: 31,
  },
]

const samplePromotions: Promotion[] = [
  {
    id: "pr1",
    title: "Jugo Verde Gratis",
    description: "Canjea un jugo verde natural con cualquier bowl.",
    pointsCost: 50,
    image: "juice",
    category: "Bebidas",
  },
  {
    id: "pr2",
    title: "Bowl Tropical",
    description: "Disfruta de nuestro famoso bowl tropical totalmente gratis.",
    pointsCost: 120,
    image: "bowl",
    category: "Bowls",
  },
  {
    id: "pr3",
    title: "Postre Saludable",
    description: "Un delicioso postre a base de frutas naturales y avena.",
    pointsCost: 80,
    image: "dessert",
    category: "Postres",
  },
  {
    id: "pr4",
    title: "Combo Familiar",
    description: "4 bowls + 4 bebidas para compartir en familia.",
    pointsCost: 300,
    image: "combo",
    category: "Combos",
  },
  {
    id: "pr5",
    title: "Wrap Premium",
    description: "Wrap con proteina premium y vegetales frescos.",
    pointsCost: 90,
    image: "wrap",
    category: "Wraps",
  },
  {
    id: "pr6",
    title: "Smoothie Doble",
    description: "Dos smoothies del sabor que prefieras.",
    pointsCost: 70,
    image: "smoothie",
    category: "Bebidas",
  },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>("login")
  const [mainTab, setMainTab] = useState<MainTab>("home")
  const [user, setUser] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [showIOSTutorial, setShowIOSTutorial] = useState(false)

  useEffect(() => {
    const savedUser = sessionStorage.getItem("sandeli_user")
    const tutorialDismissed = localStorage.getItem("sandeli_ios_tutorial_dismissed")

    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      setUser(parsed)
      setScreen("main")
    }

    if (isIOS() && !isStandalone() && !tutorialDismissed) {
      // Will be triggered after first login
    }
  }, [])

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      sessionStorage.setItem("sandeli_user", JSON.stringify(updated))
      return updated
    })
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const dismissIOSTutorial = useCallback(() => {
    setShowIOSTutorial(false)
    localStorage.setItem("sandeli_ios_tutorial_dismissed", "true")
  }, [])

  const handleSetScreen = useCallback((newScreen: AppScreen) => {
    setScreen(newScreen)
  }, [])

  const handleSetUser = useCallback((newUser: UserProfile | null) => {
    setUser(newUser)
    if (newUser) {
      sessionStorage.setItem("sandeli_user", JSON.stringify(newUser))
      const tutorialDismissed = localStorage.getItem("sandeli_ios_tutorial_dismissed")
      if (isIOS() && !isStandalone() && !tutorialDismissed) {
        setShowIOSTutorial(true)
      }
    } else {
      sessionStorage.removeItem("sandeli_user")
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem("sandeli_user")
    setUser(null)
    setScreen("login")
    setMainTab("home")
  }, [])

  return (
    <AppContext.Provider
      value={{
        screen,
        mainTab,
        user,
        notifications,
        purchases: samplePurchases,
        promotions: samplePromotions,
        showIOSTutorial,
        setScreen: handleSetScreen,
        setMainTab,
        setUser: handleSetUser,
        updateUser,
        markNotificationRead,
        dismissIOSTutorial,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export { generateUserCode, isIOS }
