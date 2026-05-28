import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'Klubr',
  description: 'Monétisation de communautés privées',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
