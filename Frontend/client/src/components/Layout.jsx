import Navbar from './Navbar'
import MobileNav from './MobileNav'
import AgentChat from './AgentChat'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <AgentChat />
    </>
  )
}
