import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'
import { AuthProvider } from '@/context/AuthContext'
import NavBar from '@/components/NavBar'

export const metadata = {
  title: 'E-commerce App',
  description: 'Next.js E-commerce Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
