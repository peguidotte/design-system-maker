---
name: styleguide_search
description: Construir o componente de busca do styleguide — modal com fuzzy search, navegação por teclado, portal rendering e acessibilidade. Referência UX do search da documentação do Next.js.
agent: agent
tools: [vscode, execute, read, agent, edit, search, web, todo, 'shadcn/*']
---

# PROMPT — Styleguide Search Component

Você é um Senior Frontend Architect especializado em Next.js (App Router), TailwindCSS e React.

Sua tarefa é construir o componente `StyleguideSearch` — a busca principal do styleguide do Design System.

## Pré-requisitos

Este prompt depende do setup descrito em `.github/prompts/design_system_setup.prompt.md`. Assuma que:

- O projeto já possui `app/globals.css` com tokens completos (light + dark)
- Existe `lib/styleguide-navigation.ts` com a estrutura de navegação tipada
- Existe `app/styleguide/layout.tsx` com topbar fixa, sidebar e área de conteúdo
- Existe `app/styleguide/page.tsx` com seções navegáveis por âncoras (`#overview`, `#colors`, etc.)
- shadcn/ui está configurado com `lucide-react` disponível
- Stack: Next.js App Router, TailwindCSS v4, TypeScript, React 19

---

## Stack e dependências

O componente deve usar **apenas** o que já existe no projeto:

- `react` (useState, useEffect, useCallback, useMemo, useRef)
- `react-dom` (createPortal)
- `next/navigation` (useRouter)
- `lucide-react` (Search, FileText, Hash, AlignLeft)

Nenhuma lib externa de search (fuse.js, minisearch, etc.). O fuzzy search é implementado manualmente.

---

## Referência de UX

A referência principal é o search da documentação do Next.js:

- Botão trigger na topbar com placeholder "Search documentation..." e badge `Ctrl K`
- Ao clicar ou pressionar `Ctrl/Cmd + K`, abre um **modal centralizado** com backdrop escuro
- Input de busca no topo do modal com ícone de lupa e botão `Esc`
- Lista de resultados com ícones diferenciados por tipo (página, heading, conteúdo)
- Item ativo destacado com cor primária (fundo laranja/âmbar, texto branco)
- Navegação por teclado: `↑`/`↓` para navegar, `Enter` para abrir, `Esc` para fechar
- Footer com hints de atalhos de teclado
- Clicar fora (no backdrop) fecha o modal
- Busca por similaridade (fuzzy matching), não apenas substring exata

---

## Arquitetura do componente

### Arquivo: `components/styleguide-search.tsx`

Diretiva obrigatória: `"use client"`

### Estrutura geral

```
StyleguideSearch (export)
├── Tipos (ItemType, SearchItem)
├── Índice de busca (searchIndex: SearchItem[])
├── Funções de scoring (normalize, fuzzyScore, scoreItem)
├── Componente de ícone (ItemIcon)
└── Componente principal
    ├── Estado: query, open, activeIdx
    ├── Refs: inputRef, backdropRef, listRef
    ├── Memoized results com scoring
    ├── Effects: atalho global, foco, scroll lock, scroll into view
    ├── Render condicional: trigger button OU portal com modal
    └── Modal: backdrop + dialog + input + resultados + footer
```

---

## Tipagem

```typescript
type ItemType = "page" | "heading" | "content"

type SearchItem = {
  title: string       // Título exibido no resultado
  href: string        // Rota com âncora (ex: "/styleguide#colors")
  section: string     // Seção pai (ex: "Foundation", "Components")
  description?: string // Descrição secundária
  type: ItemType      // Determina o ícone exibido
  keywords?: string[] // Palavras-chave para busca fuzzy (PT e EN)
}
```

---

## Índice de busca (searchIndex)

O índice deve conter **três níveis** de profundidade:

### 1. Páginas (type: "page")

Cada seção principal do styleguide: Overview, Colors, Typography, Radius, Shadows, Components.

```typescript
{ title: "Colors", href: "/styleguide#colors", section: "Foundation", type: "page",
  description: "Escalas, semânticas e contraste",
  keywords: ["cor", "cores", "paleta", "tema", "token"] }
```

### 2. Headings (type: "heading")

Sub-seções dentro das páginas: Semantic base, Primary scale, Buttons, Badges, etc.

```typescript
{ title: "Buttons", href: "/styleguide#buttons", section: "Components", type: "heading",
  description: "Primary, secondary, outline, ghost, destructive",
  keywords: ["botao", "botoes", "button", "click", "acao"] }
```

### 3. Conteúdo (type: "content")

Trechos de conteúdo encontráveis por busca profunda: "Dark mode", "Inter font", "Heading H1–H6", etc.

```typescript
{ title: "Dark mode", href: "/styleguide#colors", section: "Colors", type: "content",
  description: "Tema escuro com variáveis CSS HSL",
  keywords: ["dark", "escuro", "tema", "theme", "modo", "noturno"] }
```

### Regras do índice

- Cada item deve ter `keywords` bilíngues (português + inglês) para maximizar resultados fuzzy
- `href` deve apontar para a âncora `id` correspondente no `page.tsx`
- `description` deve ser conciso (uma linha) e relevante para busca
- Mínimo de 25 itens no índice para cobrir todo o styleguide

---

## Algoritmo de busca fuzzy

### Normalização

```typescript
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
}
```

- Lowercase
- Remove acentos via NFD + regex de diacríticos
- Usar `replaceAll` (não `replace`) para compliance com lint rules do Next.js

### Scoring (fuzzyScore)

Implementar scoring em duas camadas:

**Camada 1 — Substring exata (prioridade máxima):**
- Se o texto normalizado contém a query normalizada como substring
- Score: `200 - posição_da_ocorrência` (mais no início = melhor)

**Camada 2 — Matching sequencial de caracteres (fuzzy):**
- Cada caractere da query deve aparecer no texto na mesma ordem
- Bônus por caracteres consecutivos: `consecutive * 3`
- Bônus por início de palavra (após espaço, hífen, barra, #): `+8`
- Se nem todos os caracteres forem encontrados em ordem: score `0`

### Scoring por item (scoreItem)

Ponderação por campo:

| Campo | Multiplicador |
|---|---|
| title | × 3 |
| keywords (melhor match) | × 2 |
| description | × 1.5 |
| section | × 1 |

```typescript
function scoreItem(query: string, item: SearchItem): number {
  const titleScore = fuzzyScore(query, item.title) * 3
  const descScore = fuzzyScore(query, item.description ?? "") * 1.5
  const sectionScore = fuzzyScore(query, item.section)
  const keywordScore = (item.keywords ?? []).reduce(
    (best, kw) => Math.max(best, fuzzyScore(query, kw) * 2), 0
  )
  return titleScore + descScore + sectionScore + keywordScore
}
```

### Filtragem

- Se query vazia: mostrar pages e headings (até 10 itens)
- Se query preenchida: calcular score de todos os itens, filtrar `score > 0`, ordenar desc, limitar a 10

---

## Ícones por tipo

| ItemType | Ícone (lucide-react) | Significado |
|---|---|---|
| page | `FileText` | Seção principal |
| heading | `Hash` | Sub-seção/âncora |
| content | `AlignLeft` | Trecho de conteúdo |

Todos os ícones devem herdar a cor do estado ativo usando `group-data-[active]`:

```typescript
const base = "mt-0.5 size-4 shrink-0 text-muted-foreground group-data-[active]:text-primary-foreground"
```

---

## Estado e comportamento

### Estados React

| Estado | Tipo | Default | Uso |
|---|---|---|---|
| query | string | "" | Texto digitado no input |
| open | boolean | false | Modal aberto/fechado |
| activeIdx | number | 0 | Índice do item ativo na lista |

### Refs

| Ref | Tipo | Uso |
|---|---|---|
| inputRef | HTMLInputElement | Foco automático ao abrir |
| backdropRef | HTMLButtonElement | Referência do backdrop |
| listRef | HTMLUListElement | Scroll do item ativo into view |

### Helper: updateQuery

Para evitar o lint error de `setState` dentro de effect, usar um `useCallback` que atualiza query e reseta activeIdx em batch:

```typescript
const updateQuery = useCallback((value: string) => {
  setQuery(value)
  setActiveIdx(0)
}, [])
```

Usar `updateQuery` em vez de `setQuery` em todos os pontos: onChange do input, close, goTo, toggle via Ctrl+K.

---

## Effects obrigatórios

### 1. Atalho global `Ctrl/Cmd + K`

- Listener em `globalThis` (não `window` — lint rule do Next.js)
- `event.ctrlKey || event.metaKey` para suporte Windows/Mac
- Toggle: se aberto fecha (e limpa query), se fechado abre
- Dependency array: `[updateQuery]`

### 2. Foco automático ao abrir

- Quando `open` muda para `true`, focar o input após `setTimeout` de 50ms
- O timeout é necessário para dar tempo ao portal renderizar

### 3. Lock de scroll do body

- Quando modal abre: `document.body.style.overflow = "hidden"`
- Cleanup: restaurar valor anterior

### 4. Scroll do item ativo

- Quando `activeIdx` muda, fazer `scrollIntoView({ block: "nearest" })` no item correspondente
- Acessar via `listRef.current.children[activeIdx]`

---

## Keyboard handling

O handler `onModalKeyDown` deve ser atribuído ao `<input>` (elemento interativo), nunca a elementos não-interativos como `<dialog>` ou `<div>`.

| Tecla | Ação |
|---|---|
| Escape | Fechar modal e limpar query |
| ArrowDown | Avançar activeIdx (circular) |
| ArrowUp | Retroceder activeIdx (circular) |
| Enter | Navegar para `results[activeIdx].href` |

Navegação circular: `(i + 1) % results.length` e `(i - 1 + results.length) % results.length`.

---

## Renderização

### Dois estados visuais

O componente retorna condicionalmente:

**Quando fechado (`!open`):** um `<button>` trigger na topbar

```
[🔍 Search documentation...                    Ctrl K]
```

- Classe: `flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground`
- Hover: `hover:border-ring hover:text-foreground`
- Badge `Ctrl K` oculto em mobile: `hidden sm:inline-block`

**Quando aberto (`open`):** um modal via `createPortal(modal, document.body)`

### Estrutura do modal (portal)

```
<>
  <button backdrop />     ← fecha ao clicar
  <dialog open>           ← elemento semântico nativo
    <div container>
      <div input-area>    ← ícone + input + botão Esc
      <div results>       ← lista de resultados
      <div footer>        ← hints de atalhos
    </div>
  </dialog>
</>
```

### Por que createPortal?

O componente vive dentro do header que tem `backdrop-blur` e `z-50`. Sem portal, o modal ficaria preso no stacking context do header. Com `createPortal(modal, document.body)`, o modal renderiza no `<body>` e os z-index funcionam corretamente.

### Acessibilidade

| Elemento | Atributo | Valor |
|---|---|---|
| Backdrop | `<button>` com `aria-label` | "Close search" |
| Dialog | `<dialog open>` com `aria-label` | "Search documentation" |
| Input | `aria-label` | "Search" |
| List items | `<li>` com `aria-current` | `true` quando ativo |
| Result buttons | `data-active` | Para styling via CSS |

Regras de lint que devem ser respeitadas:

- **Não** usar `role="presentation"` — usar `<button>` ou `<img>` para elementos interativos
- **Não** usar `role="dialog"` — usar `<dialog>` nativo
- **Não** usar `role="option"` — usar `<li>` com `aria-current`
- **Não** atribuir `onKeyDown` a elementos não-interativos (`<div>`, `<dialog>`)
- Usar `globalThis` em vez de `window`
- Usar `replaceAll` em vez de `replace` com regex global
- **Não** usar `setState` dentro de `useEffect`
- **Não** acessar refs (`.current`) durante render

---

## Styling

### Backdrop

```
fixed inset-0 z-100 cursor-default bg-black/50
```

Sem `backdrop-blur-sm` — o blur causa artefato visual feio quando o header já tem `backdrop-blur`.

### Dialog container

```
fixed inset-x-0 top-[12vh] z-101 mx-auto w-[calc(100%-2rem)] max-w-xl bg-transparent p-0
```

### Card interno

```
overflow-hidden rounded-lg border bg-popover shadow-lg
```

### Item ativo

```
data-active:bg-primary data-active:text-primary-foreground
```

O botão de cada resultado usa classe `group` para que ícones filhos herdem a cor via `group-data-[active]:text-primary-foreground`.

### Footer de hints

```
flex items-center gap-4 border-t px-4 py-2 text-[11px] text-muted-foreground
```

Cada tecla dentro de `<kbd>` com `rounded border px-1 py-0.5 text-[10px]`.

---

## Integração com o layout

No `app/styleguide/layout.tsx`, o componente é usado dentro da topbar:

```tsx
<div className="justify-self-center w-full">
  <StyleguideSearch />
</div>
```

O trigger button preenche o espaço disponível. Quando abre, o modal escapa via portal.

---

## Critérios de aceite

- [ ] Componente é `"use client"` e exporta `StyleguideSearch`
- [ ] Trigger button na topbar com placeholder e badge `Ctrl K`
- [ ] `Ctrl/Cmd + K` abre/fecha o modal (toggle)
- [ ] Modal abre como overlay fixo via `createPortal` no `document.body`
- [ ] Backdrop `<button>` fecha ao clicar
- [ ] `Esc` fecha o modal (via input onKeyDown)
- [ ] Busca fuzzy funciona: substring exata + matching sequencial de caracteres
- [ ] Keywords bilíngues (PT/EN) aumentam cobertura de resultados
- [ ] Score ponderado por campo (title > keywords > description > section)
- [ ] Normalização remove acentos e case
- [ ] Resultados limitados a 10 itens
- [ ] Query vazia mostra pages + headings como sugestões iniciais
- [ ] `↑`/`↓` navega entre resultados (circular)
- [ ] `Enter` navega para a âncora do item ativo
- [ ] Item ativo destacado com `bg-primary text-primary-foreground`
- [ ] Ícones mudam de cor junto com o item ativo (via `group-data-[active]`)
- [ ] Três tipos de ícone: FileText (page), Hash (heading), AlignLeft (content)
- [ ] Body scroll é travado quando modal está aberto
- [ ] Input recebe foco automático ao abrir
- [ ] Item ativo faz scroll into view automaticamente
- [ ] `<dialog>` nativo em vez de `role="dialog"`
- [ ] `<button>` para backdrop em vez de `role="presentation"`
- [ ] Sem `setState` em `useEffect`
- [ ] Sem acesso a refs durante render
- [ ] `globalThis` em vez de `window`
- [ ] `replaceAll` em vez de `replace` com regex
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` compila com sucesso

---

## Erros comuns a evitar

| Erro | Causa | Solução |
|---|---|---|
| Modal atrás do header | Renderiza dentro do header com `z-50` | Usar `createPortal(modal, document.body)` |
| Blur feio no header | Backdrop com `backdrop-blur-sm` sobre header que já tem blur | Remover `backdrop-blur-sm` do backdrop |
| Clicar fora não fecha | Backdrop não é clicável ou z-index incorreto | Backdrop como `<button>` no portal |
| Ícone não muda cor | Falta `group` no botão pai | Adicionar `group` ao botão + `group-data-[active]:` no ícone |
| Lint: setState in effect | `setActiveIdx(0)` dentro de useEffect | Usar `updateQuery` callback que faz batch |
| Lint: ref during render | Acessar `ref.current` fora de effect/handler | Mover lógica para event handler ou effect |
| Lint: window not defined | `window.addEventListener` | Usar `globalThis.addEventListener` |
| Lint: non-interactive element | `onKeyDown` em `<div>` ou `<dialog>` | Mover para `<input>` ou `<button>` |
| Type error no ref | `useRef<HTMLDivElement>` para `<button>` | Tipo do ref deve corresponder ao elemento HTML |
