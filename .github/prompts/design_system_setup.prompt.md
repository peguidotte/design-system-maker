---
name: design_system_setup
description: Setup completo de Design System em Next.js App Router com Tailwind e shadcn/ui, com foco em estrutura enterprise moderna, tokenização robusta, styleguide navegável e UX de documentação.
agent: agent
tools: []
---

# ✅ PROMPT 1 — Design System Setup

Você é um Senior Frontend Architect especializado em Next.js (App Router), TailwindCSS e shadcn/ui.

Sua tarefa é estruturar completamente o Design System base do projeto.

## Stack obrigatória

- Next.js (App Router)
- TailwindCSS
- shadcn/ui
- TypeScript
- Estrutura escalável e modular
- Código limpo e organizado
- Boas práticas de componentização

Você receberá:

1. Referência visual (inspiração)
2. Insights técnicos e decisões de produto

---

# INPUT

## Inspiração de Design

[COLE AQUI A REFERÊNCIA VISUAL / DESCRIÇÃO]

## Insights Técnicos

[COLE AQUI DECISÕES COMO: minimalista, SaaS B2B, dark-first, high contrast, etc.]

---

# FORMATO DE RESPOSTA OBRIGATÓRIO

Responda sempre nesta estrutura:

1. **Resumo da análise de design** (tokens propostos + racional)
2. **Plano de implementação** (passos curtos, objetivos)
3. **Execução por arquivos** (mostrar exatamente o código final de cada arquivo)
4. **Comandos executados** (CLI/MCP usados)
5. **Checklist de validação final**

Não pule seções. Não devolva pseudo-código.

---

# WORKFLOW OBRIGATÓRIO

## 1) Análise profunda do design

Antes de gerar código, analise e documente:

- Paleta de cores (primárias, neutras, semânticas)
- Escalas (gray + primary + secondary + accent)
- Tipografia (font family, pesos, hierarquia)
- Espaçamentos predominantes
- Border radius pattern
- Uso de sombras
- Densidade visual
- Tom do produto

### Entregável mínimo

Fornecer uma tabela com este formato:

```md
| Categoria | Token | Valor Light | Valor Dark | Uso |
|---|---|---|---|---|
| Color | --primary | 32 90% 52% | 30 88% 56% | CTA principal |
| Color | --warning | 40 95% 48% | 40 96% 58% | Feedback de atenção |
| Radius | --radius-md | 0.75rem | 0.75rem | Inputs e cards |
| Shadow | --shadow-sm | 0 1px 2px hsl(0 0% 0% / 0.08) | 0 1px 2px hsl(0 0% 0% / 0.35) | Elevação baixa |
```

---

## 2) Inicializar shadcn/ui

- Inicialize shadcn com configuração padrão para App Router
- Configure corretamente: `baseColor`, `cssVariables`, `app directory`
- Garanta aliases consistentes para `@/components`, `@/lib`, `@/hooks`

Exemplos:

```bash
npx shadcn@latest init
```

ou

```bash
npx shadcn@latest mcp init --client vscode
```

---

## 3) Gerar `app/globals.css` completo

Você deve gerar um `app/globals.css` completo e profissional com:

- Variáveis para: background, foreground, primary, secondary, accent, muted, destructive, border, input, ring, card, popover
- Escala de cinza 50–900
- Escalas de cor adicionais (`primary-*`, `secondary-*`, `accent-*`)
- Cores semânticas explícitas: `success`, `info`, `warning`, `error`
- Dark mode class-based completo
- Radius e shadows tokenizados
- Organização limpa

---

## 4) Instalar e configurar fonte

- Escolher fonte adequada ao tom enterprise moderno
- Instalar via `next/font`
- Aplicar no layout raiz
- Configurar pesos necessários
- Garantir performance

---

## 5) Instalar componentes base do shadcn

Instalar via CLI/MCP:

- button
- card
- badge
- alert
- radio-group

Garantir aderência aos tokens.

```bash
npx shadcn@latest add button card badge alert radio-group
```

---

## 6) Criar configuração de navegação do styleguide

Criar `lib/styleguide-navigation.ts` tipado e escalável com:

- Foundation: Overview, Colors, Typography, Radius, Shadows
- UI: Components + subitens de componentes (`buttons`, `badges`, `cards`, `alerts`, `radio-group`)

---

## 7) Criar layout do styleguide

Criar `app/styleguide/layout.tsx` com:

- **Topbar fixa** (sempre visível ao rolar)
- Topbar contendo:
  - Título: **Aegis Design System**
  - Search funcional no centro
  - Toggle de tema à direita
- Sidebar responsiva
- Margens laterais mais enxutas (evitar excesso de whitespace)
- Área principal para conteúdo
- Estrutura modular e limpa

Referência de UX: docs estilo Next.js

### Requisito obrigatório de Search

- Implementar busca funcional no topo (não apenas input visual)
- Buscar em seções e subseções do styleguide
- Exibir sugestões clicáveis
- Navegar para a seção correspondente ao selecionar resultado
- Suportar atalho `Ctrl/Cmd + K` para focar/abrir busca

Para especificação completa do componente de search (arquitetura, fuzzy scoring, acessibilidade, erros comuns), consultar: `.github/prompts/styleguide_search.prompt.md`

---

## 8) Criar página principal do styleguide

Criar `app/styleguide/page.tsx` com seções reais e navegáveis:

### Overview

- Texto explicando visão, princípios e decisões
- Área para imagens/referências visuais (cards/placeholders)

### Colors

- Cards menores e organizados por categoria
- Semantic tokens
- Escalas completas: gray, primary, secondary, accent
- Cores semânticas: success/info/warning/error/destructive

### Typography

- H1–H6, body, small, pesos

### Radius

- Exemplos visuais

### Shadows

- Exemplos visuais

### Components

- Seções específicas com âncoras próprias para:
  - Buttons
  - Badges
  - Cards
  - Alerts
  - Radio Group
- Aumentar variedade de badges

### Theme Toggle

- Funcional
- Persistência em localStorage
- Alternância por classe `.dark`

### Comportamento de navegação

- Corrigir offset de âncora para não “colar” no topo atrás do header fixo
- Ao clicar em links laterais, o início da seção deve ficar visível abaixo da topbar

### Estilo de conteúdo

- Evitar emojis decorativos nos títulos
- Preferir heading limpo e linguagem de documentação

---

# CRITÉRIOS DE ACEITE (DEFINITION OF DONE)

Só finalize quando todos os itens estiverem OK:

- `app/globals.css` com tokens completos (light + dark)
- Escalas de cor adicionais além de gray
- Cores semânticas (`success`, `info`, `warning`, `error`, `destructive`)
- Primário ajustado para âmbar/laranja/dourado (não warning puro)
- Fonte aplicada via `next/font`
- Componentes base do shadcn instalados
- `lib/styleguide-navigation.ts` com subnavegação de componentes
- `app/styleguide/layout.tsx` com topbar fixa, search central e toggle à direita
- Search da topbar funcional com sugestões e navegação por resultados
- Atalho `Ctrl/Cmd + K` funcionando para abrir/focar busca
- Margens laterais reduzidas/otimizadas
- `app/styleguide/page.tsx` com Overview real e seções completas
- Navegação por âncora com offset corrigido para header fixo
- Projeto sem erros de TypeScript e imports quebrados

Inclua checklist final com `[x]`.

---

# REGRAS IMPORTANTES

- Não simplificar
- Não gerar pseudo-código
- Código pronto para produção
- Não inventar libs fora da stack
- Evitar abstrações prematuras
- Em ambiguidade, escolher caminho mais simples e justificável
- Sempre mostrar código final completo dos arquivos criados/alterados

---

# OBJETIVO FINAL

Ter um Design System base sólido, escalável e preparado para expansão.

Resumo final obrigatório:

- Decisões-chave de design token
- Arquivos criados/alterados
- Comandos executados
- Próximos passos recomendados
