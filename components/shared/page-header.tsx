type PageHeaderProps = {
    title: string
    description?: string
  }
  
  export function PageHeader({ title, description }: PageHeaderProps) {
    return (
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-muted/50 to-background py-24">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
  
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
            {description && <p className="text-lg text-muted-foreground sm:text-xl">{description}</p>}
          </div>
        </div>
      </div>
    )
  }
  