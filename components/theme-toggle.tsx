"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "light"
    document.documentElement.classList.toggle("dark", saved === "dark")
  }, [])

  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      Alternar tema
    </Button>
  )
}
