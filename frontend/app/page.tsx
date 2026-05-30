import { redirect } from 'next/navigation'

export default function RootPage() {
  // TODO: check auth state when API is ready — redirect to /login if not authenticated
  redirect('/home')
}
