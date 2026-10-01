import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Calendar, UserCheck, Check, X } from 'lucide-react';
import { uid } from '../lib/store';
import { FESTIVAL } from '../lib/config';

export function TasksView({ tasks, onUpdateTasks, onAddLog, currentUser, searchQuery, users = [] }) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teamMembers = users.length > 0 
    ? users.map(u => u.name) 
    : ['Szilveszter', 'Gábor', 'Robi', 'Péter', 'Adrienn', 'Bea'];

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
    const timeString = `${now.toLocaleDateString('sv-SE')} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;

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
      id: uid('tsk'),
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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: filterStatus === 'all' ? '800' : '600',
              backgroundColor: filterStatus === 'all' ? '#2563eb' : '#ffffff',
              color: filterStatus === 'all' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: filterStatus === 'all' ? '#1d4ed8' : '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            Minden feladat ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: filterStatus === 'pending' ? '800' : '600',
              backgroundColor: filterStatus === 'pending' ? '#d97706' : '#ffffff',
              color: filterStatus === 'pending' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: filterStatus === 'pending' ? '#b45309' : '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            Függőben lévő ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: filterStatus === 'completed' ? '800' : '600',
              backgroundColor: filterStatus === 'completed' ? '#059669' : '#ffffff',
              color: filterStatus === 'completed' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: filterStatus === 'completed' ? '#047857' : '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            Kipipálva ({completedCount})
          </button>
        </div>

        {/* Dropdown Filters & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 10px', width: 'auto' }}
          >
            <option value="all">Minden kategória</option>
            {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 10px', width: 'auto' }}
          >
            <option value="all">Minden felelős</option>
            {teamMembers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={16} /> Új Feladat
          </button>
        </div>
      </div>

      {/* Task List (High Density Program Management UI) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#475569',
            backgroundColor: '#ffffff',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '8px',
            fontWeight: '500'
          }}>
            Nincs megjeleníthető feladat a kiválasztott szűrőkkel.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                backgroundColor: task.completed ? '#f8fafc' : '#ffffff',
                border: task.completed ? '1.5px solid #e2e8f0' : '1.5px solid #cbd5e1',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Left: Checkbox + Title + Meta */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                <button
                  onClick={() => handleToggleTask(task)}
                  title={task.completed ? 'Újra megnyitás' : 'Kipipálás (neveddel naplózva)'}
                  style={{
                    color: task.completed ? '#059669' : '#64748b',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                >
                  {task.completed ? <CheckSquare size={22} color="#059669" /> : <Square size={22} color="#64748b" />}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14.5px',
                    fontWeight: '700',
                    color: task.completed ? '#64748b' : '#000000',
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </div>

                  {task.notes && (
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', fontWeight: '500' }}>
                      {task.notes}
                    </div>
                  )}

                  {/* Audit Footer: WHO COMPLETED IT */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '12px', flexWrap: 'wrap' }}>
                    <span className="badge badge-gray">{task.category}</span>
                    <span className={`badge ${task.priority.includes('Sürgős') ? 'badge-rose' : task.priority === 'Magas' ? 'badge-amber' : 'badge-blue'}`}>
                      {task.priority}
                    </span>

                    <span style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <UserCheck size={14} color="#2563eb" /> Felelős: <strong>{task.assignedTo}</strong>
                    </span>

                    {task.dueDate && (
                      <span style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                        <Calendar size={14} color="#7c3aed" /> Határidő: {task.dueDate}
                      </span>
                    )}

                    {/* THIS IS THE CRITICAL AUDIT STAMP: WHO CHECKED IT */}
                    {task.completed ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#14532d',
                        fontWeight: '800',
                        backgroundColor: '#dcfce7',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #86efac'
                      }}>
                        <Check size={14} /> Kipipálta: {task.completedBy} ({task.completedAt})
                      </span>
                    ) : (
                      <span style={{ color: '#475569', fontSize: '11.5px' }}>
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
                  style={{ color: '#64748b', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  <Trash2 size={17} />
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
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Új Operatív Feladat Rögzítése
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddNewTask}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Feladat Megnevezése *
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Kategória
                    </label>
                    <select name="category" style={{ width: '100%' }}>
                      {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Felelős Személy
                    </label>
                    <select name="assignedTo" defaultValue={currentUser} style={{ width: '100%' }}>
                      {teamMembers.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Határidő Dátuma
                    </label>
                    <input type="date" name="dueDate" defaultValue={FESTIVAL.days[0].date} style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Megjegyzés / Részletek
                  </label>
                  <textarea name="notes" rows={3} placeholder="Helyszín, kontakt, speciális teendő..." style={{ width: '100%' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Mégse</button>
                <button type="submit" className="btn-primary">Feladat Rögzítése</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
