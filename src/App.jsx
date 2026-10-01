import React, { useState, useEffect, useCallback } from 'react';
import { PinLogin } from './components/PinLogin';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LiveAlertsBar } from './components/LiveAlertsBar';
import { GlobalSearchResults } from './components/GlobalSearchResults';
import { ErrorBoundary } from './components/ErrorBoundary';

import { DashboardView } from './components/DashboardView';
import { ContactsView } from './components/ContactsView';
import { ScheduleView } from './components/ScheduleView';
import { ArtistsView } from './components/ArtistsView';
import { ContractorsView } from './components/ContractorsView';
import { SiteMapView } from './components/SiteMapView';
import { TasksView } from './components/TasksView';
import { ShoppingListView } from './components/ShoppingListView';
import { VendorsView } from './components/VendorsView';
import { InventoryView } from './components/InventoryView';
import { BudgetView } from './components/BudgetView';
import { AuditLogView } from './components/AuditLogView';
import { TeamView } from './components/TeamView';
import { PermitsView, isPermitOpen } from './components/PermitsView';
import { TrashView, TRASH_DAYS } from './components/TrashView';
import { FinanceView } from './components/FinanceView';
import { SponsorsView } from './components/SponsorsView';
import { expenseEntries, assignedByBudgetLine } from './lib/finance';

import {
  DEFAULT_USERS,
  INITIAL_SCHEDULE,
  INITIAL_ARTISTS,
  INITIAL_CONTRACTORS,
  INITIAL_VENDORS,
  INITIAL_TASKS,
  INITIAL_SHOPPING_LIST,
  INITIAL_INVENTORY,
  INITIAL_BUDGET,
  INITIAL_LOGS,
  INITIAL_INCIDENTS,
  MAP_POINTS,
  STAGES
} from './lib/initialData';

import { getLocalData, setLocalData } from './lib/supabase';
import { useFestivalStore, uid } from './lib/store';
import { notify } from './lib/notify';
import { TABS } from './lib/tabs';
import { setStages } from './lib/stages';
import { itemLabel, labelOf } from './lib/backup';

const COLLECTIONS = {
  users: DEFAULT_USERS,
  schedule: INITIAL_SCHEDULE,
  artists: INITIAL_ARTISTS,
  contractors: INITIAL_CONTRACTORS,
  vendors: INITIAL_VENDORS,
  tasks: INITIAL_TASKS,
  shoppingList: INITIAL_SHOPPING_LIST,
  inventory: INITIAL_INVENTORY,
  budget: INITIAL_BUDGET,
  logs: INITIAL_LOGS,
  incidents: INITIAL_INCIDENTS,
  mapPoints: MAP_POINTS,
  permits: [],
  stages: STAGES,
  income: [],
  sponsors: [],
  trash: []
};

// Ezekből a törölt tételek a lomtárba kerülnek
const TRASHABLE = new Set(Object.keys(COLLECTIONS).filter(k => k !== 'logs' && k !== 'trash'));

export function App() {
  const [currentUser, setCurrentUser] = useState(() => getLocalData('currentUser', null));
  const [activeTab, setActiveTab] = useState(() => {
    const saved = getLocalData('activeTab', 'dashboard');
    return TABS.some(t => t.id === saved) ? saved : 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleRemoteInsert = useCallback((collection, item, by) => {
    if (collection === 'incidents' && !item.isResolved && item.severity !== 'info') {
      const prefix = item.severity === 'critical' ? 'SOS' : 'Figyelmeztetés';
      notify(`${prefix}: ${item.location}`, `${item.text}${by ? ` (${by})` : ''}`);
    }
  }, []);

  const { data, update, get, status, pendingCount } = useFestivalStore(COLLECTIONS, {
    currentUser,
    onRemoteInsert: handleRemoteInsert
  });

  useEffect(() => { setLocalData('currentUser', currentUser); }, [currentUser]);

  // Ha a bejelentkezett név kikerült a stábból, kiléptetjük
  useEffect(() => {
    if (currentUser && data.users.length > 0 && !data.users.some(u => u.name === currentUser)) {
      setCurrentUser(null);
    }
  }, [currentUser, data.users]);
  useEffect(() => { setLocalData('activeTab', activeTab); }, [activeTab]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  }, []);

  const handleAddLog = useCallback((entry) => {
    const now = new Date();
    const log = {
      id: uid('log'),
      time: `${now.toLocaleDateString('sv-SE')} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`,
      ...entry
    };
    update('logs', [log, ...get('logs')]);
  }, [update, get]);

  // SOS megoldásakor a térképen jelölt hiba is törlődik
  const handleUpdateIncidents = useCallback((next) => {
    const prevById = new Map(get('incidents').map(i => [i.id, i]));
    update('incidents', next);
    const resolvedPointIds = next
      .filter(i => i.pointId && i.isResolved && prevById.get(i.id) && !prevById.get(i.id).isResolved)
      .map(i => i.pointId);
    if (resolvedPointIds.length) {
      const clear = (item) => (resolvedPointIds.includes(item.id) && item.hasProblem ? { ...item, hasProblem: false, problemText: '' } : item);
      if (get('mapPoints').some(p => resolvedPointIds.includes(p.id) && p.hasProblem)) update('mapPoints', get('mapPoints').map(clear));
      if (get('vendors').some(v => resolvedPointIds.includes(v.id) && v.hasProblem)) update('vendors', get('vendors').map(clear));
    }
  }, [update, get]);

  // Mentés + a törölt tételek lomtárba helyezése (30 napig visszaállítható)
  const setter = (key) => (next) => {
    const prev = get(key);
    const nextIds = new Set(next.map(i => i.id));
    const removed = prev.filter(i => !nextIds.has(i.id));
    update(key, next);
    if (removed.length && TRASHABLE.has(key)) {
      const deletedAt = new Date().toISOString();
      update('trash', [
        ...removed.map(item => ({ id: uid('trash'), collection: key, item, label: itemLabel(item), deletedBy: currentUser, deletedAt })),
        ...get('trash')
      ]);
    }
  };

  const handleRestore = useCallback((entry) => {
    const list = get(entry.collection);
    if (!list.some(i => i.id === entry.item.id)) update(entry.collection, [...list, entry.item]);
    update('trash', get('trash').filter(t => t.id !== entry.id));
    handleAddLog({ user: currentUser, action: 'RESTORE', module: 'Lomtár & Mentés', description: `Visszaállította: ${labelOf(entry.collection)} — ${entry.label}` });
  }, [get, update, handleAddLog, currentUser]);

  const handlePurge = useCallback((ids) => {
    update('trash', get('trash').filter(t => !ids.includes(t.id)));
  }, [get, update]);

  // 30 napnál régebbi lomtár-tételek automatikus végleges törlése
  useEffect(() => {
    const limit = Date.now() - TRASH_DAYS * 86400000;
    const old = data.trash.filter(t => new Date(t.deletedAt).getTime() < limit).map(t => t.id);
    if (old.length) handlePurge(old);
  }, [data.trash, handlePurge]);

  // A helyszínlistát minden nézet innen olvassa
  setStages(data.stages);

  if (!currentUser) {
    return <PinLogin onLogin={setCurrentUser} users={data.users} />;
  }

  const { users, schedule, artists, contractors, vendors, tasks, shoppingList, inventory, budget, logs, incidents, mapPoints, permits, stages, income, sponsors, trash } = data;
  const budgetAssigned = assignedByBudgetLine(expenseEntries({ artists, contractors, shoppingList, permits }));

  const totalBudgetHuf = budget.reduce((sum, b) => sum + (Number(b.qty) || 0) * (Number(b.unitPrice) || 0), 0);
  const myOpenTasks = tasks.filter(t => !t.completed && t.assignedTo === currentUser).length;

  const counts = {
    schedule: schedule.length,
    artists: artists.length,
    contractors: contractors.length,
    team: users.length,
    map: [...mapPoints, ...vendors].filter(p => p.hasProblem).length || undefined,
    mapAlert: [...mapPoints, ...vendors].some(p => p.hasProblem),
    tasks: tasks.filter(t => !t.completed).length,
    tasksAlert: myOpenTasks > 0,
    shopping: shoppingList.filter(s => !s.isPurchased).length,
    shoppingAlert: shoppingList.some(s => !s.isPurchased && s.responsible === currentUser),
    vendors: vendors.length,
    permits: permits.filter(isPermitOpen).length,
    permitsAlert: permits.some(p => isPermitOpen(p) && p.deadline && (new Date(p.deadline) - new Date()) / 86400000 <= 14),
    inventory: inventory.length,
    trash: trash.length || undefined,
    sponsors: sponsors.length,
    sponsorsAlert: sponsors.some(sp => (sp.obligations || []).some(o => !o.done) && sp.status !== 'Nem vállalta'),
    budget: `${(totalBudgetHuf / 1000000).toFixed(1)}M`,
    logs: logs.length,
    dashboard: incidents.filter(i => !i.isResolved).length || undefined,
    dashboardAlert: incidents.some(i => !i.isResolved && i.severity === 'critical')
  };

  const common = { onAddLog: handleAddLog, currentUser, searchQuery };

  return (
    <div className="app-container">
      <div className="no-print">
        <Header
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          syncStatus={status}
          pendingCount={pendingCount}
        />

        <LiveAlertsBar
          incidents={incidents}
          onUpdateIncidents={handleUpdateIncidents}
          onAddLog={handleAddLog}
          currentUser={currentUser}
        />

      </div>

      <div className="app-body">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} counts={counts} />

      <main className="main-content">
        <GlobalSearchResults
          query={searchQuery}
          data={data}
          activeTab={activeTab}
          onNavigate={handleTabChange}
        />

        <ErrorBoundary key={activeTab} onHome={() => handleTabChange('dashboard')}>

        {activeTab === 'dashboard' && (
          <DashboardView
            schedule={schedule}
            artists={artists}
            tasks={tasks}
            onUpdateTasks={setter('tasks')}
            shoppingList={shoppingList}
            incidents={incidents}
            onUpdateIncidents={handleUpdateIncidents}
            users={users}
            permits={permits}
            onNavigate={handleTabChange}
            onAddLog={handleAddLog}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsView
            users={users}
            artists={artists}
            contractors={contractors}
            vendors={vendors}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            schedule={schedule}
            onUpdateSchedule={setter('schedule')}
            artists={artists}
            onUpdateArtists={setter('artists')}
            onUpdateStages={setter('stages')}
            users={users}
            {...common}
          />
        )}

        {activeTab === 'artists' && (
          <ArtistsView artists={artists} onUpdateArtists={setter('artists')} schedule={schedule} users={users} budget={budget} {...common} />
        )}

        {activeTab === 'contractors' && (
          <ContractorsView contractors={contractors} onUpdateContractors={setter('contractors')} budget={budget} {...common} />
        )}

        {activeTab === 'team' && (
          <TeamView
            users={users}
            onUpdateUsers={setter('users')}
            tasks={tasks}
            shoppingList={shoppingList}
            {...common}
          />
        )}

        {activeTab === 'map' && (
          <SiteMapView
            points={mapPoints}
            onUpdatePoints={setter('mapPoints')}
            vendors={vendors}
            onUpdateVendors={setter('vendors')}
            stages={stages}
            onUpdateStages={setter('stages')}
            schedule={schedule}
            contractors={contractors}
            incidents={incidents}
            onUpdateIncidents={handleUpdateIncidents}
            {...common}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView tasks={tasks} onUpdateTasks={setter('tasks')} users={users} {...common} />
        )}

        {activeTab === 'shopping' && (
          <ShoppingListView shoppingList={shoppingList} onUpdateShoppingList={setter('shoppingList')} users={users} budget={budget} {...common} />
        )}

        {activeTab === 'permits' && (
          <PermitsView permits={permits} onUpdatePermits={setter('permits')} users={users} budget={budget} {...common} />
        )}

        {activeTab === 'vendors' && (
          <VendorsView vendors={vendors} onUpdateVendors={setter('vendors')} contractors={contractors} {...common} />
        )}

        {activeTab === 'inventory' && (
          <InventoryView inventory={inventory} onUpdateInventory={setter('inventory')} {...common} />
        )}

        {activeTab === 'budget' && (
          <BudgetView budget={budget} onUpdateBudget={setter('budget')} assigned={budgetAssigned} {...common} />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            artists={artists}
            contractors={contractors}
            shoppingList={shoppingList}
            permits={permits}
            vendors={vendors}
            sponsors={sponsors}
            budget={budget}
            income={income}
            onUpdateIncome={setter('income')}
            onNavigate={handleTabChange}
            onAddLog={handleAddLog}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'sponsors' && (
          <SponsorsView sponsors={sponsors} onUpdateSponsors={setter('sponsors')} {...common} />
        )}

        {activeTab === 'trash' && (
          <TrashView trash={trash} onRestore={handleRestore} onPurge={handlePurge} data={data} onAddLog={handleAddLog} currentUser={currentUser} />
        )}

        {activeTab === 'logs' && (
          <AuditLogView logs={logs} currentUser={currentUser} searchQuery={searchQuery} />
        )}
        </ErrorBoundary>
      </main>
      </div>
    </div>
  );
}
