import { Compass } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-white px-6 py-4 mt-auto">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Compass className="h-4 w-4 text-primary" />
          <span>Biznis Navigator ERP</span>
        </div>
        <p className="text-xs text-muted-foreground/70">
          &copy; {new Date().getFullYear()} Biznis Navigator. Sva prava zadržana.
        </p>
      </div>
    </footer>
  )
}
