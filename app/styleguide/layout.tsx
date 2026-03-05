import Link from "next/link"
import { styleguideNavigation } from "@/lib/styleguide-navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { StyleguideSearch } from "@/components/styleguide-search"

export default function StyleguideLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto grid h-16 w-full max-w-350 grid-cols-[1fr_minmax(280px,520px)_1fr] items-center gap-4 px-4 md:px-6">
          <Link href="/styleguide#overview" className="text-sm font-semibold tracking-tight">
            Aegis Design System
          </Link>

          <div className="justify-self-center w-full">
            <StyleguideSearch />
          </div>

          <div className="justify-self-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-350 grid-cols-1 pt-16 md:grid-cols-[250px_1fr]">
        <aside className="border-b px-4 py-4 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-auto md:border-r md:border-b-0 md:px-5 md:py-6">
          <nav className="space-y-6">
            {styleguideNavigation.map((section) => (
              <div key={section.title}>
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="cursor-pointer text-sm text-foreground/80 transition-colors hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      {item.description ? (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="scroll-pt-24 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
