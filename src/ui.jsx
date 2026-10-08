import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export const Head = ({ title, sub, children }) => <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{sub && <p className="muted text-sm">{sub}</p>}</div><div className="flex flex-wrap gap-2">{children}</div></div>
export const Bar = ({ v, color = 'bg-indigo-500' }) => <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" role="progressbar" aria-valuenow={Math.round(v)}><div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(100, v)}%` }} /></div>
export const Ring = ({ v, size = 96, label }) => { const r = size / 2 - 8, c = 2 * Math.PI * r; return <div className="relative" style={{ width: size, height: size }}><svg width={size} height={size} className="-rotate-90"><circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="8" className="stroke-slate-200 dark:stroke-white/10" /><circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="8" strokeLinecap="round" stroke="#6366f1" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, v / 100))} style={{ transition: 'stroke-dashoffset .5s' }} /></svg><div className="absolute inset-0 grid place-items-center text-sm font-bold">{label ?? `${Math.round(v)}%`}</div></div> }
export const Empty = ({ icon: I, text, children }) => <div className="card grid place-items-center gap-2 py-12 text-center"><I className="muted" size={32} /><p className="muted text-sm">{text}</p>{children}</div>
export const Prio = ({ p }) => <span className={`chip ${p === 'High' ? '!bg-red-500/15 text-red-400' : p === 'Medium' ? '!bg-amber-500/15 text-amber-500' : '!bg-emerald-500/15 text-emerald-500'}`}>{p}</span>
export const hm = m => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? m % 60 + 'm' : ''}` : `${m}m`

export function Modal({ title, onClose, children }) {
  useEffect(() => { const f = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f) }, [])
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className="card max-h-[90vh] w-full max-w-md overflow-y-auto !bg-white dark:!bg-slate-900">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><button aria-label="Close" className="btn-g !p-1.5" onClick={onClose}><X size={16} /></button></div>{children}</div></div>
}

export function FormModal({ title, fields, init, onSave, onClose }) {
  const [v, setV] = useState(init), [err, setErr] = useState({})
  const submit = e => {
    e.preventDefault(); const er = {}
    fields.forEach(f => { if (f.req && !String(v[f.k] ?? '').trim()) er[f.k] = 'Required'; if (f.type === 'number' && v[f.k] !== '' && (+v[f.k] < (f.min ?? -1e9) || +v[f.k] > (f.max ?? 1e9))) er[f.k] = `Must be ${f.min ?? ''}–${f.max ?? ''}` })
    setErr(er); if (Object.keys(er).length) return
    const o = { ...v }; fields.forEach(f => { if (f.type === 'number') o[f.k] = +o[f.k] || 0 }); onSave(o); onClose()
  }
  const set = (k, val) => setV({ ...v, [k]: val })
  return <Modal title={title} onClose={onClose}><form onSubmit={submit} className="space-y-3" noValidate>
    {fields.map(f => <label key={f.k} className="block text-sm"><span className="muted mb-1 block">{f.label}{f.req && ' *'}</span>
      {f.options ? <select className="inp" value={v[f.k]} onChange={e => set(f.k, e.target.value)}>{f.options.map(o => { const [x, l] = Array.isArray(o) ? o : [o, o]; return <option key={x} value={x}>{l}</option> })}</select>
        : f.area ? <textarea className="inp" rows={3} value={v[f.k]} onChange={e => set(f.k, e.target.value)} />
          : <input className="inp" type={f.type || 'text'} min={f.min} max={f.max} value={v[f.k]} autoFocus={f === fields[0]} onChange={e => set(f.k, e.target.value)} aria-invalid={!!err[f.k]} />}
      {err[f.k] && <span className="text-xs text-red-400">{err[f.k]}</span>}</label>)}
    <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-g" onClick={onClose}>Cancel</button><button className="btn-p">Save</button></div></form></Modal>
}
