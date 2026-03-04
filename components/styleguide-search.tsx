"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { FileText, Hash, Search, AlignLeft } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ItemType = "page" | "heading" | "content"

type SearchItem = {
  title: string
  href: string
  section: string
  description?: string
  type: ItemType
  keywords?: string[]
}

/* ------------------------------------------------------------------ */
/*  Search index                                                       */
/* ------------------------------------------------------------------ */

const searchIndex: SearchItem[] = [
  // Foundation — pages
  { title: "Overview", href: "/styleguide#overview", section: "Foundation", type: "page", description: "Contexto, princípios e direção visual do Aegis", keywords: ["visao geral", "resumo", "introdução", "aegis"] },
  { title: "Colors", href: "/styleguide#colors", section: "Foundation", type: "page", description: "Escalas, semânticas e contraste", keywords: ["cor", "cores", "paleta", "tema", "token"] },
  { title: "Typography", href: "/styleguide#typography", section: "Foundation", type: "page", description: "Hierarquia de texto e pesos", keywords: ["fonte", "texto", "heading", "tipografia", "font"] },
  { title: "Radius", href: "/styleguide#radius", section: "Foundation", type: "page", description: "Sistema de bordas arredondadas", keywords: ["borda", "arredondamento", "rounded", "border-radius"] },
  { title: "Shadows", href: "/styleguide#shadows", section: "Foundation", type: "page", description: "Elevação e profundidade visual", keywords: ["sombra", "elevacao", "depth", "shadow"] },

  // Foundation — headings / sub-content
  { title: "Semantic base", href: "/styleguide#colors", section: "Colors", type: "heading", description: "background, foreground, primary, secondary, accent, muted, destructive…", keywords: ["semantico", "base", "token", "variavel"] },
  { title: "Semantic status", href: "/styleguide#colors", section: "Colors", type: "heading", description: "success, info, warning, error", keywords: ["status", "estado", "sucesso", "erro", "alerta", "informacao"] },
  { title: "Primary scale", href: "/styleguide#colors", section: "Colors", type: "heading", description: "Escala principal âmbar 50–900", keywords: ["ambar", "amber", "laranja", "dourado", "primary"] },
  { title: "Secondary scale", href: "/styleguide#colors", section: "Colors", type: "heading", description: "Escala secundária 50–900", keywords: ["secondary", "secundaria"] },
  { title: "Accent scale", href: "/styleguide#colors", section: "Colors", type: "heading", description: "Escala de acento 50–900", keywords: ["accent", "acento", "destaque"] },
  { title: "Gray scale", href: "/styleguide#colors", section: "Colors", type: "heading", description: "Escala neutra 50–900", keywords: ["gray", "cinza", "neutro", "neutral"] },

  // UI — pages
  { title: "Components", href: "/styleguide#components", section: "UI", type: "page", description: "Biblioteca base e padrões de uso", keywords: ["componente", "ui", "interface"] },

  // UI — component sub-sections
  { title: "Buttons", href: "/styleguide#buttons", section: "Components", type: "heading", description: "Primary, secondary, outline, ghost, destructive", keywords: ["botao", "botoes", "button", "click", "acao"] },
  { title: "Badges", href: "/styleguide#badges", section: "Components", type: "heading", description: "Default, secondary, outline, destructive + status", keywords: ["badge", "etiqueta", "tag", "label", "selo"] },
  { title: "Cards", href: "/styleguide#cards", section: "Components", type: "heading", description: "Card com header, content e footer", keywords: ["card", "cartao", "painel", "panel"] },
  { title: "Alerts", href: "/styleguide#alerts", section: "Components", type: "heading", description: "Default e destructive alerts", keywords: ["alert", "alerta", "aviso", "notificacao", "mensagem"] },
  { title: "Radio Group", href: "/styleguide#radio-group", section: "Components", type: "heading", description: "Opções mutuamente exclusivas", keywords: ["radio", "opcao", "selecao", "escolha", "grupo"] },

  // Content snippets for deep search
  { title: "Paleta âmbar-dourado", href: "/styleguide#overview", section: "Overview", type: "content", description: "A paleta principal evita amarelo puro, puxando para um âmbar-dourado mais sofisticado", keywords: ["paleta", "ambar", "dourado", "amarelo", "cor"] },
  { title: "Pipelines e automações IA", href: "/styleguide#overview", section: "Overview", type: "content", description: "Boards, pipelines, automações com IA, análise de status e colaboração em escala", keywords: ["pipeline", "ia", "automacao", "board", "inteligencia"] },
  { title: "Light mode", href: "/styleguide#colors", section: "Colors", type: "content", description: "Tema claro padrão com identidade solar", keywords: ["light", "claro", "tema", "theme", "modo", "diurno"] },
  { title: "Inter font", href: "/styleguide#typography", section: "Typography", type: "content", description: "Fonte Inter para UI densa em contexto B2B", keywords: ["inter", "font", "fonte", "google"] },
  { title: "Heading H1–H6", href: "/styleguide#typography", section: "Typography", type: "content", description: "Hierarquia de headings do H1 ao H6", keywords: ["h1", "h2", "h3", "h4", "h5", "h6", "titulo", "heading"] },
  { title: "Font weights", href: "/styleguide#typography", section: "Typography", type: "content", description: "Regular 400, Medium 500, Semibold 600, Bold 700", keywords: ["weight", "peso", "regular", "medium", "semibold", "bold"] },
  { title: "Project Health card", href: "/styleguide#cards", section: "Cards", type: "content", description: "Status agregado de execução e deploy", keywords: ["project", "health", "saude", "status", "deploy"] },
  { title: "Deployment Queue card", href: "/styleguide#cards", section: "Cards", type: "content", description: "Fila de deploy por ambiente com aprovação", keywords: ["deployment", "queue", "fila", "deploy", "aprovacao"] },
]

/* ------------------------------------------------------------------ */
/*  Normalize + fuzzy scoring                                          */
/* ------------------------------------------------------------------ */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
}

function fuzzyScore(query: string, text: string): number {
  const q = normalize(query)
  const t = normalize(text)

  if (!q) return 0

  // Exact substring → top score
  if (t.includes(q)) {
    const idx = t.indexOf(q)
    // Earlier in string = higher score
    return 200 - Math.min(idx, 100)
  }

  // Sequential character matching (fuzzy)
  let qi = 0
  let score = 0
  let consecutive = 0
  let prevIdx = -2

  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      qi++

      // Consecutive character bonus
      if (i === prevIdx + 1) {
        consecutive++
        score += consecutive * 3
      } else {
        consecutive = 0
        score += 1
      }

      // Word-boundary bonus
      if (i === 0 || t[i - 1] === " " || t[i - 1] === "-" || t[i - 1] === "/" || t[i - 1] === "#") {
        score += 8
      }

      prevIdx = i
    }
  }

  // All characters in query must be found in order
  return qi === q.length ? score : 0
}

function scoreItem(query: string, item: SearchItem): number {
  const titleScore = fuzzyScore(query, item.title) * 3
  const descScore = fuzzyScore(query, item.description ?? "") * 1.5
  const sectionScore = fuzzyScore(query, item.section)
  const keywordScore = (item.keywords ?? []).reduce(
    (best, kw) => Math.max(best, fuzzyScore(query, kw) * 2),
    0
  )

  return titleScore + descScore + sectionScore + keywordScore
}

/* ------------------------------------------------------------------ */
/*  Icon helper                                                        */
/* ------------------------------------------------------------------ */

function ItemIcon({ type }: Readonly<{ type: ItemType }>) {
  const base = "mt-0.5 size-4 shrink-0 text-muted-foreground group-data-[active]:text-primary-foreground"
  switch (type) {
    case "page":
      return <FileText className={base} />
    case "heading":
      return <Hash className={base} />
    case "content":
      return <AlignLeft className={base} />
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StyleguideSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  /** Update query and reset active index in one batch */
  const updateQuery = useCallback((value: string) => {
    setQuery(value)
    setActiveIdx(0)
  }, [])

  /* ---- search results ---- */

  const results = useMemo(() => {
    const term = query.trim()

    if (!term) {
      // Show pages first, then headings, when empty
      return searchIndex.filter((i) => i.type === "page" || i.type === "heading").slice(0, 10)
    }

    return searchIndex
      .map((item) => ({ item, score: scoreItem(term, item) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item }) => item)
  }, [query])

  /* ---- navigate ---- */

  const goTo = useCallback(
    (href: string) => {
      router.push(href)
      setOpen(false)
      updateQuery("")
    },
    [router, updateQuery]
  )

  const close = useCallback(() => {
    setOpen(false)
    updateQuery("")
  }, [updateQuery])

  /* ---- global keyboard shortcut (Ctrl/Cmd+K) ---- */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((prev) => {
          if (prev) {
            updateQuery("")
            return false
          }
          return true
        })
      }
    }

    globalThis.addEventListener("keydown", onKeyDown)
    return () => globalThis.removeEventListener("keydown", onKeyDown)
  }, [updateQuery])

  /* ---- focus input when modal opens ---- */

  useEffect(() => {
    if (open) {
      // Small timeout to allow animation/render
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  /* ---- lock body scroll when open ---- */

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  /* ---- scroll active item into view ---- */

  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.children[activeIdx] as HTMLElement | undefined
    active?.scrollIntoView({ block: "nearest" })
  }, [activeIdx])

  /* ---- modal keyboard handling ---- */

  const onModalKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault()
          close()
          break
        case "ArrowDown":
          event.preventDefault()
          setActiveIdx((i) => (i + 1) % results.length)
          break
        case "ArrowUp":
          event.preventDefault()
          setActiveIdx((i) => (i - 1 + results.length) % results.length)
          break
        case "Enter":
          event.preventDefault()
          if (results[activeIdx]) goTo(results[activeIdx].href)
          break
      }
    },
    [results, activeIdx, goTo, close]
  )

  /* ---- trigger button (header bar) ---- */

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search documentation...</span>
        <kbd className="pointer-events-none ml-auto hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
          Ctrl K
        </kbd>
      </button>
    )
  }

  /* ---- modal ---- */

  const modal = (
    <>
      {/* Backdrop */}
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close search"
        className="fixed inset-0 z-100 cursor-default bg-black/50"
        onClick={close}
        onKeyDown={onModalKeyDown}
      />

      {/* Dialog */}
      <dialog
        open
        aria-label="Search documentation"
        className="fixed inset-x-0 top-[12vh] z-101 mx-auto w-[calc(100%-2rem)] max-w-xl bg-transparent p-0"
      >
        <div className="overflow-hidden rounded-lg border bg-popover shadow-lg">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={onModalKeyDown}
              placeholder="Search documentation..."
              className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Search"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={close}
              className="rounded border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {results.length > 0 ? (
              <ul ref={listRef} className="p-2">
                {results.map((item, idx) => (
                  <li
                    key={`${item.href}-${item.title}`}
                    aria-current={idx === activeIdx || undefined}
                  >
                    <button
                      type="button"
                      onClick={() => goTo(item.href)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      data-active={idx === activeIdx || undefined}
                      className="group flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors data-active:bg-primary data-active:text-primary-foreground"
                    >
                      <ItemIcon type={item.type} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        {item.description ? (
                          <p className="truncate text-xs opacity-70">{item.description}</p>
                        ) : null}
                      </div>
                      <span className="mt-0.5 shrink-0 text-[10px] uppercase tracking-wider opacity-50">
                        {item.section}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center gap-4 border-t px-4 py-2 text-[11px] text-muted-foreground">
            <span><kbd className="rounded border px-1 py-0.5 text-[10px]">↑</kbd> <kbd className="rounded border px-1 py-0.5 text-[10px]">↓</kbd> navigate</span>
            <span><kbd className="rounded border px-1 py-0.5 text-[10px]">↵</kbd> open</span>
            <span><kbd className="rounded border px-1 py-0.5 text-[10px]">esc</kbd> close</span>
          </div>
        </div>
      </dialog>
    </>
  )

  return createPortal(modal, document.body)
}
