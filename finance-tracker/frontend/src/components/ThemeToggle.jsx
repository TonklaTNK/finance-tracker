import { Sun, Moon } from 'lucide-react'

function ThemeToggle({ theme, setTheme }) {
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className='w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-amber-400 hover:bg-amber-500/20 transition-colors shadow-md'
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

export default ThemeToggle
