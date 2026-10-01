import React, { useEffect, useMemo, useState } from 'react';
import {
  Radio, Clock, CheckSquare, Square, ShoppingCart, AlertCircle, AlertTriangle,
  Phone, ChevronRight, Volume2, FileWarning, FileSignature, CalendarClock, CheckCircle2, KeyRound
} from 'lucide-react';
import { STAGES } from '../lib/initialData';
import { FESTIVAL } from '../lib/config';
import { getFestivalClock, parseRange, sortByTime, formatClock, formatDuration, findOverlaps } from '../lib/time';
import { findArtist, hasRider, isContractSigned, telHref } from '../lib/artists';
import { isPermitOpen } from './PermitsView';

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function StageCard({ stage, items, live, minutes, artists }) {
  const withRange = items.map(item => ({ item, range: parseRange(item.time) })).filter(x => x.range);
  const isParallel = stage.id === 'street_points';

  if (withRange.length === 0) {
    return (
      <div className="dash-stage">
        <div className="dash-stage-name">{stage.name}</div>
        <div className="dash-muted">Nincs műsor ezen a napon.</div>
      </div>
    );
  }

  if (!live) {
    const first = withRange[0];
    const last = withRange[withRange.length - 1];
    return (
      <div className="dash-stage">
        <div className="dash-stage-name">{stage.name}</div>
        <div className="dash-row">
          <span className="dash-time">{formatClock(first.range.start)}–{formatClock(last.range.end)}</span>
          <span className="dash-muted">{withRange.length} műsor</span>
        </div>
        <div className="dash-act">Nyit: <strong>{first.item.artist}</strong></div>
        {first.item.soundcheck && (
          <div className="dash-sub"><Volume2 size={13} /> Első beállás: {first.item.soundcheck}</div>
        )}
      </div>
    );
  }

  const current = withRange.filter(x => x.range.start <= minutes && minutes < x.range.end);
  const next = withRange.find(x => x.range.start > minutes);
  const nextArtist = next ? findArtist(artists, next.item) : null;

  return (
    <div className={`dash-stage${current.length ? ' live' : ''}`}>
      <div className="dash-stage-name">
        {current.length > 0 && <span className="live-dot" />} {stage.name}
      </div>

      {current.length > 0 ? (
        isParallel ? (
          <div className="dash-act"><strong>{current.length} utcazenei pont aktív</strong></div>
        ) : (
          current.map(({ item, range }) => {
            const pct = Math.min(100, Math.max(0, ((minutes - range.start) / (range.end - range.start)) * 100));
            return (
              <div key={item.id}>
                <div className="dash-act"><span className="dash-label">MOST</span> <strong>{item.artist}</strong></div>
                <div className="dash-progress"><span style={{ width: `${pct}%` }} /></div>
                <div className="dash-sub">{formatClock(range.start)}–{formatClock(range.end)} · még {formatDuration(range.end - minutes)}</div>
              </div>
            );
          })
        )
      ) : (
        <div className="dash-muted">Most szünet / átállás</div>
      )}

      {next ? (
        <div className="dash-next">
          <div className="dash-act">
            <span className="dash-label next">KÖVETKEZIK</span> <strong>{next.item.artist}</strong>
          </div>
          <div className="dash-sub">
            <Clock size={13} /> {formatClock(next.range.start)} · {formatDuration(next.range.start - minutes)} múlva
          </div>
          {next.item.soundcheck && (
            <div className="dash-sub"><Volume2 size={13} /> Beállás: {next.item.soundcheck}</div>
          )}
          {!hasRider(nextArtist) && <span className="badge badge-rose">Rider hiányzik</span>}
        </div>
      ) : (
        <div className="dash-muted">Mára nincs több műsor.</div>
      )}
    </div>
  );
}

export function DashboardView({
  schedule, artists, tasks, onUpdateTasks, shoppingList, incidents, onUpdateIncidents,
  users, permits = [], onNavigate, onAddLog, currentUser
}) {
  const now = useNow();
  const clock = getFestivalClock(now);
  const [selectedDay, setSelectedDay] = useState(clock.day || FESTIVAL.days[0].name);
  const live = clock.status === 'during' && clock.day === selectedDay;
  const today = now.toLocaleDateString('sv-SE');

  const daySchedule = schedule.filter(s => s.day === selectedDay);
  const activeIncidents = incidents.filter(i => !i.isResolved);

  const myTasks = tasks
    .filter(t => !t.completed && t.assignedTo === currentUser)
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  const myShopping = shoppingList.filter(s => !s.isPurchased && s.responsible === currentUser);

  const warnings = useMemo(() => {
    const scheduledArtists = [];
    const seen = new Set();
    schedule.forEach(item => {
      const a = findArtist(artists, item);
      const key = a ? a.id : item.artist;
      if (seen.has(key)) return;
      seen.add(key);
      scheduledArtists.push({ name: a ? a.name : item.artist, artist: a });
    });
    const noRider = scheduledArtists.filter(x => !hasRider(x.artist));
    const noContract = scheduledArtists.filter(x => x.artist && !isContractSigned(x.artist));
    const overlaps = findOverlaps(schedule);
    const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);
    const me = users.find(u => u.name === currentUser);
    const daysTo = (d) => Math.round((new Date(d) - new Date(today)) / 86400000);
    const urgentPermits = permits.filter(p => isPermitOpen(p) && p.deadline && daysTo(p.deadline) <= 14);
    return [
      me && String(me.pin) === '1532' && {
        icon: KeyRound, tone: 'rose', tab: 'team',
        title: 'A PIN kódod még az alapértelmezett 1532',
        detail: 'Bárki beléphet a nevedben. Változtasd meg a Stáb menüben!'
      },
      overlaps.length > 0 && {
        icon: CalendarClock, tone: 'rose', tab: 'schedule',
        title: `${overlaps.length} időpont-ütközés a menetrendben`,
        detail: overlaps.slice(0, 3).map(o => `${o.a.day}: ${o.a.artist} ↔ ${o.b.artist}`).join(' · ')
      },
      urgentPermits.length > 0 && {
        icon: CalendarClock, tone: urgentPermits.some(p => daysTo(p.deadline) < 0) ? 'rose' : 'amber', tab: 'permits',
        title: `${urgentPermits.length} engedély határideje lejárt vagy 14 napon belül lejár`,
        detail: urgentPermits.slice(0, 3).map(p => `${p.name} (${p.deadline})`).join(' · ')
      },
      overdue.length > 0 && {
        icon: AlertTriangle, tone: 'rose', tab: 'tasks',
        title: `${overdue.length} lejárt határidejű feladat`,
        detail: overdue.slice(0, 3).map(t => `${t.assignedTo}: ${t.title}`).join(' · ')
      },
      noRider.length > 0 && {
        icon: FileWarning, tone: 'amber', tab: 'artists',
        title: `${noRider.length} fellépőnél hiányzik a jóváhagyott rider`,
        detail: noRider.slice(0, 5).map(x => x.name).join(', ')
      },
      noContract.length > 0 && {
        icon: FileSignature, tone: 'amber', tab: 'artists',
        title: `${noContract.length} fellépő szerződése nincs aláírva`,
        detail: noContract.slice(0, 5).map(x => x.name).join(', ')
      }
    ].filter(Boolean);
  }, [schedule, artists, tasks, today, users, currentUser, permits]);

  const toggleTask = (task) => {
    const stamp = `${today} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;
    onUpdateTasks(tasks.map(t => (t.id === task.id ? { ...t, completed: true, completedBy: currentUser, completedAt: stamp } : t)));
    onAddLog({ user: currentUser, action: 'TASK_COMPLETED', module: 'To-Do Feladatok', description: `Kipipálta a feladatot: "${task.title}"` });
  };

  const resolveIncident = (inc) => {
    const time = new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    onUpdateIncidents(incidents.map(i => (i.id === inc.id ? { ...i, isResolved: true, resolvedBy: currentUser, resolvedAt: time } : i)));
    onAddLog({ user: currentUser, action: 'RESOLVE_INCIDENT', module: 'Helyszíni SOS Problémafal', description: `Megoldotta a problémát: "${inc.text}"` });
  };

  let statusText;
  if (clock.status === 'during') statusText = `Élő: ${clock.day}, ${formatClock(clock.minutes)}`;
  else if (clock.status === 'before') statusText = `A fesztiválig ${clock.daysUntil} nap van hátra`;
  else statusText = `A ${FESTIVAL.year}-es fesztivál véget ért`;

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h2 className="view-title">Szia, {currentUser}!</h2>
          <div className={`dash-status ${clock.status}`}>
            {clock.status === 'during' && <span className="live-dot" />} {statusText}
          </div>
        </div>
        <div className="day-switch">
          {FESTIVAL.days.map(d => (
            <button
              key={d.name}
              onClick={() => setSelectedDay(d.name)}
              className={`day-btn${selectedDay === d.name ? ' active' : ''}`}
            >
              {d.name}{clock.day === d.name ? ' •' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* SOS / problémák */}
      {activeIncidents.length > 0 && (
        <section className="dash-card dash-sos">
          <div className="dash-card-title">
            <AlertCircle size={18} color="#dc2626" /> Nyitott problémák ({activeIncidents.length})
          </div>
          <div className="dash-list">
            {activeIncidents.map(inc => (
              <div key={inc.id} className={`dash-incident ${inc.severity}`}>
                <div className="dash-incident-body">
                  <div className="dash-incident-loc">{inc.location}</div>
                  <div>{inc.text}</div>
                  <div className="dash-sub">{inc.reporter} · {inc.time}</div>
                </div>
                <button className="btn-success" onClick={() => resolveIncident(inc)}>Megoldva</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Színpadok */}
      <section className="dash-card">
        <div className="dash-card-title">
          <Radio size={18} color="#2563eb" /> Színpadok — {selectedDay}{live ? ' (élő)' : ''}
          <button className="link-btn" onClick={() => onNavigate('schedule')}>Menetrend <ChevronRight size={14} /></button>
        </div>
        <div className="dash-stages">
          {STAGES.map(stage => (
            <StageCard
              key={stage.id}
              stage={stage}
              items={sortByTime(daySchedule.filter(s => s.stageId === stage.id))}
              live={live}
              minutes={clock.minutes}
              artists={artists}
            />
          ))}
        </div>
      </section>

      <div className="dash-grid">
        {/* Saját feladatok */}
        <section className="dash-card">
          <div className="dash-card-title">
            <CheckSquare size={18} color="#d97706" /> Az én feladataim ({myTasks.length})
            <button className="link-btn" onClick={() => onNavigate('tasks')}>Összes <ChevronRight size={14} /></button>
          </div>
          {myTasks.length === 0 ? (
            <div className="dash-empty"><CheckCircle2 size={16} color="#059669" /> Nincs nyitott feladatod.</div>
          ) : (
            <div className="dash-list">
              {myTasks.slice(0, 8).map(t => {
                const overdue = t.dueDate && t.dueDate < today;
                return (
                  <button key={t.id} className="dash-task" onClick={() => toggleTask(t)} title="Kipipálás">
                    <Square size={20} color="#64748b" />
                    <span className="dash-task-text">
                      <span>{t.title}</span>
                      <span className={`dash-sub${overdue ? ' overdue' : ''}`}>
                        {t.dueDate ? `Határidő: ${t.dueDate}${overdue ? ' — LEJÁRT' : ''}` : 'Nincs határidő'} · {t.priority}
                      </span>
                    </span>
                  </button>
                );
              })}
              {myTasks.length > 8 && <div className="dash-muted">+ még {myTasks.length - 8} feladat</div>}
            </div>
          )}
        </section>

        {/* Saját beszerzések */}
        <section className="dash-card">
          <div className="dash-card-title">
            <ShoppingCart size={18} color="#db2777" /> Nekem kell beszerezni ({myShopping.length})
            <button className="link-btn" onClick={() => onNavigate('shopping')}>Lista <ChevronRight size={14} /></button>
          </div>
          {myShopping.length === 0 ? (
            <div className="dash-empty"><CheckCircle2 size={16} color="#059669" /> Nincs rád váró beszerzés.</div>
          ) : (
            <div className="dash-list">
              {myShopping.slice(0, 8).map(s => (
                <div key={s.id} className="dash-line">
                  <span><strong>{s.name}</strong></span>
                  <span className="dash-sub">{s.qty} {s.unit} · {s.store} · {s.priority}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Figyelmeztetések */}
        <section className="dash-card">
          <div className="dash-card-title">
            <AlertTriangle size={18} color="#b45309" /> Figyelni kell ({warnings.length})
          </div>
          {warnings.length === 0 ? (
            <div className="dash-empty"><CheckCircle2 size={16} color="#059669" /> Minden rendben.</div>
          ) : (
            <div className="dash-list">
              {warnings.map(w => {
                const Icon = w.icon;
                return (
                  <button key={w.title} className={`dash-warning ${w.tone}`} onClick={() => onNavigate(w.tab)}>
                    <Icon size={18} />
                    <span className="dash-task-text">
                      <strong>{w.title}</strong>
                      <span className="dash-sub">{w.detail}</span>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Gyorshívás */}
        <section className="dash-card">
          <div className="dash-card-title">
            <Phone size={18} color="#059669" /> Stáb gyorshívás
            <button className="link-btn" onClick={() => onNavigate('contacts')}>Telefonkönyv <ChevronRight size={14} /></button>
          </div>
          <div className="dash-list">
            {users.filter(u => u.phone && u.name !== currentUser).map(u => (
              <a key={u.id} href={telHref(u.phone) || undefined} className="dash-call">
                <span className="dash-task-text">
                  <strong>{u.name}</strong>
                  <span className="dash-sub">{u.role}{u.radio ? ` · ${u.radio}` : ''}</span>
                </span>
                <span className="call-pill"><Phone size={14} /> Hívás</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
