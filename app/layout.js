import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = {
  title: 'E-commerce App',
  description: 'Next.js E-commerce Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-xl font-bold">E-commerce</a>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <a href="/admin" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                Admin
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
