import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, Send, Sparkles, Menu, MessageSquare, Plus, ChevronRight, Star, TrendingUp, Compass, ShoppingCart, Zap, CheckCircle2 } from 'lucide-react'
import Spline from '@splinetool/react-spline'
import SmartProductCard from './SmartProductCard'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function SidebarLeft({ conversations, onNew, onSelect, trending }) {
  return (
    <div className="hidden lg:flex lg:flex-col w-80 border-r border-gray-200/80 bg-white/70 backdrop-blur-xl">
      <div className="p-6 border-b border-gray-200/80">
        <div className="text-sm font-medium text-gray-500">Trending & Discovery</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {trending.map((t, i) => (
            <div key={i} className="rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors p-3 text-xs text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" /> {t.title}
            </div>
          ))}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-500">Conversations</div>
          <button onClick={onNew} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>
        <div className="space-y-2">
          {conversations.map((c) => (
            <button key={c.id} onClick={() => onSelect(c)} className="w-full text-left rounded-xl border border-gray-200 hover:border-gray-300 bg-white px-3 py-2 text-sm">
              <div className="font-medium text-gray-800 truncate">{c.title}</div>
              <div className="text-xs text-gray-500 truncate">{c.preview}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SidebarRight({ selectedProduct }) {
  return (
    <div className="hidden xl:flex xl:flex-col w-96 border-l border-gray-200/80 bg-white/70 backdrop-blur-xl">
      <div className="p-6">
        <div className="text-sm font-medium text-gray-500 mb-3">Product Details</div>
        {selectedProduct ? (
          <div className="space-y-4">
            {selectedProduct.image && (
              <div className="overflow-hidden rounded-2xl bg-gray-100">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-56 object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xl font-bold">${selectedProduct.price.toFixed(2)}</span>
                <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                  <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" /> {selectedProduct.rating}
                </span>
              </div>
            </div>
            {selectedProduct.specs?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Key specs</div>
                <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                  {selectedProduct.specs.map((s, i) => (<li key={i}>{s}</li>))}
                </ul>
              </div>
            )}
            {selectedProduct.retailers?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Retailers</div>
                <div className="space-y-2">
                  {selectedProduct.retailers.map((r, i) => (
                    <a key={i} href={r.url || '#'} target="_blank" rel="noreferrer" className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${r.is_best ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200'}`}>
                      <span>{r.name}</span>
                      <span className="font-semibold">${r.price.toFixed(2)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">Select a product to see details.</div>
        )}
      </div>
    </div>
  )
}

function ChatBubble({ role, children }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isUser ? 'bg-gray-900 text-white' : 'bg-white'} max-w-xl rounded-2xl px-4 py-3 shadow-sm border ${isUser ? 'border-gray-900/10' : 'border-gray-200'}`}>
        {children}
      </div>
    </div>
  )
}

function ResearchSummary({ summary, tips }) {
  if (!summary && (!tips || tips.length === 0)) return null
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700"><Sparkles className="h-4 w-4 text-indigo-500" /> Research Summary</div>
      {summary && <p className="mt-2 text-sm text-gray-700 leading-relaxed">{summary}</p>}
      {tips?.length > 0 && (
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tips.map((t, i) => (
            <li key={i} className="inline-flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hi! I’m your shopping copilot. What are you looking for today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [summary, setSummary] = useState('')
  const [tips, setTips] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [trending, setTrending] = useState([])

  const [conversations, setConversations] = useState([
    { id: 'c1', title: 'Noise-canceling headphones', preview: 'Looking for commuting and office use' },
    { id: 'c2', title: 'Everyday laptop', preview: 'Budget under $1200' },
  ])

  useEffect(() => {
    fetch(`${API_BASE}/api/trending`).then(r => r.json()).then(setTrending).catch(()=>setTrending([]))
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content })
      })
      const data = await res.json()
      setSummary(data.summary)
      setTips(data.tips || [])
      setRecommendations(data.recommendations || [])
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.summary }])
    } catch (e) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry—something went wrong. Try again in a moment.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900">
      {/* Top hero with Spline */}
      <div className="relative h-[36vh] sm:h-[42vh] overflow-hidden">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/60 to-neutral-50/90" />
        <div className="absolute inset-x-0 bottom-4 mx-auto w-full max-w-5xl px-4">
          <div className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-lg p-3 sm:p-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? sendMessage() : null}
              placeholder="Ask anything: ‘Best ANC headphones under $400’, ‘Find better alternatives’, ‘Compare M3 laptops’…"
              className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-gray-400"
            />
            <button className="inline-flex items-center gap-1 rounded-full bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-black/90" onClick={sendMessage}>
              <Send className="h-4 w-4" /> Send
            </button>
            <button className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200">
              <Mic className="h-4 w-4" /> Voice
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_24rem] gap-6 -mt-10">
        <SidebarLeft
          conversations={conversations}
          trending={trending}
          onNew={() => setConversations(prev => [{ id: crypto.randomUUID(), title: 'New conversation', preview: 'Start typing…' }, ...prev])}
          onSelect={(c) => {}}
        />

        {/* Main chat area */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs"><Sparkles className="h-3.5 w-3.5" /> Smarter Search</span>
              <button onClick={() => setInput('Find better alternatives to my current pick')} className="text-xs rounded-full bg-gray-100 px-3 py-1">Find Better Alternatives</button>
              <button onClick={() => setInput('Compare top 3 options side by side')} className="text-xs rounded-full bg-gray-100 px-3 py-1">Quick Compare</button>
              <button onClick={() => setInput('Show daily essentials for home office')} className="text-xs rounded-full bg-gray-100 px-3 py-1">Daily Essentials</button>
            </div>

            <div className="space-y-4">
              {messages.map(m => (
                <ChatBubble key={m.id} role={m.role}>{m.content}</ChatBubble>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></span>
                  Thinking…
                </div>
              )}

              <ResearchSummary summary={summary} tips={tips} />

              {recommendations?.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((p) => (
                    <SmartProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Discovery sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800"><TrendingUp className="h-4 w-4 text-indigo-500" /> Trending This Week</div>
              <div className="mt-3 space-y-2">
                {trending.map((t, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700 flex items-center justify-between">
                    <span>{t.title}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800"><Compass className="h-4 w-4 text-indigo-500" /> Daily Essentials</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {['Home Office', 'Fitness', 'Kitchen', 'Travel'].map((c) => (
                  <div key={c} className="rounded-xl bg-gray-50 p-3 text-xs text-gray-700">{c}</div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800"><ShoppingCart className="h-4 w-4 text-indigo-500" /> Personal Picks</div>
              <div className="mt-3 space-y-2">
                {['Headphones for focus', 'Ergonomic chair', 'Desk lighting'].map((p) => (
                  <div key={p} className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700 flex items-center justify-between">
                    <span>{p}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SidebarRight selectedProduct={selectedProduct} />
      </div>

      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-gray-500">Designed to feel minimalist, premium, and effortless.</footer>
    </div>
  )
}
