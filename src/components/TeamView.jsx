import React, { useState } from 'react';
import { 
  Users, UserPlus, Phone, Mail, Shield, Radio, Key, Edit2, 
  Trash2, CheckSquare, ShoppingCart, Check, X, Tag
} from 'lucide-react';

export function TeamView({ 
  users, 
  onUpdateUsers, 
  tasks = [], 
  shoppingList = [], 
  onAddLog, 
  currentUser, 
  searchQuery = '' 
}) {
  const [filterBadge, setFilterBadge] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const badges = [
    'Összes szakterület',
    'Technika',
    'Helyszín',
    'Elnökség',
    'Pénzügy',
    'Biztonság',
    'Önkéntes'
  ];

  const filteredUsers = users.filter(u => {
    const matchesBadge = filterBadge === 'all' || u.badge === filterBadge;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.badge && u.badge.toLowerCase().includes(q));
    return matchesBadge && matchesSearch;
  });

  const getTaskCount = (userName) => {
    return tasks.filter(t => t.assignedTo === userName && !t.completed).length;
  };

  const getShoppingCount = (userName) => {
    return shoppingList.filter(s => s.responsible === userName && !s.isPurchased).length;
  };

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedUser({
      id: 'usr-' + Date.now(),
      name: '',
      role: '',
      badge: 'Technika',
      phone: '+36 ',
      email: '',
      pin: '1532',
      radio: 'URH Ch-1'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setIsNew(false);
    setSelectedUser({ ...user });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId, userName) => {
    if (users.length <= 1) {
      alert('Legalább egy szervezőnek maradnia kell a rendszerben!');
      return;
    }
    if (window.confirm(`Biztosan törölni szeretnéd "${userName}" szervezőt a stábból?`)) {
      const updated = users.filter(u => u.id !== userId);
      onUpdateUsers(updated);
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Szervezők & Csapat',
        description: `Eltávolította a szervezőt a rendszerből: "${userName}"`
      });
    }
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...selectedUser,
      name: formData.get('name').trim(),
      role: formData.get('role').trim(),
      badge: formData.get('badge'),
      phone: formData.get('phone').trim(),
      email: formData.get('email').trim(),
      pin: formData.get('pin').trim() || '1532',
      radio: formData.get('radio').trim()
    };

    if (!updated.name) {
      alert('A név megadása kötelező!');
      return;
    }

    if (isNew) {
      onUpdateUsers([...users, updated]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Szervezők & Csapat',
        description: `Új szervezőt rögzített a stábba: "${updated.name}" (${updated.role} • PIN: ${updated.pin})`
      });
    } else {
      onUpdateUsers(users.map(u => u.id === updated.id ? updated : u));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Szervezők & Csapat',
        description: `Módosította "${updated.name}" szervezői adatait (PIN: ${updated.pin})`
      });
    }

    setIsModalOpen(false);
  };

  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Technika':
        return { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' };
      case 'Elnökség':
        return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
      case 'Pénzügy':
        return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
      case 'Helyszín':
        return { bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' };
      case 'Biztonság':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      default:
        return { bg: '#e2e8f0', color: '#0f172a', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Top Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={15} color="#2563eb" /> Regisztrált Szervezők & Stáb
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>
            {users.length} fő
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Bárki beléphet, akinek kódot adsz
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#92400e', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={15} color="#d97706" /> Műszaki & Technikai Stáb
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', marginTop: '4px' }}>
            {users.filter(u => u.badge === 'Technika').length} fő
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Hang, fény, színpadmesterek, áram
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#14532d', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={15} color="#059669" /> Központi Mester PIN Kód
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#047857', marginTop: '4px', letterSpacing: '0.05em' }}>
            1532
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            + Egyedi személyes PIN is megadható
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {badges.map((badge) => {
            const isAll = badge === 'Összes szakterület';
            const value = isAll ? 'all' : badge;
            const isSelected = filterBadge === value;
            return (
              <button
                key={badge}
                onClick={() => setFilterBadge(value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? '800' : '600',
                  backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#0f172a',
                  border: '1.5px solid',
                  borderColor: isSelected ? '#1d4ed8' : '#cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {badge}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <UserPlus size={16} /> Új Szervező / Stábtag Hozzáadása
        </button>
      </div>

      {/* Organizers List Table */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Szervező Neve & Profil</th>
              <th>Munkakör / Felelősség</th>
              <th>Szakterület</th>
              <th>Elérhetőség (Telefon / Email)</th>
              <th>URH Rádió</th>
              <th>Belépési PIN</th>
              <th>Függő Feladatok</th>
              <th style={{ textAlign: 'right' }}>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#475569' }}>
                  Nem található szervező a megadott szűrési feltételekkel.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const badgeStyle = getBadgeStyle(user.badge);
                const pendingTasks = getTaskCount(user.name);
                const pendingShopping = getShoppingCount(user.name);
                const isCurrentUser = currentUser === user.name;

                return (
                  <tr key={user.id} style={{ backgroundColor: isCurrentUser ? '#eff6ff' : undefined }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '14px',
                          flexShrink: 0
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', color: '#000000', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {user.name}
                            {isCurrentUser && (
                              <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '800' }}>
                                Te vagy belépve
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>
                        {user.role || '—'}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 9px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: '800',
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`
                      }}>
                        <Tag size={11} /> {user.badge}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                        {user.phone ? (
                          <a
                            href={`tel:${user.phone}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}
                          >
                            <Phone size={12} /> {user.phone}
                          </a>
                        ) : (
                          <span style={{ color: '#64748b' }}>Nincs telefon</span>
                        )}
                        {user.email ? (
                          <a
                            href={`mailto:${user.email}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0f172a', textDecoration: 'none', fontSize: '11.5px' }}
                          >
                            <Mail size={11} /> {user.email}
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: '#92400e',
                        fontWeight: '700',
                        backgroundColor: '#fef3c7',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fde68a'
                      }}>
                        <Radio size={12} /> {user.radio || 'URH Ch-1'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: '800',
                        fontSize: '13px',
                        color: '#166534',
                        backgroundColor: '#dcfce7',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid #86efac'
                      }}>
                        {user.pin || '1532'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span
                          title="Függő To-Do feladatok"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            backgroundColor: pendingTasks > 0 ? '#fef3c7' : '#f1f5f9',
                            color: pendingTasks > 0 ? '#92400e' : '#64748b',
                            border: '1px solid',
                            borderColor: pendingTasks > 0 ? '#fde68a' : '#cbd5e1'
                          }}
                        >
                          <CheckSquare size={12} /> {pendingTasks} teendő
                        </span>
                        <span
                          title="Függő beszerzési tételek"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            backgroundColor: pendingShopping > 0 ? '#fce7f3' : '#f1f5f9',
                            color: pendingShopping > 0 ? '#9d174d' : '#64748b',
                            border: '1px solid',
                            borderColor: pendingShopping > 0 ? '#fbcfe8' : '#cbd5e1'
                          }}
                        >
                          <ShoppingCart size={12} /> {pendingShopping} beszerzés
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Szerkesztés"
                          style={{
                            color: '#2563eb',
                            padding: '5px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          title="Törlés"
                          style={{
                            color: '#dc2626',
                            padding: '5px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#2563eb" />
                {isNew ? 'Új Szervező / Stábtag Hozzáadása' : `${selectedUser.name} adatainak szerkesztése`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Szervező / Stábtag Neve *
                    </label>
                    <input
                      name="name"
                      defaultValue={selectedUser.name}
                      required
                      placeholder="pl. Kovács Péter"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Szakterület / Részleg
                    </label>
                    <select name="badge" defaultValue={selectedUser.badge} style={{ width: '100%' }}>
                      <option value="Technika">Technika (Hang, Fény, Színpad, Áram)</option>
                      <option value="Helyszín">Helyszín (Standok, Zsákok, Tisztaság)</option>
                      <option value="Elnökség">Elnökség & Főszervezés</option>
                      <option value="Pénzügy">Pénzügy & Pályázat</option>
                      <option value="Biztonság">Biztonság & Mentők</option>
                      <option value="Önkéntes">Önkéntes Csapat</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Munkakör / Felelősségi Kör *
                  </label>
                  <input
                    name="role"
                    defaultValue={selectedUser.role}
                    required
                    placeholder="pl. Fénytechnikus & Lézershow, vagy Borok Tere Felelős"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Telefonszám (Helyszíni eléréshez)
                    </label>
                    <input
                      name="phone"
                      defaultValue={selectedUser.phone}
                      placeholder="+36 30 123 4567"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      E-mail cím
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={selectedUser.email}
                      placeholder="peter@ktsze.hu"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Belépési PIN Kód (Ezzel léphet be a rendszerbe)
                    </label>
                    <input
                      name="pin"
                      defaultValue={selectedUser.pin || '1532'}
                      required
                      placeholder="1532"
                      style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }}
                    />
                    <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '3px' }}>
                      Alapértelmezett: 1532, vagy adj meg egyedi kódot.
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      URH Rádiócsatorna
                    </label>
                    <input
                      name="radio"
                      defaultValue={selectedUser.radio || 'URH Ch-1'}
                      placeholder="pl. URH Ch-1 (Főszervezők)"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px' }}
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontWeight: '700' }}
                >
                  {isNew ? 'Szervező Mentése' : 'Módosítások Mentése'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
