import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Home, BookOpen, ListChecks, Brain, Timer as TimerI, CalendarDays, RefreshCw, Target, BarChart3, Trophy, Settings as Cog, Search, Bell, Flame, Sun, Moon, Briefcase, Wand2, Menu, X } from 'lucide-react'
import { useStore, today } from './store.jsx'
import { Modal } from './ui.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { Subjects, Topics, Tasks } from './pages/Library.jsx'
import { Focus, Calendar, Revision } from './pages/Focus.jsx'
import { Goals, Analytics, Achievements } from './pages/Insights.jsx'
import { Interview, Planner, Settings } from './pages/More.jsx'

const NAV = [['/', 'Dashboard', Home], ['/subjects', 'Subjects', BookOpen], ['/tasks', 'Tasks', ListChecks], ['/topics', 'Topics', Brain], ['/timer', 'Focus Timer', TimerI], ['/calendar', 'Calendar', CalendarDays], ['/revision', 'Revision', RefreshCw], ['/goals', 'Goals', Target], ['/analytics', 'Analytics', BarChart3], ['/achievements', 'Achievements', Trophy], ['/interview', 'Interview Prep', Briefcase], ['/planner', 'Study Planner', Wand2], ['/settings', 'Settings', Cog]]
const link = ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-300' : 'muted hover:bg-slate-100 dark:hover:bg-white/5'}`

export default function App() {
  const { s, a, st, toasts, dlg, setDlg } = useStore(), nav = useNavigate(), loc = useLocation()
  const [load, setLoad] = useState(true), [more, setMore] = useState(false), [bell, setBell] = useState(false), [q, setQ] = useState('')
  useEffect(() => { const t = setTimeout(() => setLoad(false), 500); return () => clearTimeout(t) }, [])
  useEffect(() => { setMore(false); setBell(false) }, [loc.pathname])
  if (load) return <div className="grid h-screen place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" role="status" aria-label="Loading" /></div>
  const overdue = s.tasks.filter(t => !t.done && t.deadline && t.deadline < today())
  const alerts = s.settings.notify ? [...st.due.map(t => `Revise: ${t.name}`), ...overdue.map(t => `Overdue: ${t.title}`)] : []
  return <div className="min-h-screen lg:pl-60">
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-1 overflow-y-auto border-r border-slate-200 p-4 dark:border-white/10 lg:flex">
      <div className="mb-4 flex items-center gap-2 px-2 text-lg font-bold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500 text-white">S</span>StudyFlow</div>
      {NAV.map(([to, l, I]) => <NavLink key={to} to={to} end={to === '/'} className={link}><I size={18} />{l}</NavLink>)}
    </aside>
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0e1a]/80">
      <form className="relative max-w-sm flex-1" onSubmit={e => { e.preventDefault(); nav(`/tasks?q=${encodeURIComponent(q)}`) }}><Search size={16} className="muted absolute left-3 top-2.5" /><input aria-label="Search tasks" className="inp pl-9" placeholder="Search tasks…" value={q} onChange={e => setQ(e.target.value)} /></form>
      <div className="ml-auto flex items-center gap-2">
        <span className="chip flex items-center gap-1 !bg-orange-500/15 text-orange-500"><Flame size={14} />{st.streak}</span>
        <div className="relative"><button aria-label="Notifications" className="btn-g relative !p-2" onClick={() => setBell(!bell)}><Bell size={16} />{alerts.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] text-white">{alerts.length}</span>}</button>
          {bell && <div className="card absolute right-0 mt-2 w-64 !bg-white dark:!bg-slate-900">{alerts.length ? alerts.slice(0, 8).map((x, i) => <p key={i} className="py-1 text-sm">{x}</p>) : <p className="muted text-sm">You're all caught up.</p>}</div>}</div>
        <button aria-label="Toggle theme" className="btn-g !p-2" onClick={() => a.set({ dark: !s.settings.dark })}>{s.settings.dark ? <Sun size={16} /> : <Moon size={16} />}</button>
        <button aria-label="Profile" onClick={() => nav('/settings')} className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500 text-sm font-bold text-white">{(s.settings.name || 'U')[0].toUpperCase()}</button>
      </div></header>
    <main key={loc.pathname} className="page mx-auto max-w-6xl p-4 pb-28 lg:p-8">
      <Routes><Route path="/" element={<Dashboard />} /><Route path="/subjects" element={<Subjects />} /><Route path="/tasks" element={<Tasks />} /><Route path="/topics" element={<Topics />} /><Route path="/timer" element={<Focus />} /><Route path="/calendar" element={<Calendar />} /><Route path="/revision" element={<Revision />} /><Route path="/goals" element={<Goals />} /><Route path="/analytics" element={<Analytics />} /><Route path="/achievements" element={<Achievements />} /><Route path="/interview" element={<Interview />} /><Route path="/planner" element={<Planner />} /><Route path="/settings" element={<Settings />} /></Routes>
    </main>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white/90 p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:hidden" aria-label="Mobile">
      {[NAV[0], NAV[2], NAV[4], NAV[6]].map(([to, l, I]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] ${isActive ? 'text-indigo-500' : 'muted'}`}><I size={20} />{l.split(' ')[0]}</NavLink>)}
      <button onClick={() => setMore(true)} className="muted flex flex-col items-center gap-0.5 px-3 py-1 text-[11px]"><Menu size={20} />More</button></nav>
    {more && <Modal title="Menu" onClose={() => setMore(false)}><div className="grid grid-cols-3 gap-2">{NAV.map(([to, l, I]) => <NavLink key={to} to={to} className="btn-g flex-col !py-3 text-xs"><I size={20} />{l}</NavLink>)}</div></Modal>}
    {dlg && <Modal title="Are you sure?" onClose={() => setDlg(null)}><p className="muted mb-4 text-sm">{dlg.msg}</p><div className="flex justify-end gap-2"><button className="btn-g" onClick={() => setDlg(null)}>Cancel</button><button className="btn-p !bg-red-500 hover:!bg-red-400" autoFocus onClick={() => { dlg.fn(); setDlg(null) }}>Confirm</button></div></Modal>}
    <div className="fixed bottom-20 right-4 z-[60] space-y-2 lg:bottom-6" aria-live="polite">{toasts.map(t => <div key={t.id} className="card !bg-white py-3 text-sm shadow-lg dark:!bg-slate-800">{t.msg}</div>)}</div>
  </div>
}
