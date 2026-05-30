export interface Quote {
  text: string
  author: string
}

export const DAILY_QUOTES: Quote[] = [
  {
    text: 'O príncipe deve fazer o bem sempre que possível, mas estar preparado para fazer o mal quando necessário.',
    author: 'Nicolau Maquiavel',
  },
  {
    text: 'A natureza não faz nada em vão.',
    author: 'Aristóteles',
  },
  {
    text: 'Conhece-te a ti mesmo — incluindo o quanto de papel você usa.',
    author: 'Sócrates (adaptado)',
  },
  {
    text: 'A maior riqueza é a saúde, a segunda é a beleza, a terceira é o papel higiênico.',
    author: 'Platão (adaptado)',
  },
  {
    text: 'Seja a mudança que você quer ver no banheiro.',
    author: 'Mahatma Gandhi (adaptado)',
  },
]

export function getDailyQuote(): Quote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}
