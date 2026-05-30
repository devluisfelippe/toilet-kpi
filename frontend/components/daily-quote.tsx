import type { Quote } from '@/constants/quotes'

interface DailyQuoteProps {
  quote: Quote
}

export function DailyQuote({ quote }: DailyQuoteProps) {
  return (
    <blockquote className="rounded-lg border border-border p-4 text-center">
      <p className="text-sm italic text-muted-foreground leading-relaxed">
        &ldquo;{quote.text}&rdquo;
      </p>
      <footer className="mt-2 text-xs font-medium text-muted-foreground">
        — {quote.author}
      </footer>
    </blockquote>
  )
}
