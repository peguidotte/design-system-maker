import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">Aegis</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Design system base pronto para evolução.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/styleguide">Abrir Styleguide</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
