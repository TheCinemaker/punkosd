import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Calendar, UserCheck, AlertCircle, Filter, CheckCircle2, Check, X } from 'lucide-react';

export function TasksView({ tasks, onUpdateTasks, onAddLog, currentUser, searchQuery }) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    'Összes kategória',
    'Pályázat & Admin',
    'Nagyszínpad',
    'Technika & Áram',
    'Engedélyek & Hatóság',
    'Árusok & Gasztro',
    'Higiénia & Szemét',
    'Bontás & Elszámolás'
  ];

  // Toggle completion with WHO checked it and WHEN!
  const handleToggleTask = (task) => {
    const isNowCompleted = !task.completed;
    const now = new Date();
    const timeString = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;

    const updatedTask = {
      ...task,
      completed: isNowCompleted,
      completedBy: isNowCompleted ? currentUser : null,
      completedAt: isNowCompleted ? timeString : null
    };

    onUpdateTasks(tasks.map(t => t.id === task.id ? updatedTask : t));

    onAddLog({
      user: currentUser,
      action: isNowCompleted ? 'TASK_COMPLETED' : 'TASK_REOPENED',
      module: 'To-Do Feladatok',
      description: isNowCompleted
        ? `Kipipálta a feladatot: "${task.title}"`
        : `Újra megnyitotta a feladatot: "${task.title}"`
    });
  };

  const handleAddNewTask = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTask = {
      id: 'tsk-' + Date.now(),
      title: formData.get('title'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      assignedTo: formData.get('assignedTo') || currentUser,
      dueDate: formData.get('dueDate'),
      completed: false,
      completedBy: null,
      completedAt: null,
      createdBy: currentUser,
      notes: formData.get('notes')
    };

    onUpdateTasks([newTask, ...tasks]);
    onAddLog({
      user: currentUser,
      action: 'CREATE',
      module: 'To-Do Feladatok',
      description: `Új feladatot hozott létre: "${newTask.title}" (Felelős: ${newTask.assignedTo})`
    });

    setIsModalOpen(false);
  };

  const handleDeleteTask = (id, title) => {
    if (window.confirm(`Biztosan törlöd ezt a feladatot: "${title}"?`)) {
      onUpdateTasks(tasks.filter(t => t.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'To-Do Feladatok',
        description: `Törölte a feladatot: "${title}"`
      });
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'pending' ? !t.completed :
      t.completed;

    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesAssignee = filterAssignee === 'all' || t.assignedTo === filterAssignee;
    const matchesSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesCategory && matchesAssignee && matchesSearch;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div>
      {/* Top Controls & Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: filterStatus === 'all' ? '700' : '500',
              backgroundColor: filterStatus === 'all' ? '#2563eb' : '#1e293b',
              color: filterStatus === 'all' ? '#ffffff' : '#94a3b8',
              border: '1px solid #27354d'
            }}
          >
            Minden feladat ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: filterStatus === 'pending' ? '700' : '500',
              backgroundColor: filterStatus === 'pending' ? '#d97706' : '#1e293b',
              color: filterStatus === 'pending' ? '#ffffff' : '#fbbf24',
              border: '1px solid #27354d'
            }}
          >
            Függőben lévő ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: filterStatus === 'completed' ? '700' : '500',
              backgroundColor: filterStatus === 'completed' ? '#059669' : '#1e293b',
              color: filterStatus === 'completed' ? '#ffffff' : '#34d399',
              border: '1px solid #27354d'
            }}
          >
            Kipipálva ({completedCount})
          </button>
        </div>

        {/* Dropdown Filters & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ fontSize: '12.5px', padding: '6px 10px' }}
          >
            <option value="all">Minden kategória</option>
            {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            style={{ fontSize: '12.5px', padding: '6px 10px' }}
          >
            <option value="all">Minden felelős</option>
            <option value="Szilveszter">Szilveszter</option>
            <option value="Gábor">Gábor</option>
            <option value="Zoltán">Zoltán</option>
            <option value="Műszaki Stáb">Műszaki Stáb</option>
            <option value="Önkéntes Csapat">Önkéntes Csapat</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '12.5px' }}
          >
            <Plus size={15} /> Új Feladat
          </button>
        </div>
      </div>

      {/* Task List (High Density Program Management UI) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
            backgroundColor: '#111827',
            border: '1px solid #27354d',
            borderRadius: '8px'
          }}>
            Nincs megjeleníthető feladat a kiválasztott szűrőkkel.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                backgroundColor: task.completed ? '#0e1522' : '#182234',
                border: task.completed ? '1px solid #1c2738' : '1px solid #27354d',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                opacity: task.completed ? 0.8 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              {/* Left: Checkbox + Title + Meta */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                <button
                  onClick={() => handleToggleTask(task)}
                  title={task.completed ? 'Újra megnyitás' : 'Kipipálás (neveddel naplózva)'}
                  style={{
                    color: task.completed ? '#10b981' : '#64748b',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                >
                  {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: task.completed ? '#94a3b8' : '#f8fafc',
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </div>

                  {task.notes && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {task.notes}
                    </div>
                  )}

                  {/* Audit Footer: WHO COMPLETED IT */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '11px', flexWrap: 'wrap' }}>
                    <span className="badge badge-gray">{task.category}</span>
                    <span className={`badge ${task.priority.includes('Sürgős') ? 'badge-rose' : task.priority === 'Magas' ? 'badge-amber' : 'badge-blue'}`}>
                      {task.priority}
                    </span>

                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <UserCheck size={12} color="#60a5fa" /> Felelős: <strong>{task.assignedTo}</strong>
                    </span>

                    {task.dueDate && (
                      <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={12} color="#a855f7" /> Határidő: {task.dueDate}
                      </span>
                    )}

                    {/* THIS IS THE CRITICAL AUDIT STAMP: WHO CHECKED IT */}
                    {task.completed ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#34d399',
                        fontWeight: '700',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        <Check size={13} /> Kipipálta: {task.completedBy} ({task.completedAt})
                      </span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>
                        Létrehozta: {task.createdBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div>
                <button
                  onClick={() => handleDeleteTask(task.id, task.title)}
                  title="Feladat törlése"
                  style={{ color: '#94a3b8', padding: '6px', borderRadius: '4px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                Új Operatív Feladat Hozzáadása
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#cbd5e1', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddNewTask}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                    Feladat Megnevezése
                  </label>
                  <input
                    name="title"
                    placeholder="pl. 120L szemeteszsákok kiszállítása a Jurisics térre"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Kategória
                    </label>
                    <select name="category" style={{ width: '100%' }}>
                      {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Prioritás
                    </label>
                    <select name="priority" style={{ width: '100%' }}>
                      <option value="Sürgős">Sürgős</option>
                      <option value="Magas">Magas</option>
                      <option value="Normál">Normál</option>
                      <option value="Alacsony">Alacsony</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Felelős Személy
                    </label>
                    <select name="assignedTo" defaultValue={currentUser} style={{ width: '100%' }}>
                      <option value="Szilveszter">Szilveszter</option>
                      <option value="Gábor">Gábor</option>
                      <option value="Zoltán">Zoltán</option>
                      <option value="Műszaki Stáb">Műszaki Stáb</option>
                      <option value="Önkéntes Csapat">Önkéntes Csapat</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Határidő Dátuma
                    </label>
                    <input type="date" name="dueDate" defaultValue="2026-05-22" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                    Megjegyzés / Részletek
                  </label>
                  <textarea name="notes" rows={3} placeholder="Helyszín, kontakt, speciális teendő..." style={{ width: '100%' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Mégse</button>
                <button type="submit" className="btn-primary">Feladat Létrehozása</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
