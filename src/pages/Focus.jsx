import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, RotateCcw, SkipForward, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useStore, today, ymd, addDays, GAPS } from '../store.jsx'
import { Empty, Head, Ring, hm } from '../ui.jsx'

export function Focus() {
  const { s, a, timer: t, setTimer, st } = useStore(), name = id => s.subjects.find(x => x.id === id)?.name || '—'
  const mm = `${String(Math.floor(t.left / 60)).padStart(2, '0')}:${String(t.left % 60).padStart(2, '0')}`
  const reset = (mode = t.mode, min) => setTimer(x => { const total = (min ?? (mode === 'focus' ? s.settings.pomo : s.settings.brk)) * 60; return { ...x, mode, total, left: total, running: false } })
  const sess = s.sessions.filter(x => x.date === today())
  const topics = s.topics.filter(x => x.subjectId === t.subjectId)
  return <div><Head title="Focus Timer" sub="Sessions are recorded automatically" />
    <div className="grid gap-5 lg:grid-cols-2"><div className="card flex flex-col items-center gap-4">
      <span className="chip">{t.mode === 'focus' ? 'Focus' : 'Break'}</span><Ring v={(1 - t.left / t.total) * 100} size={220} label={<span className="text-5xl tabular-nums" aria-live="off">{mm}</span>} />
      <div className="flex flex-wrap justify-center gap-2">
        <button className="btn-p" onClick={() => setTimer(x => ({ ...x, running: !x.running }))}>{t.running ? <><Pause size={16} />Pause</> : <><Play size={16} />{t.left < t.total ? 'Resume' : 'Start'}</>}</button>
        <button className="btn-g" onClick={() => reset()}><RotateCcw size={16} />Reset</button>
        {t.mode === 'break' && <button className="btn-g" onClick={() => reset('focus')}><SkipForward size={16} />Skip break</button>}</div>
      <div className="grid w-full grid-cols-2 gap-2"><select aria-label="Subject" className="inp" disabled={t.running} value={t.subjectId} onChange={e => setTimer(x => ({ ...x, subjectId: e.target.value, topicId: '' }))}>{s.subjects.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select aria-label="Topic" className="inp" disabled={t.running} value={t.topicId} onChange={e => setTimer(x => ({ ...x, topicId: e.target.value }))}><option value="">No topic</option>{topics.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <label className="muted text-xs">Focus (min)<input type="number" min="1" max="180" className="inp" value={s.settings.pomo} onChange={e => { const v = Math.max(1, +e.target.value || 1); a.set({ pomo: v }); if (!t.running && t.mode === 'focus') reset('focus', v) }} /></label>
        <label className="muted text-xs">Break (min)<input type="number" min="1" max="60" className="inp" value={s.settings.brk} onChange={e => { const v = Math.max(1, +e.target.value || 1); a.set({ brk: v }); if (!t.running && t.mode === 'break') reset('break', v) }} /></label></div></div>
      <div className="card"><h2 className="mb-1 font-semibold">Today's sessions</h2><p className="muted mb-3 text-sm">{sess.length} sessions · {hm(st.todayMin)}</p>
        {sess.length ? sess.slice().reverse().map(x => <div key={x.id} className="flex justify-between border-b border-slate-200/10 py-2 text-sm"><span>{name(x.subjectId)}</span><span className="muted">{hm(x.minutes)}</span></div>) : <p className="muted text-sm">No sessions yet. Start one!</p>}</div></div></div>
}

export function Calendar() {
  const { s, st } = useStore(), [cur, setCur] = useState(() => { const d = new Date(); d.setDate(1); return d }), [sel, setSel] = useState(today())
  const first = (cur.getDay() + 6) % 7, n = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate(), t0 = today(), goal = s.settings.goal * 60
  const cells = [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => ymd(new Date(cur.getFullYear(), cur.getMonth(), i + 1)))]
  const earliest = s.sessions.map(x => x.date).sort()[0]
  const color = d => { const m = st.by[d] || 0; return m >= goal ? 'bg-emerald-500/80 text-white' : m > 0 ? 'bg-amber-400/80 text-black' : d < t0 && earliest && d >= earliest ? 'bg-red-500/60 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10' }
  const ss = s.sessions.filter(x => x.date === sel), tasks = s.tasks.filter(x => x.done && x.deadline === sel), nm = id => s.subjects.find(x => x.id === id)?.name
  return <div><Head title="Calendar" sub="Green: goal met · Yellow: partial · Red: missed" />
    <div className="grid gap-5 lg:grid-cols-3"><div className="card lg:col-span-2"><div className="mb-3 flex items-center justify-between"><button aria-label="Previous month" className="btn-g !p-1.5" onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth() - 1, 1))}><ChevronLeft size={16} /></button><b>{cur.toLocaleString('en', { month: 'long', year: 'numeric' })}</b><button aria-label="Next month" className="btn-g !p-1.5" onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth() + 1, 1))}><ChevronRight size={16} /></button></div>
      <div className="muted grid grid-cols-7 gap-1.5 text-center text-xs">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1.5">{cells.map((d, i) => d ? <button key={d} onClick={() => setSel(d)} className={`aspect-square rounded-xl text-sm font-medium transition ${color(d)} ${d === sel ? 'ring-2 ring-indigo-400' : ''}`}>{+d.slice(8)}</button> : <span key={i} />)}</div></div>
      <div className="card"><h2 className="font-semibold">{sel}</h2><p className="muted mb-3 text-sm">{hm(st.by[sel] || 0)} studied · {ss.length} sessions</p>
        <p className="mb-1 text-sm font-medium">Topics studied</p>{ss.length ? ss.map(x => <p key={x.id} className="muted text-sm">{nm(x.subjectId)} — {hm(x.minutes)}</p>) : <p className="muted text-sm">None</p>}
        <p className="mb-1 mt-3 text-sm font-medium">Completed tasks</p>{tasks.length ? tasks.map(x => <p key={x.id} className="muted text-sm">✓ {x.title}</p>) : <p className="muted text-sm">None</p>}</div></div></div>
}

export function Revision() {
  const { s, a, st, setTimer, toast } = useStore(), nav = useNavigate(), nm = id => s.subjects.find(x => x.id === id)?.name
  const due = [...st.due].sort((x, y) => x.confidence - y.confidence)
  return <div><Head title="Revision Due Today" sub={`Spaced schedule: ${GAPS.join(' → ')} days`} />
    {!due.length ? <Empty icon={RefreshCw} text="All caught up. No revisions due." /> : <div className="space-y-2">{due.map(t => <div key={t.id} className="card flex flex-wrap items-center gap-3 !p-4">
      <div className="min-w-[10rem] flex-1"><p className="font-medium">{t.name}</p><p className="muted text-xs">{nm(t.subjectId)} · last {t.last || '—'} · confidence {t.confidence}/5</p></div>
      <span className={`chip ${t.confidence <= 2 ? '!bg-red-500/15 text-red-400' : t.confidence <= 3 ? '!bg-amber-500/15 text-amber-500' : ''}`}>{t.confidence <= 2 ? 'High' : t.confidence <= 3 ? 'Medium' : 'Low'} priority</span>
      <button className="btn-g" onClick={() => { setTimer(x => ({ ...x, subjectId: t.subjectId, topicId: t.id })); nav('/timer') }}>Review now</button>
      <button className="btn-p" onClick={() => { a.revise(t.id); toast(`Revised. Next in ${GAPS[Math.min((t.stage || 0) + 1, 4)]} days`) }}>Mark revised</button>
      <button className="btn-g" onClick={() => { a.reschedule(t.id, 1); toast('Rescheduled to tomorrow') }}>Reschedule</button></div>)}</div>}</div>
}
