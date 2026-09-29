import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export function AuditLogView({ logs, currentUser, searchQuery }) {
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');

  const users = Array.from(new Set(logs.map(l => l.user)));
  const modules = Array.from(new Set(logs.map(l => l.module)));

  const filteredLogs = logs.filter(l => {
    const matchesUser = selectedUser === 'all' || l.user === selectedUser;
    const matchesModule = selectedModule === 'all' || l.module === selectedModule;
    const matchesSearch = !searchQuery ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesUser && matchesModule && matchesSearch;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={18} color="#2563eb" /> Aktivitási & Műveleti Napló (Audit Trail)
          </h2>
          <p style={{ fontSize: '12px', color: '#475569' }}>
            Minden feladat-kipipálás, időrendi áthelyezés és szerkesztés pontosan rögzítésre kerül
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600' }}
          >
            <option value="all">Minden csapattag</option>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600' }}
          >
            <option value="all">Minden modul</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Időpont</th>
              <th>Csapattag</th>
              <th>Művelet</th>
              <th>Modul</th>
              <th>Tevékenység Pontos Leírása</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#475569' }}>
                  Nincs rögzített aktivitás a szűrési feltételekkel.
                </td>
              </tr>
            ) : (
              filteredLogs.map(l => {
                const isTaskDone = l.action === 'TASK_COMPLETED';
                const isCreate = l.action === 'CREATE';
                const isDelete = l.action === 'DELETE';

                return (
                  <tr key={l.id}>
                    <td style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono', fontWeight: '600' }}>
                      {l.time}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '11px'
                        }}>
                          {l.user.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '700', color: '#000000', fontSize: '13px' }}>
                          {l.user}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isTaskDone ? 'badge-green' : isCreate ? 'badge-blue' : isDelete ? 'badge-rose' : 'badge-amber'}`}>
                        {l.action}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-gray">{l.module}</span>
                    </td>
                    <td style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: isTaskDone ? '700' : '500' }}>
                      {l.description}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
