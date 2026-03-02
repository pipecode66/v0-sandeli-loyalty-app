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
  redeemedToday: number
  lastRedeemDate: string
}

export interface Notification {
  id: string
  title: string
  message: string
  fullMessage: string
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

export interface RedeemableProduct {
  id: string
  name: string
  description: string
  pointsCost: number
  image: string
  category: string
}

type AppScreen = "login" | "verification" | "avatar-setup" | "welcome" | "main"
type MainTab = "home" | "history" | "redeemables"

interface AppState {
  screen: AppScreen
  mainTab: MainTab
  user: UserProfile | null
  notifications: Notification[]
  purchases: PurchaseRecord[]
  products: RedeemableProduct[]
  showIOSTutorial: boolean
  pendingLogin: { mode: "email" | "phone"; value: string; code: string } | null
  setPendingLogin: (login: { mode: "email" | "phone"; value: string; code: string } | null) => void
  setScreen: (screen: AppScreen) => void
  setMainTab: (tab: MainTab) => void
  setUser: (user: UserProfile | null) => void
  updateUser: (updates: Partial<UserProfile>) => void
  markNotificationRead: (id: string) => void
  dismissIOSTutorial: () => void
  redeemProduct: (product: RedeemableProduct) => { success: boolean; code?: string; waitMinutes?: number }
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

function generateRedeemCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
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

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0]
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Bienvenido a Sandeli",
    message: "Gracias por unirte a nuestro programa de fidelizacion.",
    fullMessage: "Gracias por unirte a nuestro programa de fidelizacion. Disfruta de tus beneficios exclusivos, acumula puntos con cada compra y canjea productos deliciosos y saludables. Recuerda que puedes canjear hasta 60 puntos por dia en productos de nuestro menu.",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Promo de temporada",
    message: "Doble puntos en todos los postres esta semana.",
    fullMessage: "Doble puntos en todos los postres esta semana. Disfruta de nuestros deliciosos brownies, parfaits, cucharables y mucho mas mientras acumulas el doble de puntos. Promocion valida del lunes al domingo de esta semana en todas nuestras sucursales. No acumulable con otras promociones.",
    date: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
  {
    id: "3",
    title: "Nuevo menu disponible",
    message: "Descubre nuestras nuevas tortas saludables.",
    fullMessage: "Descubre nuestras nuevas tortas saludables con nombres de flores: Lirio, Chocolata, Margarita, Amapola, Hortensia, Astromelia, Cataleya y Camelia. Elaboradas con harina de almendras, endulzadas con Stevia y sin azucar anadida. Ven a probarlas y acumula puntos con cada compra.",
    date: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
  {
    id: "4",
    title: "Sodas organicas",
    message: "Conoce nuestras nuevas sodas con beneficios para tu salud.",
    fullMessage: "Conoce nuestras nuevas sodas organicas con beneficios para tu salud. Alegria (sabor a Granadilla) regenera la flora intestinal. Brisa Tropical (sabor a Frutos Rojos) ayuda a prevenir la Aterosclerosis. Refrescante Equilibrio (sabor a te de limon) acelera la perdida de peso. Frescura total con beneficios reales.",
    date: new Date(Date.now() - 345600000).toISOString(),
    read: true,
  },
]

const samplePurchases: PurchaseRecord[] = [
  {
    id: "p1",
    date: new Date(Date.now() - 86400000).toISOString(),
    items: ["Parfite", "Latte frio"],
    total: 28500,
    pointsEarned: 29,
  },
  {
    id: "p2",
    date: new Date(Date.now() - 259200000).toISOString(),
    items: ["Torta Lirio", "Soda de Frutos Rojos"],
    total: 32000,
    pointsEarned: 32,
  },
  {
    id: "p3",
    date: new Date(Date.now() - 518400000).toISOString(),
    items: ["Brownie Arequipe", "Limonada de Hierbabuena"],
    total: 25000,
    pointsEarned: 25,
  },
  {
    id: "p4",
    date: new Date(Date.now() - 691200000).toISOString(),
    items: ["Parfite", "Te Chai"],
    total: 31000,
    pointsEarned: 31,
  },
  {
    id: "p5",
    date: new Date(Date.now() - 864000000).toISOString(),
    items: ["Parfite", "Capuchino"],
    total: 27000,
    pointsEarned: 27,
  },
]

const redeemableProducts: RedeemableProduct[] = [
  // POSTRES
  { id: "r1", name: "Parfite", description: "Yogur griego, fresas, banano, mermelada de frutos rojos, acompanado de granola pumpkin spices.", pointsCost: 15, image: "/images/products/parfite.jpg", category: "Postres" },
  { id: "r2", name: "Pie de Limon", description: "Elaborado con queso crema, yogur griego y zumo de limon (Keto).", pointsCost: 12, image: "/images/products/pie-limon.jpg", category: "Postres" },
  { id: "r3", name: "Brownie Arequipe y Almendras", description: "Elaborados con harina de almendras, chocolate, mantequilla ghee, arequipe sin azucar y almendras troceadas.", pointsCost: 12, image: "/images/products/brownie-arequipe.jpg", category: "Postres" },
  { id: "r4", name: "Brownie Full Chocolate", description: "Elaborados con harina de almendras, chocolate, mantequilla ghee y ganache de chocolate.", pointsCost: 12, image: "/images/products/brownie-arequipe.jpg", category: "Postres" },
  { id: "r5", name: "Mini Alfajor", description: "Elaborado con harina de almendras, fecula de maiz, mantequilla ghee y relleno de arequipe sin azucar.", pointsCost: 8, image: "/images/products/alfajor.jpg", category: "Postres" },
  { id: "r6", name: "Alfajor", description: "Elaborado con harina de almendras, fecula de maiz, mantequilla ghee y relleno de arequipe sin azucar.", pointsCost: 12, image: "/images/products/alfajor.jpg", category: "Postres" },
  { id: "r7", name: "Muffins", description: "Elaborado con harina de almendras, mantequilla ghee, topping de yogurt griego o arequipe sin azucar.", pointsCost: 10, image: "/images/products/muffin.jpg", category: "Postres" },
  { id: "r8", name: "Cuchareable Chocoarequipe", description: "Migas de ponque de chocolate, salsa de arequipe, crema pastelera y almibar tres leches.", pointsCost: 15, image: "/images/products/cuchareable.jpg", category: "Postres" },
  { id: "r9", name: "Cuchareable Victoria", description: "Cremoso de Limon, Galleta de Avena y Ponque de Almendras.", pointsCost: 15, image: "/images/products/cuchareable.jpg", category: "Postres" },
  { id: "r10", name: "Cuchareable Milky Way", description: "Crema pastelera sin azucar, Crema de mani, ganache de chocolate al 80%, ponque de almendras y lluvia de almendras troceadas.", pointsCost: 15, image: "/images/products/cuchareable.jpg", category: "Postres" },
  { id: "r11", name: "Cuchareable Tres Leches", description: "Migas de ponque de almendras, Almibar de tres leches, crema pastelera y lluvia de chocolate.", pointsCost: 15, image: "/images/products/cuchareable.jpg", category: "Postres" },
  { id: "r12", name: "Tartaleta de Frutos Rojos", description: "Galleta de avena, crema de yogurt y queso crema con mermelada de frutos rojos.", pointsCost: 14, image: "/images/products/tartaleta.jpg", category: "Postres" },
  // HELADOS
  { id: "r13", name: "Helado", description: "Helado sin azucar a base de yogur con salsas a eleccion.", pointsCost: 10, image: "/images/products/helado.jpg", category: "Helados" },
  { id: "r14", name: "Helado con Alfajor", description: "Helado sin azucar a base de yogur acompanado de alfajor artesanal.", pointsCost: 15, image: "/images/products/helado.jpg", category: "Helados" },
  { id: "r15", name: "Helado con Mini Brownie", description: "Helado sin azucar a base de yogur acompanado de mini brownie de almendras.", pointsCost: 15, image: "/images/products/helado.jpg", category: "Helados" },
  { id: "r16", name: "Malteada", description: "Base de helado a eleccion y salsas.", pointsCost: 18, image: "/images/products/malteada.jpg", category: "Helados" },
  // BEBIDAS FRIAS
  { id: "r17", name: "Soda de Frutos Verdes", description: "Mermelada de la casa de kiwi, uva y manzana verde.", pointsCost: 12, image: "/images/products/soda-frutos-verdes.jpg", category: "Bebidas Frias" },
  { id: "r18", name: "Soda de Frutos Rojos", description: "Mermelada de la casa de arandanos, fresas y moras.", pointsCost: 12, image: "/images/products/soda-frutos-rojos.jpg", category: "Bebidas Frias" },
  { id: "r19", name: "Soda de Frutos Amarillos", description: "Mermelada de la casa de uchuvas y maracuya.", pointsCost: 12, image: "/images/products/soda-frutos-verdes.jpg", category: "Bebidas Frias" },
  { id: "r20", name: "Limonada de Hierbabuena", description: "Hojas frescas de hierbabuena, sumo de jengibre y limon.", pointsCost: 10, image: "/images/products/limonada-hierbabuena.jpg", category: "Bebidas Frias" },
  { id: "r21", name: "Limonada de Jamaica", description: "Flor de Jamaica y limon.", pointsCost: 10, image: "/images/products/limonada-hierbabuena.jpg", category: "Bebidas Frias" },
  { id: "r22", name: "Limonada de Cafe", description: "Infusion citrica con cafe.", pointsCost: 10, image: "/images/products/limonada-hierbabuena.jpg", category: "Bebidas Frias" },
  { id: "r23", name: "Latte Frio", description: "Espresso con leche cremada.", pointsCost: 10, image: "/images/products/latte-frio.jpg", category: "Bebidas Frias" },
  { id: "r24", name: "Frapuccino", description: "Delicioso cafe latte, con arequipe sin azucar, frapeado en leche deslactosada.", pointsCost: 15, image: "/images/products/frapuccino.jpg", category: "Bebidas Frias" },
  { id: "r25", name: "Choco Frappe", description: "Delicioso frappe de cacao sin azucar con ganache de chocolate.", pointsCost: 15, image: "/images/products/frapuccino.jpg", category: "Bebidas Frias" },
  { id: "r26", name: "Frappe de Vainilla", description: "Delicioso frappe de vainilla en leche deslactosada.", pointsCost: 15, image: "/images/products/frapuccino.jpg", category: "Bebidas Frias" },
  { id: "r27", name: "Malteada de Frutos Rojos", description: "Frutos frescos y mermelada de frutos rojos.", pointsCost: 18, image: "/images/products/malteada.jpg", category: "Bebidas Frias" },
  // SODAS ORGANICAS
  { id: "r28", name: "Alegria", description: "Sabor a Granadilla. Regenera y equilibra la flora intestinal, reduce la acidez y los sintomas de gastritis.", pointsCost: 14, image: "/images/products/soda-frutos-verdes.jpg", category: "Sodas Organicas" },
  { id: "r29", name: "Brisa Tropical", description: "Sabor a Frutos Rojos. Ayuda a prevenir la Aterosclerosis.", pointsCost: 14, image: "/images/products/soda-frutos-rojos.jpg", category: "Sodas Organicas" },
  { id: "r30", name: "Refrescante Equilibrio", description: "Sabor a te de limon. Acelera la perdida de peso, acelera el metabolismo de las grasas.", pointsCost: 14, image: "/images/products/soda-frutos-verdes.jpg", category: "Sodas Organicas" },
  { id: "r31", name: "Fresca Vida", description: "Sabor a Guayaba. Colageno natural para tu piel.", pointsCost: 14, image: "/images/products/soda-frutos-verdes.jpg", category: "Sodas Organicas" },
  { id: "r32", name: "Salud Brillante", description: "Sabor a Uva. Retarda los efectos del Envejecimiento.", pointsCost: 14, image: "/images/products/soda-frutos-rojos.jpg", category: "Sodas Organicas" },
  // BEBIDAS CALIENTES
  { id: "r33", name: "Cafe Espresso", description: "Cafe puro intenso.", pointsCost: 8, image: "/images/products/capuchino.jpg", category: "Bebidas Calientes" },
  { id: "r34", name: "Americano", description: "Un espresso con agua.", pointsCost: 8, image: "/images/products/capuchino.jpg", category: "Bebidas Calientes" },
  { id: "r35", name: "Moccachino", description: "Espresso con leche cremada y Chocolate.", pointsCost: 12, image: "/images/products/capuchino.jpg", category: "Bebidas Calientes" },
  { id: "r36", name: "Capuchino", description: "Espresso doble con leche cremada.", pointsCost: 12, image: "/images/products/capuchino.jpg", category: "Bebidas Calientes" },
  { id: "r37", name: "Latte Caliente", description: "Espresso sencillo con leche cremada.", pointsCost: 10, image: "/images/products/capuchino.jpg", category: "Bebidas Calientes" },
  { id: "r38", name: "Chocolate Caliente", description: "En leche deslactosada.", pointsCost: 10, image: "/images/products/chocolate-caliente.jpg", category: "Bebidas Calientes" },
  { id: "r39", name: "Te Chai Caliente", description: "Te Chai en leche caliente.", pointsCost: 10, image: "/images/products/te-chai.jpg", category: "Bebidas Calientes" },
  { id: "r40", name: "Te Matcha Caliente", description: "Te Matcha preparado caliente.", pointsCost: 12, image: "/images/products/te-chai.jpg", category: "Bebidas Calientes" },
  { id: "r41", name: "Aromatica", description: "Opciones: Jengibre, Hierbabuena y Jamaica.", pointsCost: 8, image: "/images/products/te-chai.jpg", category: "Bebidas Calientes" },
  // TORTAS
  { id: "r42", name: "Torta Lirio", description: "Elaborada con harina de almendras, endulzada con Stevia, relleno de yogur griego, arequipe sin azucar y mermelada de frutos rojos.", pointsCost: 18, image: "/images/products/torta-lirio.jpg", category: "Tortas" },
  { id: "r43", name: "Torta Chocolata", description: "Torta de Chocolate al 80% elaborada con harina de almendras y cubierto de ganache de chocolate (sin azucar).", pointsCost: 18, image: "/images/products/torta-chocolata.jpg", category: "Tortas" },
  { id: "r44", name: "Torta Margarita", description: "Elaborada con harina de almendras, endulzado con Stevia, relleno y cubierto de arequipe sin azucar y lluvia de almendras troceadas.", pointsCost: 18, image: "/images/products/torta-margarita.jpg", category: "Tortas" },
  { id: "r45", name: "Torta Amapola", description: "Elaborada con harina de almendras, aromatizada con naranja y semillas de amapola. Corazon de mermelada de frutos rojos, cubierta con yogurt griego y queso crema.", pointsCost: 18, image: "/images/products/torta-lirio.jpg", category: "Tortas" },
  { id: "r46", name: "Torta Hortensia", description: "Torta de zanahoria elaborada con harina de almendras, nueces troceadas, arandanos y coco deshidratado sin azucar.", pointsCost: 18, image: "/images/products/torta-margarita.jpg", category: "Tortas" },
  { id: "r47", name: "Torta Astromelia", description: "Torta de Banano elaborada con harina de almendras, chips de chocolate sin azucar, mousse con notas de cafe y topping de frambuesa cubierta con chocolate.", pointsCost: 18, image: "/images/products/torta-chocolata.jpg", category: "Tortas" },
  { id: "r48", name: "Torta Cataleya", description: "Elaborada con harina de almendras, rellena y cubierta con mousse de chocolate.", pointsCost: 18, image: "/images/products/torta-chocolata.jpg", category: "Tortas" },
  { id: "r49", name: "Torta Camelia", description: "Clasica torta vasca con base de crema suave y esponjosa. Con salsa de mora o arequipe.", pointsCost: 18, image: "/images/products/torta-lirio.jpg", category: "Tortas" },
  { id: "r50", name: "Torta Pan de Quinoa", description: "Elaborado con pan sin gluten, queso y bocadillo sin azucar.", pointsCost: 16, image: "/images/products/torta-margarita.jpg", category: "Tortas" },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>("login")
  const [mainTab, setMainTab] = useState<MainTab>("home")
  const [user, setUser] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [showIOSTutorial, setShowIOSTutorial] = useState(false)
  const [pendingLogin, setPendingLogin] = useState<{ mode: "email" | "phone"; value: string; code: string } | null>(null)

  useEffect(() => {
    const savedUser = sessionStorage.getItem("sandeli_user")
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      setUser(parsed)
      setScreen("main")
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

  const redeemProduct = useCallback((product: RedeemableProduct): { success: boolean; code?: string; waitMinutes?: number } => {
    if (!user) return { success: false }

    const today = getTodayStr()
    const currentRedeemedToday = user.lastRedeemDate === today ? user.redeemedToday : 0

    if (currentRedeemedToday + product.pointsCost > 60) {
      // Calculate minutes until midnight
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const waitMinutes = Math.ceil((midnight.getTime() - now.getTime()) / 60000)
      return { success: false, waitMinutes }
    }

    if (user.points < product.pointsCost) {
      return { success: false }
    }

    const code = generateRedeemCode()
    const updated = {
      ...user,
      points: user.points - product.pointsCost,
      redeemedToday: currentRedeemedToday + product.pointsCost,
      lastRedeemDate: today,
    }
    setUser(updated)
    sessionStorage.setItem("sandeli_user", JSON.stringify(updated))
    return { success: true, code }
  }, [user])

  const logout = useCallback(() => {
    sessionStorage.removeItem("sandeli_user")
    setUser(null)
    setScreen("login")
    setMainTab("home")
    setPendingLogin(null)
  }, [])

  return (
    <AppContext.Provider
      value={{
        screen,
        mainTab,
        user,
        notifications,
        purchases: samplePurchases,
        products: redeemableProducts,
        showIOSTutorial,
        pendingLogin,
        setPendingLogin,
        setScreen: handleSetScreen,
        setMainTab,
        setUser: handleSetUser,
        updateUser,
        markNotificationRead,
        dismissIOSTutorial,
        redeemProduct,
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

export { generateUserCode, generateVerificationCode, isIOS }
