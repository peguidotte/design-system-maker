export type StyleguideNavItem = {
  title: string
  href: string
  description?: string
}

export type StyleguideNavSection = {
  title: string
  items: StyleguideNavItem[]
}

export const styleguideNavigation: StyleguideNavSection[] = [
  {
    title: "Foundation",
    items: [
      {
        title: "Overview",
        href: "/styleguide#overview",
        description: "Contexto, princípios e direção visual",
      },
      {
        title: "Colors",
        href: "/styleguide#colors",
        description: "Escalas, semânticas e contraste",
      },
      {
        title: "Typography",
        href: "/styleguide#typography",
        description: "Hierarquia de texto e pesos",
      },
      {
        title: "Radius",
        href: "/styleguide#radius",
        description: "Sistema de bordas arredondadas",
      },
      {
        title: "Shadows",
        href: "/styleguide#shadows",
        description: "Elevação e profundidade visual",
      },
    ],
  },
  {
    title: "UI",
    items: [
      {
        title: "Components",
        href: "/styleguide#components",
        description: "Biblioteca base e padrões de uso",
      },
      {
        title: "Buttons",
        href: "/styleguide#buttons",
      },
      {
        title: "Badges",
        href: "/styleguide#badges",
      },
      {
        title: "Cards",
        href: "/styleguide#cards",
      },
      {
        title: "Alerts",
        href: "/styleguide#alerts",
      },
      {
        title: "Radio Group",
        href: "/styleguide#radio-group",
      },
    ],
  },
]
