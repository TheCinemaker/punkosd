import React, { useState, useEffect } from 'react';
import { PinLogin } from './components/PinLogin';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LiveAlertsBar } from './components/LiveAlertsBar';

import { ScheduleView } from './components/ScheduleView';
import { ArtistsView } from './components/ArtistsView';
import { ContractorsView } from './components/ContractorsView';
import { SiteMapView } from './components/SiteMapView';
import { TasksView } from './components/TasksView';
import { ShoppingListView } from './components/ShoppingListView';
import { VendorsView } from './components/VendorsView';
import { InventoryView } from './components/InventoryView';
import { TracklistView } from './components/TracklistView';
import { BudgetView } from './components/BudgetView';
import { AuditLogView } from './components/AuditLogView';

import {
  INITIAL_SCHEDULE,
  INITIAL_ARTISTS,
  INITIAL_CONTRACTORS,
  INITIAL_VENDORS,
  INITIAL_TASKS,
  INITIAL_SHOPPING_LIST,
  INITIAL_INVENTORY,
  INITIAL_TRACKLIST,
  INITIAL_BUDGET,
  INITIAL_LOGS,
  INITIAL_INCIDENTS,
  MAP_POINTS
} from './lib/initialData';

import { getLocalData, setLocalData } from './lib/supabase';
import { exportFestivalToExcel } from './lib/excelExport';
import { subscribeToRealtimeUpdates, broadcastUpdate } from './lib/realtime';

export function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => getLocalData('currentUser', null));

  // Core Data states
  const [schedule, setSchedule] = useState(() => getLocalData('schedule', INITIAL_SCHEDULE));
  const [artists, setArtists] = useState(() => getLocalData('artists', INITIAL_ARTISTS));
  const [contractors, setContractors] = useState(() => getLocalData('contractors', INITIAL_CONTRACTORS));
  const [vendors, setVendors] = useState(() => getLocalData('vendors', INITIAL_VENDORS));
  const [tasks, setTasks] = useState(() => getLocalData('tasks', INITIAL_TASKS));
  const [shoppingList, setShoppingList] = useState(() => getLocalData('shoppingList', INITIAL_SHOPPING_LIST));
  const [inventory, setInventory] = useState(() => getLocalData('inventory', INITIAL_INVENTORY));
  const [tracklist, setTracklist] = useState(() => getLocalData('tracklist', INITIAL_TRACKLIST));
  const [budget, setBudget] = useState(() => getLocalData('budget', INITIAL_BUDGET));
  const [logs, setLogs] = useState(() => getLocalData('logs', INITIAL_LOGS));
  const [incidents, setIncidents] = useState(() => getLocalData('incidents', INITIAL_INCIDENTS));

  // Active UI states
  const [activeTab, setActiveTab] = useState('schedule');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist states to local storage
  useEffect(() => { setLocalData('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { setLocalData('schedule', schedule); }, [schedule]);
  useEffect(() => { setLocalData('artists', artists); }, [artists]);
  useEffect(() => { setLocalData('contractors', contractors); }, [contractors]);
  useEffect(() => { setLocalData('vendors', vendors); }, [vendors]);
  useEffect(() => { setLocalData('tasks', tasks); }, [tasks]);
  useEffect(() => { setLocalData('shoppingList', shoppingList); }, [shoppingList]);
  useEffect(() => { setLocalData('inventory', inventory); }, [inventory]);
  useEffect(() => { setLocalData('tracklist', tracklist); }, [tracklist]);
  useEffect(() => { setLocalData('budget', budget); }, [budget]);
  useEffect(() => { setLocalData('logs', logs); }, [logs]);
  useEffect(() => { setLocalData('incidents', incidents); }, [incidents]);

  // Subscribe to Realtime Updates
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeUpdates((message) => {
      console.log('Realtime broadcast received:', message);
      if (message.type === 'SYNC_DATA') {
        const { key, data } = message.payload;
        if (key === 'schedule') setSchedule(data);
        if (key === 'artists') setArtists(data);
        if (key === 'contractors') setContractors(data);
        if (key === 'vendors') setVendors(data);
        if (key === 'tasks') setTasks(data);
        if (key === 'shoppingList') setShoppingList(data);
        if (key === 'inventory') setInventory(data);
        if (key === 'tracklist') setTracklist(data);
        if (key === 'budget') setBudget(data);
        if (key === 'logs') setLogs(data);
        if (key === 'incidents') setIncidents(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Broadcast updater helper
  const updateAndBroadcast = (key, data, setter) => {
    setter(data);
    broadcastUpdate('SYNC_DATA', { key, data }, currentUser || 'Csapattag');
  };

  // Add audit log helper
  const handleAddLog = (newLogEntry) => {
    const now = new Date();
    const timeString = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;
    const completeLog = {
      id: 'log-' + Date.now(),
      time: timeString,
      ...newLogEntry
    };
    const updatedLogs = [completeLog, ...logs];
    updateAndBroadcast('logs', updatedLogs, setLogs);
  };

  // Handlers with Broadcast
  const handleUpdateSchedule = (newSchedule) => updateAndBroadcast('schedule', newSchedule, setSchedule);
  const handleUpdateArtists = (newArtists) => updateAndBroadcast('artists', newArtists, setArtists);
  const handleUpdateContractors = (newContractors) => updateAndBroadcast('contractors', newContractors, setContractors);
  const handleUpdateVendors = (newVendors) => updateAndBroadcast('vendors', newVendors, setVendors);
  const handleUpdateTasks = (newTasks) => updateAndBroadcast('tasks', newTasks, setTasks);
  const handleUpdateShoppingList = (newShopping) => updateAndBroadcast('shoppingList', newShopping, setShoppingList);
  const handleUpdateInventory = (newInv) => updateAndBroadcast('inventory', newInv, setInventory);
  const handleUpdateTracklist = (newTracks) => updateAndBroadcast('tracklist', newTracks, setTracklist);
  const handleUpdateBudget = (newBudget) => updateAndBroadcast('budget', newBudget, setBudget);
  const handleUpdateIncidents = (newIncidents) => updateAndBroadcast('incidents', newIncidents, setIncidents);

  // Export to Excel
  const handleExportExcel = () => {
    exportFestivalToExcel({
      schedule,
      artists,
      contractors,
      vendors,
      tasks,
      shoppingList,
      inventory,
      tracklist,
      budget,
      logs
    });
    handleAddLog({
      user: currentUser,
      action: 'EXPORT_EXCEL',
      module: 'Pályázati Költségvetés',
      description: 'Letöltötte a teljes 10 munkalapos fesztivál Excel munkafüzetet (.xlsx)'
    });
  };

  // If not logged in with 1532 PIN, show Login
  if (!currentUser) {
    return <PinLogin onLogin={(userName) => setCurrentUser(userName)} />;
  }

  // Calculate live badge counts
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const pendingShoppingCount = shoppingList.filter(s => !s.isPurchased).length;
  const totalBudgetHuf = budget.reduce((sum, b) => sum + (b.qty * b.unitPrice), 0);
  const budgetFormatted = `${(totalBudgetHuf / 1000000).toFixed(1)}M Ft`;

  const counts = {
    schedule: schedule.length,
    artists: artists.length,
    contractors: contractors.length,
    mapPoints: MAP_POINTS.length,
    pendingTasks: pendingTasksCount,
    pendingShopping: pendingShoppingCount,
    vendors: vendors.length,
    inventory: inventory.length,
    tracklist: tracklist.length,
    budgetFormatted,
    logs: logs.length
  };

  return (
    <div className="app-container">
      {/* 1. Header with branding, user chip, global search, and Excel export */}
      <Header
        currentUser={currentUser}
        onSwitchUser={() => setCurrentUser(null)}
        onLogout={() => setCurrentUser(null)}
        onExportExcel={handleExportExcel}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Real-Time Emergency SOS / Live Alerts Ticker */}
      <LiveAlertsBar
        incidents={incidents}
        onUpdateIncidents={handleUpdateIncidents}
        onAddLog={handleAddLog}
        currentUser={currentUser}
      />

      {/* 3. Navigation Bar (11 modules) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* 4. Main Operations Workspace */}
      <main className="main-content">
        {activeTab === 'schedule' && (
          <ScheduleView
            schedule={schedule}
            onUpdateSchedule={handleUpdateSchedule}
            artists={artists}
            onUpdateArtists={handleUpdateArtists}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'artists' && (
          <ArtistsView
            artists={artists}
            onUpdateArtists={handleUpdateArtists}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'contractors' && (
          <ContractorsView
            contractors={contractors}
            onUpdateContractors={handleUpdateContractors}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'map' && (
          <SiteMapView
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'shopping' && (
          <ShoppingListView
            shoppingList={shoppingList}
            onUpdateShoppingList={handleUpdateShoppingList}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorsView
            vendors={vendors}
            onUpdateVendors={handleUpdateVendors}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            onUpdateInventory={handleUpdateInventory}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'tracklist' && (
          <TracklistView
            tracklist={tracklist}
            onUpdateTracklist={handleUpdateTracklist}
            artists={artists}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            budget={budget}
            onUpdateBudget={handleUpdateBudget}
            onAddLog={handleAddLog}
            currentUser={currentUser}
            onExportExcel={handleExportExcel}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'logs' && (
          <AuditLogView
            logs={logs}
            currentUser={currentUser}
            searchQuery={searchQuery}
          />
        )}
      </main>
    </div>
  );
}
