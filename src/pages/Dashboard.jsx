import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Clock, Flame, CheckCircle2, CalendarClock } from 'lucide-react'
import { useStore, today } from '../store.jsx'
import { Bar, Prio, Ring, hm, Empty } from '../ui.jsx'

export default function Dashboard() {
  const { s, a, st, toast } = useStore(), h = new Date().getHours(), t0 = today()
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const goalPct = st.todayMin / (s.settings.goal * 60) * 100
  const tasks = s.tasks.filter(t => !t.deadline || t.deadline <= t0 || t.done).slice(0, 6)
  const sub = id => s.subjects.find(x => x.id === id)?.name || '—'
  const recent = [...s.topics].filter(t => t.last).sort((x, y) => y.last.localeCompare(x.last)).slice(0, 4)
  const overall = s.topics.length ? Math.round(st.topicsDone * 100 / s.topics.length) : 0
  const stats = [['Today', hm(st.todayMin), Clock], ['This week', hm(Math.round(st.weekMin)), CalendarClock], ['Tasks done', `${st.tasksDone}/${s.tasks.length}`, CheckCircle2], ['Streak', `${st.streak} days`, Flame]]
  return <div className="space-y-5">
    <div className="card flex flex-wrap items-center justify-between gap-5 bg-gradient-to-br from-indigo-500/10 to-transparent">
      <div><h1 className="text-2xl font-bold">{greet}, {s.settings.name} 👋</h1><p className="muted">Ready to make progress today?</p>
        <p className="mt-3 text-sm">Goal: <b>{s.settings.goal}h</b> · Done: <b>{hm(st.todayMin)}</b> · Overall progress: <b>{overall}%</b></p><Link to="/timer" className="btn-p mt-3">Start focus session</Link></div>
      <Ring v={goalPct} size={110} /></div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(([l, v, I]) => <div key={l} className="card hover:-translate-y-0.5"><I size={18} className="text-indigo-400" /><p className="mt-2 text-2xl font-bold">{v}</p><p className="muted text-sm">{l}</p></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card lg:col-span-2"><h2 className="mb-3 font-semibold">Weekly study (hours)</h2><div className="h-56"><ResponsiveContainer><AreaChart data={st.week}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity=".5" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#8884" /><XAxis dataKey="d" fontSize={12} /><YAxis fontSize={12} width={28} /><Tooltip /><Area dataKey="h" stroke="#6366f1" fill="url(#g)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></div>
      <div className="card"><h2 className="mb-3 font-semibold">Revision due</h2>{st.due.length ? st.due.slice(0, 4).map(t => <div key={t.id} className="flex items-center justify-between border-b border-slate-200/10 py-2 text-sm"><div><p className="font-medium">{t.name}</p><p className="muted text-xs">{sub(t.subjectId)}</p></div><button className="btn-g !py-1 text-xs" onClick={() => { a.revise(t.id); toast('Marked revised ✓') }}>Done</button></div>) : <p className="muted text-sm">Nothing due today 🎉</p>}<Link to="/revision" className="mt-3 block text-sm text-indigo-400">Open revision →</Link></div></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card"><h2 className="mb-3 font-semibold">Today's tasks</h2>{tasks.length ? tasks.map(t => <label key={t.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-200/10 py-2.5"><input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={t.done} onChange={() => a.upd('tasks', t.id, { done: !t.done })} /><div className="flex-1"><p className={`text-sm font-medium ${t.done ? 'muted line-through' : ''}`}>{t.title}</p><p className="muted text-xs">{sub(t.subjectId)} · {hm(t.est)}</p></div><Prio p={t.priority} /></label>) : <Empty icon={CheckCircle2} text="No tasks for today." />}</div>
      <div className="card"><h2 className="mb-3 font-semibold">Continue learning</h2>{recent.map(t => <div key={t.id} className="mb-3"><div className="mb-1 flex justify-between text-sm"><span>{t.name} <span className="muted">· {sub(t.subjectId)}</span></span><span className="muted">{t.status}</span></div><Bar v={t.status === 'Completed' ? 100 : t.status === 'In Progress' ? 50 : t.confidence * 15} /></div>)}</div></div>
  </div>
}
