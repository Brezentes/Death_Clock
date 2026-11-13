import { useEffect, useState, type FormEvent } from 'react';

type Plan = { birthDate: string; planningAge: number; target: string };
const KEY = 'death-clock.plan.v1';
function readPlan(): Plan | null {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return p && typeof p.birthDate === 'string' && Number.isInteger(p.planningAge) && p.planningAge > 0 && p.planningAge <= 120 && Number.isFinite(Date.parse(p.target)) && Number.isFinite(Date.parse(p.birthDate)) && Date.parse(p.target) > Date.parse(p.birthDate) ? p : null;
  } catch { return null; }
}
export default function App() {
  const [plan, setPlan] = useState<Plan | null>(readPlan);
  const [birthDate, setBirthDate] = useState(plan?.birthDate ?? '');
  const [planningAge, setPlanningAge] = useState(plan?.planningAge ?? 80);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const remaining = plan ? Math.max(0, Math.floor((Date.parse(plan.target) - now) / 1000)) : 0;
  const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
  const progress = plan ? Math.max(0, Math.min(100, (now - Date.parse(plan.birthDate)) / (Date.parse(plan.target) - Date.parse(plan.birthDate)) * 100)) : 0;
  async function save(event: FormEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const submittedBirthDate = String(form.get('birthDate') ?? '');
    const submittedAge = Number(form.get('planningAge'));
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ birth_date: submittedBirthDate, planning_age: submittedAge }), signal: AbortSignal.timeout(10000) });
      if (!response.ok) {
        if (response.status === 422) throw new Error('Check your birth date and choose a planning age with a birthday in the future.');
        throw new Error('The server could not save your plan. Please try again.');
      }
      const data = await response.json();
      if (!Number.isFinite(Date.parse(data.target_date))) throw new Error('The server returned an invalid date. Please try again.');
      const next = { birthDate: submittedBirthDate, planningAge: submittedAge, target: data.target_date };
      setBirthDate(submittedBirthDate); setPlanningAge(submittedAge);
      setPlan(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); setMessage('Your plan is saved on this browser.'); }
      catch { setMessage('Your clock is running, but browser storage is unavailable.'); }
    } catch (error) { setMessage(error instanceof Error && error.name === 'Error' ? error.message : 'Cannot reach the backend. Make sure FastAPI is running, then try again.'); }
    finally { setBusy(false); }
  }
  function reset() {
    try { localStorage.removeItem(KEY); }
    catch { setMessage('Could not clear browser storage. Please clear site data in your browser.'); return; }
    setPlan(null); setBirthDate(''); setPlanningAge(80); setMessage('Your saved plan has been cleared.');
  }
  return <div className="shell">
    <header><a className="brand" href="#"><span className="mark">◷</span> DEATH CLOCK</a><span className="edition">A LITTLE PERSPECTIVE, EVERY DAY</span><span className="version">EARLY ACCESS · 01</span></header>
    <main>
      <div className="intro"><p className="eyebrow">MEMENTO VIVERE — REMEMBER TO LIVE</p><h1>Your time.<br/><em>Make it matter.</em></h1><p>A little perspective on the days ahead.<br/>A reminder to be here for the one you have.</p></div>
      <section className="clock" aria-labelledby="clock-title"><div className="card-top"><h2 id="clock-title">YOUR TIME HORIZON</h2><span className="badge"><i/> {plan ? 'LIVE COUNTDOWN' : 'READY WHEN YOU ARE'}</span></div>
        {plan ? <><div className="digits" aria-label="Time remaining to your planning date">{values.map((value, index) => <div key={index}><strong>{value.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</strong><span>{['DAYS', 'HOURS', 'MINUTES', 'SECONDS'][index]}</span></div>)}</div><p className="clock-note">{remaining === 0 ? 'You have reached your planning horizon. Set a new one below.' : `Until your ${plan.planningAge}-year planning horizon · ${new Date(plan.target).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`}</p></> : <div className="empty"><span>Every day is a beginning.</span><p>Set your personal horizon below to start your clock.</p></div>}
        <div className="timeline"><div><span>YOUR JOURNEY</span><span>{plan ? `${progress.toFixed(1)}% of your selected horizon` : 'A perspective, not a prediction'}</span></div><div className="track"><div style={{ width: `${progress}%` }}/></div><div><span>BIRTH</span><span>{plan ? `AGE ${plan.planningAge}` : 'YOUR HORIZON'}</span></div></div>
      </section>
      <div className="lower"><section className="settings"><p className="eyebrow">01 / SET YOUR HORIZON</p><h2>Start with a little perspective.</h2><p>Choose an age to plan toward. You can change it anytime.</p><form onSubmit={save}><div className="fields"><label>Date of birth<input name="birthDate" type="date" required value={birthDate} max={new Date().toISOString().slice(0,10)} onInput={e => setBirthDate(e.currentTarget.value)}/></label><label>Planning age<input name="planningAge" type="number" min="1" max="120" step="1" required value={planningAge} onInput={e => setPlanningAge(Number(e.currentTarget.value))}/></label></div><div className="actions"><button disabled={busy}>{busy ? 'Setting your clock…' : plan ? 'Update my clock ↗' : 'Start my clock ↗'}</button>{plan && <button className="text-button" type="button" onClick={reset} disabled={busy}>Clear my data</button>}</div><p className="status" role="status">{message}</p></form></section>
      <aside><span className="sun">✳</span><h2>Less counting.<br/>More living.</h2><p>Call someone you miss. Step outside. Start the thing you keep putting off.</p><div className="aside-foot">TODAY IS A GOOD DAY TO BEGIN.</div></aside></div>
      <footer><span>Made for a more intentional life.</span><p>This is a personal planning tool, not a prediction of your lifespan. Your birth date is sent to the local backend for calculation; your plan is stored only in this browser.</p></footer>
    </main>
  </div>;
}
