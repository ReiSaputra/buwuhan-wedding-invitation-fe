import { Outlet } from 'react-router-dom'
import { BackButton } from '@/components/ui/BackButton'

export default function PlainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="h-1 w-full bg-success" />

      <header className="px-6 pt-5">
        <BackButton fallbackTo="/dashboard" />
      </header>

      <main className="px-6 pb-16 pt-6">
        <Outlet />
      </main>
    </div>
  )
}