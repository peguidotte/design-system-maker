import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const semanticBaseTokens = [
  "--background",
  "--foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--gold-1",
  "--gold-2",
  "--gold-3",
  "--gold-foreground",
  "--muted",
  "--muted-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
] as const

const semanticStatusTokens = [
  "--success",
  "--success-foreground",
  "--info",
  "--info-foreground",
  "--warning",
  "--warning-foreground",
  "--error",
  "--error-foreground",
] as const

const scaleSteps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const

type ScalePrefix = "gray" | "primary" | "secondary" | "accent"

function TokenGrid({
  title,
  tokens,
}: Readonly<{
  title: string
  tokens: readonly string[]
}>) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {tokens.map((token) => (
          <div key={token} className="rounded-md border p-2">
            <div
              className="h-8 rounded-sm border"
              style={{ backgroundColor: `hsl(var(${token}))` }}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">{token}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScaleGrid({
  title,
  prefix,
}: Readonly<{
  title: string
  prefix: ScalePrefix
}>) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {scaleSteps.map((step) => {
          const token = `--${prefix}-${step}`
          return (
            <div key={token} className="rounded-md border p-2">
              <div
                className="h-8 rounded-sm border"
                style={{ backgroundColor: `hsl(var(${token}))` }}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{token}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Section({
  id,
  title,
  description,
  children,
}: Readonly<{
  id: string
  title: string
  description?: string
  children: React.ReactNode
}>) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export default function StyleguidePage() {
  return (
    <div className="space-y-12">
      <Section
        id="overview"
        title="Overview"
        description="Aegis é um design system enterprise moderno com identidade âmbar/laranja e foco em clareza operacional."
      >
        <Card>
          <CardContent className="grid gap-6 p-6 md:grid-cols-2">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                O sistema visual busca equilíbrio entre robustez corporativa e linguagem atual de produto.
                A paleta principal evita amarelo puro para não conflitar com warning, puxando para
                um âmbar-dourado mais sofisticado.
              </p>
              <p>
                A estrutura foi pensada para cenários complexos: boards, pipelines, automações com IA,
                análise de status e colaboração em escala.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="aspect-video rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
                Placeholder: referência de dashboard
              </div>
              <div className="aspect-video rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
                Placeholder: referência de board
              </div>
              <div className="aspect-video rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground sm:col-span-2">
                Placeholder: referência de landing/marketing
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        id="colors"
        title="Colors"
        description="Tokens organizados por semântica e escalas para uso consistente em superfícies, estados e comunicação visual."
      >
        <TokenGrid title="Semantic base" tokens={semanticBaseTokens} />
        <TokenGrid title="Semantic status" tokens={semanticStatusTokens} />
        <ScaleGrid title="Primary scale" prefix="primary" />
        <ScaleGrid title="Secondary scale" prefix="secondary" />
        <ScaleGrid title="Accent scale" prefix="accent" />
        <ScaleGrid title="Gray scale" prefix="gray" />
      </Section>

      <Section id="typography" title="Typography" description="Hierarquia de leitura e pesos para UI densa em contexto B2B.">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h1 className="text-4xl font-bold">Heading H1 - Aegis</h1>
            <h2 className="text-3xl font-semibold">Heading H2 - Planejamento</h2>
            <h3 className="text-2xl font-semibold">Heading H3 - Execução</h3>
            <h4 className="text-xl font-medium">Heading H4 - Resultado</h4>
            <h5 className="text-lg font-medium">Heading H5 - Métricas</h5>
            <h6 className="text-base font-medium">Heading H6 - Detalhes</h6>
            <p className="text-base">Body text para leitura padrão em painéis, listas e descrições técnicas.</p>
            <p className="text-sm text-muted-foreground">Small text para metadados, ajuda contextual e status auxiliar.</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-normal">400 Regular</span>
              <span className="font-medium">500 Medium</span>
              <span className="font-semibold">600 Semibold</span>
              <span className="font-bold">700 Bold</span>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section id="radius" title="Radius" description="Escala de arredondamento para consistência visual entre elementos interativos.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-sm p-4">
            <p className="text-sm font-medium">rounded-sm</p>
            <p className="text-xs text-muted-foreground">var(--radius-sm)</p>
          </Card>
          <Card className="rounded-md p-4">
            <p className="text-sm font-medium">rounded-md</p>
            <p className="text-xs text-muted-foreground">var(--radius-md)</p>
          </Card>
          <Card className="rounded-lg p-4">
            <p className="text-sm font-medium">rounded-lg</p>
            <p className="text-xs text-muted-foreground">var(--radius-lg)</p>
          </Card>
          <Card className="rounded-xl p-4">
            <p className="text-sm font-medium">rounded-xl</p>
            <p className="text-xs text-muted-foreground">var(--radius-xl)</p>
          </Card>
        </div>
      </Section>

      <Section id="shadows" title="Shadows" description="Níveis de elevação para separação de contexto e foco de atenção.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
            <p className="text-sm font-medium">shadow-sm</p>
          </div>
          <div className="rounded-lg border bg-card p-6" style={{ boxShadow: "var(--shadow-md)" }}>
            <p className="text-sm font-medium">shadow-md</p>
          </div>
          <div className="rounded-lg border bg-card p-6" style={{ boxShadow: "var(--shadow-lg)" }}>
            <p className="text-sm font-medium">shadow-lg</p>
          </div>
        </div>
      </Section>

      <Section id="components" title="Components" description="Demonstração dos blocos base com variações e estados semânticos.">
        <div id="buttons" className="scroll-mt-24 space-y-4">
          <h3 className="text-xl font-semibold">Buttons</h3>
          <Card>
            <CardContent className="flex flex-wrap gap-3 p-6">
              <Button>Primary</Button>
              <Button variant="gold">Gold</Button>
              <Button variant="accept">Accept</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>
        </div>

        <div id="badges" className="scroll-mt-24 space-y-4">
          <h3 className="text-xl font-semibold">Badges</h3>
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                <Badge>Gold</Badge>
                <Badge className="bg-success text-success-foreground">Success</Badge>
                <Badge className="bg-info text-info-foreground">Info</Badge>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
                <Badge className="bg-error text-error-foreground">Error</Badge>
                <Badge className="bg-muted text-muted-foreground">Neutral</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div id="cards" className="scroll-mt-24 space-y-4">
          <h3 className="text-xl font-semibold">Cards</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Health</CardTitle>
                <CardDescription>Status agregado de execução</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Taxa de entrega estável e automações ativas.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Ver detalhes</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Deployment Queue</CardTitle>
                <CardDescription>Fila de deploy por ambiente</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">3 itens aguardando aprovação de release manager.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Abrir fila
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div id="alerts" className="scroll-mt-24 space-y-4">
          <h3 className="text-xl font-semibold">Alerts</h3>
          <div className="space-y-3">
            <Alert>
              <AlertTitle>Pipelines inteligentes ativados</AlertTitle>
              <AlertDescription>
                O Aegis utiliza tokens semânticos para manter consistência visual entre módulos.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Falha em etapa crítica</AlertTitle>
              <AlertDescription>Revisar credenciais do ambiente de produção.</AlertDescription>
            </Alert>
          </div>
        </div>

        <div id="radio-group" className="scroll-mt-24 space-y-4">
          <h3 className="text-xl font-semibold">Radio Group</h3>
          <Card>
            <CardContent className="p-6">
              <RadioGroup defaultValue="standard" className="gap-3">
                <label htmlFor="standard" className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="standard" id="standard" />
                  Modo standard
                </label>
                <label htmlFor="enterprise" className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="enterprise" id="enterprise" />
                  Modo enterprise
                </label>
                <label htmlFor="strict" className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="strict" id="strict" />
                  Modo compliance strict
                </label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  )
}
