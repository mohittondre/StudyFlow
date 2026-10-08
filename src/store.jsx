import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
const Ctx = createContext()
export const useStore = () => useContext(Ctx)
export const uid = () => Math.random().toString(36).slice(2, 9)
const P = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T00:00') : new Date(d)
export const ymd = d => { const x = P(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}` }
export const addDays = (d, n) => { const x = P(d); x.setDate(x.getDate() + n); return ymd(x) }
export const today = () => ymd(new Date())
export const GAPS = [1, 3, 7, 14, 30]
export const PRIO = { High: 0, Medium: 1, Low: 2 }
export const STATUS = ['Not Started', 'In Progress', 'Completed', 'Needs Revision']
const KEY = 'studyflow-v1'

function seed() {
  const subs = [['dsa', 'Data Structures & Algorithms', '🧮', 'Hard'], ['js', 'JavaScript', '🟨', 'Medium'], ['react', 'React', '⚛️', 'Medium'], ['node', 'Node.js', '🟢', 'Medium'], ['sd', 'System Design', '🏗️', 'Hard'], ['dbms', 'DBMS', '🗄️', 'Medium'], ['apt', 'Aptitude', '🔢', 'Easy']]
  const tp = { dsa: ['Arrays', 'Binary Search', 'Linked Lists', 'Trees', 'Dynamic Programming'], js: ['Closures', 'Promises & Async', 'Prototypes'], react: ['Hooks', 'State Management', 'Performance'], node: ['Event Loop', 'Express Middleware'], sd: ['Load Balancing', 'Caching'], dbms: ['Normalization', 'Transactions'], apt: ['Percentages', 'Probability'] }
  const st = ['Completed', 'Completed', 'In Progress', 'Needs Revision', 'Not Started']
  let i = 0; const topics = []
  for (const [sid] of subs) for (const name of tp[sid]) {
    const status = st[i % 5], started = status !== 'Not Started'
    topics.push({ id: 't' + i, subjectId: sid, name, status, difficulty: ['Easy', 'Medium', 'Hard'][i % 3], confidence: started ? 2 + (i % 4) : 1, notes: '', resources: '', minutes: started ? 30 + (i * 17) % 90 : 0, last: started ? addDays(today(), -(i % 9)) : '', next: started ? addDays(today(), (i % 4) - 1) : '', stage: i % 3 }); i++
  }
  const sessions = []
  for (let d = 0; d < 60; d++) { if (d % 7 === 4 || d % 11 === 6) continue; const sid = subs[(d * 3) % 7][0]; const ts = topics.filter(t => t.subjectId === sid); sessions.push({ id: 's' + d, date: addDays(today(), -d), minutes: 50 + ((d * 37) % 150), subjectId: sid, topicId: ts[0].id }) }
  const t = today()
  return {
    subjects: subs.map(([id, name, icon, difficulty]) => ({ id, name, icon, difficulty })), topics, sessions,
    tasks: [['Learn Binary Search', 'dsa', 't1', 'High', 45], ['Practice 5 DSA problems', 'dsa', 't0', 'High', 90], ['Revise JavaScript Closures', 'js', 't5', 'Medium', 30], ['Study React Hooks', 'react', 't8', 'Medium', 60], ['Read about caching strategies', 'sd', 't13', 'Low', 40], ['Aptitude: percentages set', 'apt', 't16', 'Low', 25]].map(([title, subjectId, topicId, priority, est], k) => ({ id: 'k' + k, title, desc: '', subjectId, topicId, priority, est, deadline: addDays(t, k < 4 ? 0 : k - 3), done: k === 2 })),
    goals: [{ id: 'g1', title: 'Study 4 hours', type: 'Daily', target: 4, current: 2, unit: 'hours' }, { id: 'g2', title: 'Complete 10 DSA problems', type: 'Weekly', target: 10, current: 6, unit: 'problems' }, { id: 'g3', title: 'Finish JavaScript', type: 'Monthly', target: 3, current: 1, unit: 'topics' }, { id: 'g4', title: 'Prepare for SDE interviews', type: 'Long-term', target: 100, current: 58, unit: '%' }],
    interview: { DSA: { easy: 40, medium: 28, hard: 6 }, JavaScript: { easy: 12, medium: 8, hard: 1 }, React: { easy: 6, medium: 5, hard: 0 }, 'Node.js': { easy: 4, medium: 2, hard: 0 }, Backend: { easy: 3, medium: 2, hard: 0 }, DBMS: { easy: 8, medium: 4, hard: 1 }, 'System Design': { easy: 1, medium: 2, hard: 0 } },
    mocks: [{ id: 'm1', date: addDays(t, -10), topic: 'DSA', score: 7 }, { id: 'm2', date: addDays(t, -3), topic: 'React', score: 8 }],
    plan: [], settings: { name: 'Mohit', dark: true, goal: 4, pomo: 25, brk: 5, notify: true }
  }
}
function load() { try { const r = JSON.parse(localStorage.getItem(KEY)); if (r?.subjects) return r } catch { } return seed() }

export function Provider({ children }) {
  const [s, setS] = useState(load)
  const [toasts, setToasts] = useState([]); const [dlg, setDlg] = useState(null)
  const [timer, setTimer] = useState({ mode: 'focus', total: s.settings.pomo * 60, left: s.settings.pomo * 60, running: false, subjectId: s.subjects[0]?.id || '', topicId: '' })
  const ref = useRef(s); ref.current = s
  const tref = useRef(timer); tref.current = timer
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(s)) }, [s])
  useEffect(() => { document.documentElement.classList.toggle('dark', s.settings.dark) }, [s.settings.dark])
  const toast = (msg, type = 'ok') => { const id = uid(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000) }
  const confirm = (msg, fn) => setDlg({ msg, fn })

  const a = {
    add: (k, o) => setS(p => ({ ...p, [k]: [...p[k], { ...o, id: uid() }] })),
    upd: (k, id, o) => setS(p => ({ ...p, [k]: p[k].map(x => x.id === id ? { ...x, ...o } : x) })),
    del: (k, id) => setS(p => { const n = { ...p, [k]: p[k].filter(x => x.id !== id) }; if (k === 'subjects') { n.topics = p.topics.filter(t => t.subjectId !== id); n.tasks = p.tasks.filter(t => t.subjectId !== id) } return n }),
    set: o => setS(p => ({ ...p, settings: { ...p.settings, ...o } })),
    patch: o => setS(p => ({ ...p, ...o })),
    revise: id => setS(p => ({ ...p, topics: p.topics.map(t => { if (t.id !== id) return t; const stage = Math.min((t.stage || 0) + 1, 4); return { ...t, stage, status: 'Completed', last: today(), next: addDays(today(), GAPS[stage]) } }) })),
    reschedule: (id, n) => setS(p => ({ ...p, topics: p.topics.map(t => t.id === id ? { ...t, next: addDays(today(), n) } : t) })),
    reset: () => { localStorage.removeItem(KEY); setS(seed()) },
    wipe: () => setS(p => ({ ...p, sessions: [], tasks: [], topics: [], subjects: [], goals: [], mocks: [], plan: [], interview: Object.fromEntries(Object.keys(p.interview).map(k => [k, { easy: 0, medium: 0, hard: 0 }])) }))
  }

  // Timer: record session on completion
  useEffect(() => { if (!timer.running) return; const end = Date.now() + tref.current.left * 1000; const i = setInterval(() => setTimer(x => ({ ...x, left: Math.max(0, Math.ceil((end - Date.now()) / 1000)) })), 250); return () => clearInterval(i) }, [timer.running])
  // Apply changed default durations to an idle timer
  useEffect(() => { setTimer(x => x.running || x.left !== x.total ? x : { ...x, total: (x.mode === 'focus' ? s.settings.pomo : s.settings.brk) * 60, left: (x.mode === 'focus' ? s.settings.pomo : s.settings.brk) * 60 }) }, [s.settings.pomo, s.settings.brk])
  useEffect(() => {
    if (!timer.running || timer.left > 0) return
    const { settings: cfg } = ref.current
    if (timer.mode === 'focus') {
      const minutes = Math.max(1, Math.round(timer.total / 60))
      setS(p => ({ ...p, sessions: [...p.sessions, { id: uid(), date: today(), minutes, subjectId: timer.subjectId, topicId: timer.topicId }], topics: p.topics.map(t => t.id === timer.topicId ? { ...t, minutes: t.minutes + minutes, last: today(), status: t.status === 'Not Started' ? 'In Progress' : t.status, next: t.next || addDays(today(), 1) } : t) }))
      toast(`Session complete: ${minutes} min recorded 🎉`); setTimer(x => ({ ...x, mode: 'break', total: cfg.brk * 60, left: cfg.brk * 60, running: false }))
    } else { toast('Break over. Ready to focus?'); setTimer(x => ({ ...x, mode: 'focus', total: cfg.pomo * 60, left: cfg.pomo * 60, running: false })) }
  }, [timer.left, timer.running])

  const st = useMemo(() => {
    const t0 = today(), by = {}; s.sessions.forEach(x => by[x.date] = (by[x.date] || 0) + x.minutes)
    const days = Object.keys(by).filter(d => by[d] > 0).sort()
    let longest = 0, run = 0, prev = null
    days.forEach(d => { run = prev && addDays(prev, 1) === d ? run + 1 : 1; longest = Math.max(longest, run); prev = d })
    let streak = 0, c = by[t0] ? t0 : addDays(t0, -1); while (by[c]) { streak++; c = addDays(c, -1) }
    const dow = (new Date().getDay() + 6) % 7, mon = addDays(t0, -dow)
    const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ d, h: +((by[addDays(mon, i)] || 0) / 60).toFixed(1) }))
    const totalMin = s.sessions.reduce((n, x) => n + x.minutes, 0), tasksDone = s.tasks.filter(t => t.done).length, topicsDone = s.topics.filter(t => t.status === 'Completed').length
    const problems = Object.values(s.interview).reduce((n, c) => n + c.easy + c.medium + c.hard, 0)
    const xp = Math.round(totalMin + tasksDone * 20 + topicsDone * 50 + problems * 5)
    const due = s.topics.filter(t => t.next && t.next <= t0 && t.status !== 'Not Started')
    const sub = id => { const ts = s.topics.filter(t => t.subjectId === id), done = ts.filter(t => t.status === 'Completed').length, ss = s.sessions.filter(x => x.subjectId === id); return { total: ts.length, done, pct: ts.length ? Math.round(done * 100 / ts.length) : 0, hours: +(ss.reduce((n, x) => n + x.minutes, 0) / 60).toFixed(1), last: ss.map(x => x.date).sort().pop() } }
    return { by, todayMin: by[t0] || 0, weekMin: week.reduce((n, x) => n + x.h * 60, 0), week, streak, longest, totalMin, tasksDone, topicsDone, problems, xp, level: Math.floor(xp / 500) + 1, due, sub }
  }, [s])

  return <Ctx.Provider value={{ s, a, st, toast, toasts, confirm, dlg, setDlg, timer, setTimer }}>{children}</Ctx.Provider>
}
