import { useState } from 'react'
import { Plus, Trash2, Wand2, Download, Briefcase } from 'lucide-react'
import { useStore, today } from '../store.jsx'
import { Bar, Empty, FormModal, Head } from '../ui.jsx'

const MAP = { DSA: 'dsa', JavaScript: 'js', React: 'react', 'Node.js': 'node', Backend: 'node', DBMS: 'dbms', 'System Design': 'sd' }
export function Interview() {
  const { s, a, st, toast } = useStore(), [m, setM] = useState(null), cats = Object.keys(s.interview)
  const bump = (c, k) => { a.patch({ interview: { ...s.interview, [c]: { ...s.interview[c], [k]: s.interview[c][k] + 1 } } }); toast(`${c}: ${k} problem logged`) }
  const tot = k => cats.reduce((n, c) => n + s.interview[c][k], 0)
  return <div><Head title="SDE Interview Prep" sub={`${st.problems} problems solved`}><button className="btn-p" onClick={() => setM({ topic: 'DSA', score: 7, date: today() })}><Plus size={16} />Log mock interview</button></Head>
    <div className="mb-5 grid grid-cols-3 gap-4">{[['easy', 'text-emerald-500'], ['medium', 'text-amber-500'], ['hard', 'text-red-400']].map(([k, c]) => <div key={k} className="card text-center"><p className={`text-2xl font-bold ${c}`}>{tot(k)}</p><p className="muted text-sm capitalize">{k}</p></div>)}</div>
    <div className="grid gap-4 md:grid-cols-2">{cats.map(c => { const sid = MAP[c], d = sid ? st.sub(sid) : { pct: 0 }, pr = s.interview[c], due = s.topics.filter(t => t.subjectId === sid && st.due.includes(t)).length; return <div key={c} className="card">
      <div className="mb-2 flex justify-between"><b>{c}</b><span className="font-bold text-indigo-400">{d.pct}%</span></div><Bar v={d.pct} /><p className="muted my-2 text-xs">Revision: {due ? `${due} due` : 'up to date'}</p>
      <div className="flex gap-2">{['easy', 'medium', 'hard'].map(k => <button key={k} className="btn-g flex-1 !px-1 text-xs" onClick={() => bump(c, k)}>+ {k} <span className="muted">({pr[k]})</span></button>)}</div></div> })}</div>
    <h2 className="mb-2 mt-6 font-semibold">Mock interviews</h2>{s.mocks.length ? s.mocks.map(x => <div key={x.id} className="card mb-2 flex items-center justify-between !p-3 text-sm"><span>{x.date} · {x.topic}</span><span className="flex items-center gap-3"><b>{x.score}/10</b><button aria-label="Delete" className="btn-g !p-1.5" onClick={() => a.del('mocks', x.id)}><Trash2 size={14} /></button></span></div>) : <Empty icon={Briefcase} text="No mock interviews logged." />}
    {m && <FormModal title="Log mock interview" init={m} onClose={() => setM(null)} onSave={v => { a.add('mocks', v); toast('Mock logged') }} fields={[{ k: 'topic', label: 'Category', options: cats }, { k: 'score', label: 'Score (1–10)', type: 'number', min: 1, max: 10 }, { k: 'date', label: 'Date', type: 'date' }]} />}</div>
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export function Planner() {
  const { s, a, toast } = useStore(), [f, setF] = useState({ goal: 'SDE interview prep', date: '', hours: 3, level: 'Intermediate', subs: s.subjects.slice(0, 4).map(x => x.id), prio: '' }), [err, setErr] = useState('')
  const nm = id => s.subjects.find(x => x.id === id)?.name || id
  const gen = e => {
    e.preventDefault(); if (!f.subs.length) return setErr('Pick at least one subject'); if (+f.hours < 1 || +f.hours > 16) return setErr('Hours must be 1–16'); setErr('')
    const pool = f.prio && f.subs.includes(f.prio) ? [...f.subs, f.prio] : f.subs, slots = Math.round(+f.hours), plan = []; let k = 0
    DAYS.forEach((day, di) => { for (let i = 0; i < slots; i++) { const last = di % 7 === 6 && i === slots - 1; plan.push({ id: day + i, day, subject: last ? 'Revision' : nm(pool[k++ % pool.length]), hours: 1 }) } })
    a.patch({ plan }); toast('Plan generated. Edit freely below.')
  }
  const upd = (id, o) => a.patch({ plan: s.plan.map(x => x.id === id ? { ...x, ...o } : x) })
  return <div><Head title="Smart Study Planner" sub="Generate a weekly plan, then tweak it" />
    <form onSubmit={gen} className="card mb-5 grid gap-3 sm:grid-cols-2" noValidate>
      <label className="text-sm">Goal<input className="inp" value={f.goal} onChange={e => setF({ ...f, goal: e.target.value })} /></label>
      <label className="text-sm">Exam / interview date<input type="date" className="inp" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></label>
      <label className="text-sm">Hours per day<input type="number" className="inp" value={f.hours} onChange={e => setF({ ...f, hours: e.target.value })} /></label>
      <label className="text-sm">Skill level<select className="inp" value={f.level} onChange={e => setF({ ...f, level: e.target.value })}>{['Beginner', 'Intermediate', 'Advanced'].map(x => <option key={x}>{x}</option>)}</select></label>
      <fieldset className="text-sm sm:col-span-2"><legend className="mb-1">Subjects</legend><div className="flex flex-wrap gap-2">{s.subjects.map(x => <label key={x.id} className="chip flex items-center gap-1.5"><input type="checkbox" checked={f.subs.includes(x.id)} onChange={() => setF({ ...f, subs: f.subs.includes(x.id) ? f.subs.filter(i => i !== x.id) : [...f.subs, x.id] })} />{x.name}</label>)}</div></fieldset>
      <label className="text-sm">Priority subject<select className="inp" value={f.prio} onChange={e => setF({ ...f, prio: e.target.value })}><option value="">None</option>{s.subjects.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <div className="flex items-end gap-3"><button className="btn-p"><Wand2 size={16} />Generate plan</button>{err && <span className="text-xs text-red-400">{err}</span>}</div></form>
    {!s.plan.length ? <Empty icon={Wand2} text="No plan yet. Fill in the form above." /> : <div className="grid gap-4 md:grid-cols-2">{DAYS.map(d => <div key={d} className="card"><h3 className="mb-2 font-semibold">{d}</h3>{s.plan.filter(x => x.day === d).map(x => <div key={x.id} className="mb-2 flex items-center gap-2"><input aria-label="Item" className="inp" value={x.subject} onChange={e => upd(x.id, { subject: e.target.value })} /><input aria-label="Hours" type="number" min="0.5" step="0.5" className="inp !w-20" value={x.hours} onChange={e => upd(x.id, { hours: +e.target.value })} /><button aria-label="Remove" className="btn-g !p-1.5" onClick={() => a.patch({ plan: s.plan.filter(y => y.id !== x.id) })}><Trash2 size={14} /></button></div>)}
      <button className="btn-g text-xs" type="button" onClick={() => a.patch({ plan: [...s.plan, { id: d + Date.now(), day: d, subject: 'New item', hours: 1 }] })}><Plus size={14} />Add</button></div>)}</div>}</div>
}

export function Settings() {
  const { s, a, toast, confirm } = useStore()
  const exp = () => { const u = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })), l = document.createElement('a'); l.href = u; l.download = 'studyflow-data.json'; l.click(); URL.revokeObjectURL(u); toast('Data exported') }
  const T = ({ k, l }) => <label className="flex items-center justify-between py-2 text-sm">{l}<input type="checkbox" className="h-5 w-5 accent-indigo-500" checked={s.settings[k]} onChange={e => a.set({ [k]: e.target.checked })} /></label>
  return <div className="max-w-xl"><Head title="Settings" />
    <div className="card mb-4 space-y-3"><h2 className="font-semibold">Profile</h2><label className="block text-sm">Name<input className="inp" value={s.settings.name} onChange={e => a.set({ name: e.target.value })} /></label>
      <label className="block text-sm">Daily study goal (hours)<input type="number" min="1" max="16" className="inp" value={s.settings.goal} onChange={e => a.set({ goal: Math.max(1, +e.target.value || 1) })} /></label>
      <label className="block text-sm">Default Pomodoro (minutes)<input type="number" min="1" max="180" className="inp" value={s.settings.pomo} onChange={e => a.set({ pomo: Math.max(1, +e.target.value || 1) })} /></label></div>
    <div className="card mb-4"><h2 className="font-semibold">Preferences</h2><T k="dark" l="Dark mode" /><T k="notify" l="Notifications (revisions & overdue tasks)" /></div>
    <div className="card flex flex-wrap gap-2"><button className="btn-g" onClick={exp}><Download size={16} />Export data</button>
      <button className="btn-g" onClick={() => confirm('Restore the original sample data? Your changes will be lost.', () => { a.reset(); toast('Sample data restored') })}>Restore sample data</button>
      <button className="btn-p !bg-red-500 hover:!bg-red-400" onClick={() => confirm('Erase ALL data permanently?', () => { a.wipe(); toast('All data erased') })}>Reset data</button></div></div>
}
