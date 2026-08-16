import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { MessageCircle, X, Send, User, Bot } from 'lucide-react'

export default function AgentChat() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const panelRef = useRef(null)
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const location = useLocation()

  const listingId = (() => {
    const m = location.pathname.match(/^\/listings\/([a-f0-9]+)(?:\/|$)/i)
    return m ? m[1] : null
  })()

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector('input')?.focus()
  }, [open])

  // Auto-scroll to bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = message.trim()
    if (!text || loading) return
    setMessage('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await api.post('/api/agent/chat', {
        message: text,
        conversationId: conversationId || undefined,
        listingId: listingId || undefined,
      })
      if (res.conversationId) setConversationId(res.conversationId)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply || 'No response.' }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err.message || 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 md:bottom-6 gradient-primary text-primary-foreground"
        aria-label="Open assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-end justify-end p-0 sm:p-4 md:p-6">
          <button
            type="button"
            className="absolute inset-0 z-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close overlay"
          />
          <div
            ref={panelRef}
            className="relative z-10 flex h-[85vh] max-h-[560px] w-full flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:mb-0 sm:h-[520px] sm:w-[420px] sm:rounded-2xl sm:border-b transition-shadow"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 py-3 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-display font-semibold text-foreground">StayNJoy Assistant</span>
                  <p className="text-[11px] text-muted-foreground leading-tight">Answers from our data only</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages — scrollable, auto-scroll to bottom */}
            <div
              ref={scrollContainerRef}
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4"
            >
              <div className="flex flex-col gap-4">
                {messages.length === 0 && !loading && (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Try: “How many listings do you have?” or “Listings in Aspen under $500” or “What’s the average price?”
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'rounded-tr-md bg-primary text-primary-foreground'
                          : 'rounded-tl-md bg-muted text-foreground'
                      }`}
                    >
                      <span className="whitespace-pre-wrap wrap-break-word">{m.content}</span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                      Thinking…
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-px shrink-0" aria-hidden />
              </div>
            </div>

            {/* Input */}
            <form
              className="shrink-0 border-t border-border bg-background p-3 rounded-b-2xl"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about listings, prices, locations..."
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none gradient-primary border-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
