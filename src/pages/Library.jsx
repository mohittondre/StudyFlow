import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, BookOpen, ListChecks, Brain } from 'lucide-react'
import { useStore, today, STATUS, PRIO } from '../store.jsx'
import { Bar, Empty, FormModal, Head, Prio, hm } from '../ui.jsx'

const DIFF = ['Easy', 'Medium', 'Hard']
export function Subjects() {
  const { s, a, st, toast, confirm } = useStore(), nav = useNavigate(), [m, setM] = useState(null)
  const F = [{ k: 'name', label: 'Name', req: 1 }, { k: 'icon', label: 'Icon (emoji)' }, { k: 'difficulty', label: 'Difficulty', options: DIFF }]
  return <div><Head title="Subjects" sub={`${s.subjects.length} subjects`}><button className="btn-p" onClick={() => setM({ name: '', icon: '📘', difficulty: 'Medium' })}><Plus size={16} />Add subject</button></Head>
    {!s.subjects.length ? <Empty icon={BookOpen} text="No subjects yet." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{s.subjects.map(x => { const d = st.sub(x.id); return <div key={x.id} className="card hover:-translate-y-0.5">
      <div className="flex items-start justify-between"><div className="text-3xl">{x.icon}</div><div className="flex gap-1"><button aria-label="Edit" className="btn-g !p-1.5" onClick={() => setM(x)}><Pencil size={14} /></button><button aria-label="Delete" className="btn-g !p-1.5" onClick={() => confirm(`Delete "${x.name}" and its topics/tasks?`, () => { a.del('subjects', x.id); toast('Subject deleted') })}><Trash2 size={14} /></button></div></div>
      <h3 className="mt-2 font-semibold">{x.name}</h3><div className="my-3"><Bar v={d.pct} /></div>
      <div className="muted grid grid-cols-2 gap-1 text-xs"><span>{d.pct}% complete</span><span>{d.done}/{d.total} topics</span><span>{d.hours}h studied</span><span>{x.difficulty}</span><span className="col-span-2">Last studied: {d.last || 'never'}</span></div>
      <button className="btn-g mt-3 w-full" onClick={() => nav(`/topics?subject=${x.id}`)}>View topics</button></div> })}</div>}
    {m && <FormModal title={m.id ? 'Edit subject' : 'New subject'} fields={F} init={m} onClose={() => setM(null)} onSave={v => { m.id ? a.upd('subjects', m.id, v) : a.add('subjects', v); toast('Subject saved') }} />}</div>
}

export function Topics() {
  const { s, a, toast, confirm } = useStore(), [p, setP] = useSearchParams(), [f, setF] = useState('All'), [m, setM] = useState(null)
  const sid = p.get('subject') || '', t0 = today(), name = id => s.subjects.find(x => x.id === id)?.name || '—'
  const list = s.topics.filter(t => (!sid || t.subjectId === sid) && (f === 'All' || (f === 'Revision Due' ? t.next && t.next <= t0 && t.status !== 'Not Started' : t.status === f)))
  const F = [{ k: 'name', label: 'Topic', req: 1 }, { k: 'subjectId', label: 'Subject', options: s.subjects.map(x => [x.id, x.name]) }, { k: 'status', label: 'Status', options: STATUS }, { k: 'difficulty', label: 'Difficulty', options: DIFF }, { k: 'confidence', label: 'Confidence (1–5)', type: 'number', min: 1, max: 5 }, { k: 'minutes', label: 'Study time (min)', type: 'number', min: 0 }, { k: 'last', label: 'Last studied', type: 'date' }, { k: 'next', label: 'Next revision', type: 'date' }, { k: 'notes', label: 'Notes', area: 1 }, { k: 'resources', label: 'Resources (links)', area: 1 }]
  return <div><Head title="Topics" sub="Track every topic, confidence and revision date"><button className="btn-p" disabled={!s.subjects.length} onClick={() => setM({ name: '', subjectId: sid || s.subjects[0]?.id, status: 'Not Started', difficulty: 'Medium', confidence: 1, minutes: 0, last: '', next: '', notes: '', resources: '', stage: 0 })}><Plus size={16} />Add topic</button></Head>
    <div className="mb-4 flex flex-wrap gap-2">{['All', ...STATUS, 'Revision Due'].map(x => <button key={x} onClick={() => setF(x)} className={`btn ${f === x ? 'bg-indigo-500 text-white' : 'btn-g'}`}>{x}</button>)}
      <select aria-label="Subject" className="inp !w-auto" value={sid} onChange={e => setP(e.target.value ? { subject: e.target.value } : {})}><option value="">All subjects</option>{s.subjects.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
    {!list.length ? <Empty icon={Brain} text="No topics match." /> : <div className="space-y-2">{list.map(t => <div key={t.id} className="card flex flex-wrap items-center gap-3 !p-4">
      <div className="min-w-[10rem] flex-1"><p className="font-medium">{t.name}</p><p className="muted text-xs">{name(t.subjectId)} · {t.difficulty} · {hm(t.minutes)} · last {t.last || '—'} · next {t.next || '—'}</p></div>
      <span className="chip" title="Confidence">{'★'.repeat(t.confidence)}{'☆'.repeat(5 - t.confidence)}</span>
      <select aria-label="Status" className="inp !w-auto" value={t.status} onChange={e => a.upd('topics', t.id, { status: e.target.value })}>{STATUS.map(x => <option key={x}>{x}</option>)}</select>
      <button aria-label="Edit" className="btn-g !p-1.5" onClick={() => setM(t)}><Pencil size={14} /></button><button aria-label="Delete" className="btn-g !p-1.5" onClick={() => confirm(`Delete "${t.name}"?`, () => { a.del('topics', t.id); toast('Topic deleted') })}><Trash2 size={14} /></button></div>)}</div>}
    {m && <FormModal title={m.id ? 'Edit topic' : 'New topic'} fields={F} init={m} onClose={() => setM(null)} onSave={v => { m.id ? a.upd('topics', m.id, v) : a.add('topics', v); toast('Topic saved') }} />}</div>
}

export function Tasks() {
  const { s, a, toast, confirm } = useStore(), [p] = useSearchParams(), [q, setQ] = useState(p.get('q') || ''), [fs, setFs] = useState(''), [fp, setFp] = useState(''), [fst, setFst] = useState(''), [sort, setSort] = useState('deadline'), [m, setM] = useState(null)
  useEffect(() => setQ(p.get('q') || ''), [p])
  const name = id => s.subjects.find(x => x.id === id)?.name || '—'
  const list = s.tasks.filter(t => (!q || (t.title + t.desc).toLowerCase().includes(q.toLowerCase())) && (!fs || t.subjectId === fs) && (!fp || t.priority === fp) && (!fst || (fst === 'Done' ? t.done : !t.done)))
    .sort((x, y) => sort === 'priority' ? PRIO[x.priority] - PRIO[y.priority] : (x.deadline || '9').localeCompare(y.deadline || '9'))
  const F = [{ k: 'title', label: 'Title', req: 1 }, { k: 'desc', label: 'Description', area: 1 }, { k: 'subjectId', label: 'Subject', options: s.subjects.map(x => [x.id, x.name]) }, { k: 'topicId', label: 'Topic', options: [['', 'None'], ...s.topics.map(t => [t.id, `${name(t.subjectId)} · ${t.name}`])] }, { k: 'priority', label: 'Priority', options: Object.keys(PRIO) }, { k: 'deadline', label: 'Deadline', type: 'date' }, { k: 'est', label: 'Estimated minutes', type: 'number', min: 1, max: 600 }]
  return <div><Head title="Tasks" sub={`${s.tasks.filter(t => !t.done).length} open`}><button className="btn-p" disabled={!s.subjects.length} onClick={() => setM({ title: '', desc: '', subjectId: s.subjects[0]?.id, topicId: '', priority: 'Medium', deadline: today(), est: 30, done: false })}><Plus size={16} />Add task</button></Head>
    <div className="mb-4 grid gap-2 sm:grid-cols-5"><input className="inp sm:col-span-2" aria-label="Search" placeholder="Search tasks…" value={q} onChange={e => setQ(e.target.value)} />
      <select className="inp" aria-label="Subject" value={fs} onChange={e => setFs(e.target.value)}><option value="">All subjects</option>{s.subjects.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      <select className="inp" aria-label="Priority" value={fp} onChange={e => setFp(e.target.value)}><option value="">Any priority</option>{Object.keys(PRIO).map(x => <option key={x}>{x}</option>)}</select>
      <select className="inp" aria-label="Status" value={fst} onChange={e => setFst(e.target.value)}><option value="">Any status</option><option>Open</option><option>Done</option></select>
      <select className="inp sm:col-span-5 sm:w-48" aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)}><option value="deadline">Sort: deadline</option><option value="priority">Sort: priority</option></select></div>
    {!list.length ? <Empty icon={ListChecks} text="No tasks found." /> : <div className="space-y-2">{list.map(t => <div key={t.id} className="card flex items-center gap-3 !p-4">
      <input type="checkbox" aria-label="Complete" className="h-4 w-4 accent-indigo-500" checked={t.done} onChange={() => { a.upd('tasks', t.id, { done: !t.done }); !t.done && toast('Task completed ✓') }} />
      <div className="flex-1"><p className={`font-medium ${t.done ? 'muted line-through' : ''}`}>{t.title}</p><p className="muted text-xs">{name(t.subjectId)} · {t.deadline || 'no deadline'} · {hm(t.est)}</p></div><Prio p={t.priority} />
      <button aria-label="Edit" className="btn-g !p-1.5" onClick={() => setM(t)}><Pencil size={14} /></button><button aria-label="Delete" className="btn-g !p-1.5" onClick={() => confirm(`Delete "${t.title}"?`, () => { a.del('tasks', t.id); toast('Task deleted') })}><Trash2 size={14} /></button></div>)}</div>}
    {m && <FormModal title={m.id ? 'Edit task' : 'New task'} fields={F} init={m} onClose={() => setM(null)} onSave={v => { m.id ? a.upd('tasks', m.id, v) : a.add('tasks', v); toast('Task saved') }} />}</div>
}
