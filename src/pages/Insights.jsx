import { useState } from 'react'
import { Bar as RBar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, Pencil, Trash2, Target, Lock, Medal } from 'lucide-react'
import { useStore, today, addDays } from '../store.jsx'
import { Bar, Empty, FormModal, Head, Ring, hm } from '../ui.jsx'

export function Goals() {
  const { s, a, toast, confirm } = useStore(), [m, setM] = useState(null)
  const F = [{ k: 'title', label: 'Goal', req: 1 }, { k: 'type', label: 'Type', options: ['Daily', 'Weekly', 'Monthly', 'Long-term'] }, { k: 'target', label: 'Target', type: 'number', min: 1 }, { k: 'current', label: 'Current', type: 'number', min: 0 }, { k: 'unit', label: 'Unit (hours, problems…)' }]
  return <div><Head title="Goals"><button className="btn-p" onClick={() => setM({ title: '', type: 'Daily', target: 1, current: 0, unit: 'hours' })}><Plus size={16} />New goal</button></Head>
    {!s.goals.length ? <Empty icon={Target} text="Set your first goal." /> : <div className="grid gap-4 sm:grid-cols-2">{['Daily', 'Weekly', 'Monthly', 'Long-term'].flatMap(ty => s.goals.filter(g => g.type === ty)).map(g => { const p = g.current / g.target * 100; return <div key={g.id} className="card flex items-center gap-4">
      <Ring v={p} size={84} /><div className="flex-1"><span className="chip">{g.type}</span><p className="mt-1 font-semibold">{g.title}</p><p className="muted mb-2 text-xs">{g.current}/{g.target} {g.unit}</p><Bar v={p} color={p >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'} />
        <div className="mt-2 flex gap-1"><button className="btn-g !px-2 !py-1 text-xs" onClick={() => { a.upd('goals', g.id, { current: g.current + 1 }); g.current + 1 >= g.target && toast('Goal reached 🎯') }}>+1</button><button className="btn-g !px-2 !py-1 text-xs" onClick={() => a.upd('goals', g.id, { current: Math.max(0, g.current - 1) })}>−1</button><button aria-label="Edit" className="btn-g !p-1.5" onClick={() => setM(g)}><Pencil size={12} /></button><button aria-label="Delete" className="btn-g !p-1.5" onClick={() => confirm('Delete this goal?', () => a.del('goals', g.id))}><Trash2 size={12} /></button></div></div></div> })}</div>}
    {m && <FormModal title={m.id ? 'Edit goal' : 'New goal'} fields={F} init={m} onClose={() => setM(null)} onSave={v => { m.id ? a.upd('goals', m.id, v) : a.add('goals', v); toast('Goal saved') }} />}</div>
}

const COL = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
export function Analytics() {
  const { s, st } = useStore(), [r, setR] = useState(7), t0 = today()
  const first = s.sessions.map(x => x.date).sort()[0] || t0, n = r === 0 ? Math.max(7, Math.round((new Date(t0) - new Date(first)) / 864e5) + 1) : r
  const days = Array.from({ length: n }, (_, i) => addDays(t0, -(n - 1 - i))), set = new Set(days)
  const ses = s.sessions.filter(x => set.has(x.date)), tot = ses.reduce((q, x) => q + x.minutes, 0), step = n > 30 ? 7 : 1
  const series = []; for (let i = 0; i < n; i += step) { const ch = days.slice(i, i + step); series.push({ d: ch[0].slice(5), h: +(ch.reduce((q, d) => q + (st.by[d] || 0), 0) / 60).toFixed(1) }) }
  const bySub = s.subjects.map((x, i) => ({ name: x.name, value: +(ses.filter(q => q.subjectId === x.id).reduce((q, v) => q + v.minutes, 0) / 60).toFixed(1), c: COL[i % 7] })).filter(x => x.value > 0)
  const dw = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => ({ d, h: +(ses.filter(x => new Date(x.date + 'T00:00').getDay() === i).reduce((q, x) => q + x.minutes, 0) / 60).toFixed(1) }))
  const best = [...dw].sort((x, y) => y.h - x.h)[0], top = [...bySub].sort((x, y) => y.value - x.value)[0], active = days.filter(d => st.by[d]).length
  const cards = [['Total study', hm(tot)], ['Avg session', ses.length ? hm(Math.round(tot / ses.length)) : '—'], ['Most productive day', best?.h ? best.d : '—'], ['Most studied', top?.name.split(' ')[0] || '—'], ['Consistency', `${Math.round(active * 100 / n)}%`], ['Task completion', s.tasks.length ? `${Math.round(st.tasksDone * 100 / s.tasks.length)}%` : '—']]
  return <div><Head title="Analytics"><div className="flex gap-1">{[[7, '7 Days'], [30, '30 Days'], [90, '3 Months'], [0, 'All Time']].map(([v, l]) => <button key={v} onClick={() => setR(v)} className={`btn ${r === v ? 'bg-indigo-500 text-white' : 'btn-g'}`}>{l}</button>)}</div></Head>
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-3">{cards.map(([l, v]) => <div key={l} className="card"><p className="muted text-sm">{l}</p><p className="text-xl font-bold">{v}</p></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card"><h2 className="mb-3 font-semibold">Study hours {step > 1 && '(weekly)'}</h2><div className="h-60"><ResponsiveContainer><BarChart data={series}><CartesianGrid strokeDasharray="3 3" stroke="#8884" /><XAxis dataKey="d" fontSize={11} /><YAxis fontSize={11} width={28} /><Tooltip /><RBar dataKey="h" fill="#6366f1" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      <div className="card"><h2 className="mb-3 font-semibold">Trend</h2><div className="h-60"><ResponsiveContainer><LineChart data={series}><CartesianGrid strokeDasharray="3 3" stroke="#8884" /><XAxis dataKey="d" fontSize={11} /><YAxis fontSize={11} width={28} /><Tooltip /><Line dataKey="h" stroke="#8b5cf6" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></div>
      <div className="card"><h2 className="mb-3 font-semibold">By subject (hours)</h2><div className="h-60"><ResponsiveContainer><PieChart><Pie data={bySub} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>{bySub.map(x => <Cell key={x.name} fill={x.c} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div>
      <div className="card"><h2 className="mb-3 font-semibold">Subject progress</h2>{s.subjects.map(x => <div key={x.id} className="mb-2.5"><div className="mb-1 flex justify-between text-xs"><span>{x.name}</span><span className="muted">{st.sub(x.id).pct}%</span></div><Bar v={st.sub(x.id).pct} /></div>)}</div></div></div>
}

export function Achievements() {
  const { st, s } = useStore(), A = [['First Study Session', s.sessions.length, 1], ['7-Day Streak', st.longest, 7], ['30-Day Streak', st.longest, 30], ['50 Topics Completed', st.topicsDone, 50], ['100 Study Hours', Math.floor(st.totalMin / 60), 100], ['100 Problems Solved', st.problems, 100]]
  const into = st.xp % 500
  return <div><Head title="Achievements" sub={`${A.filter(([, v, t]) => v >= t).length}/${A.length} unlocked`} />
    <div className="card mb-5 flex flex-wrap items-center gap-6"><Ring v={into / 5} size={90} label={`Lv ${st.level}`} /><div className="grid flex-1 grid-cols-3 gap-3 text-center"><div><p className="text-xl font-bold">{st.xp}</p><p className="muted text-xs">XP</p></div><div><p className="text-xl font-bold">{st.streak}</p><p className="muted text-xs">Current streak</p></div><div><p className="text-xl font-bold">{st.longest}</p><p className="muted text-xs">Longest streak</p></div></div><p className="muted w-full text-xs">{500 - into} XP to level {st.level + 1}. Earn XP from study minutes, tasks (+20), topics (+50) and problems (+5).</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{A.map(([l, v, t]) => { const ok = v >= t; return <div key={l} className={`card ${ok ? '' : 'opacity-70'}`}><div className={`mb-2 grid h-11 w-11 place-items-center rounded-xl ${ok ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-500/10 muted'}`}>{ok ? <Medal /> : <Lock size={18} />}</div><p className="font-semibold">{l}</p><p className="muted mb-2 text-xs">{Math.min(v, t)}/{t}</p><Bar v={v / t * 100} color={ok ? 'bg-amber-400' : 'bg-indigo-500'} /></div> })}</div></div>
}
