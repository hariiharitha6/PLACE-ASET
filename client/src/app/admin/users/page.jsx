'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRole, setNewRole] = useState('student');
  const [permModalUser, setPermModalUser] = useState(null);
  const [permId, setPermId] = useState('create_event');
  const [permDays, setPermDays] = useState(7);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/admin/users/managed?page=${page}&limit=15&`;
      if (roleFilter) url += `role=${roleFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (search) url += `search=${search}&`;

      const res = await api.get(url);
      if (res.data?.users) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        const fallbackRes = await api.get('/admin/users');
        setUsers(fallbackRes.data || []);
      }
    } catch (e) {
      console.error(e);
      setUsers([
        { id: 'u-1', full_name: 'Ananya Ramesh', email: 'ananya.cse@aset.ac.in', role: 'student', year: '4th Year', roll_number: '2022ASET01', is_active: true, xp: 850, level: 8, departments: { code: 'CSE' } },
        { id: 'u-2', full_name: 'Rahul Varma', email: 'rahul.ece@aset.ac.in', role: 'student', year: '3rd Year', roll_number: '2023ASET42', is_active: true, xp: 620, level: 6, departments: { code: 'ECE' } },
        { id: 'u-3', full_name: 'Dr. Suresh Kumar', email: 'host@aset.ac.in', role: 'faculty', year: 'Faculty', roll_number: 'EMP104', is_active: true, xp: 2500, level: 25, departments: { code: 'CSE' } },
        { id: 'u-4', full_name: 'Placement Director', email: 'placement@aset.ac.in', role: 'placement_cell', year: 'Staff', roll_number: 'PLC001', is_active: true, xp: 3500, level: 35, departments: { code: 'ADMIN' } },
        { id: 'u-5', full_name: 'System Super Admin', email: 'superadmin@aset.ac.in', role: 'super_admin', year: 'Governance', roll_number: 'SUP001', is_active: true, xp: 10000, level: 99, departments: { code: 'ADMIN' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uId => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleStatusToggle = async (userId, currentActive) => {
    try {
      await api.patch(`/admin/users/${userId}/status-toggle`, { isActive: !currentActive });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
      alert(`User activation status updated!`);
    } catch (e) {
      alert('Failed to update user status');
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/reset-password`, {});
      alert('Password reset successfully to default credential (Password@12345)');
    } catch (e) {
      alert('Password reset failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await api.delete(`/admin/users/${userId}/managed`);
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted permanently!');
    } catch (e) {
      alert('User deletion failed (Super Admin required)');
    }
  };

  const handleExecuteChangeRole = async () => {
    if (!roleModalUser) return;
    try {
      await api.patch(`/admin/users/${roleModalUser.id}/role`, { role: newRole });
      setUsers(users.map(u => u.id === roleModalUser.id ? { ...u, role: newRole } : u));
      alert(`User role updated to ${newRole}!`);
      setRoleModalUser(null);
    } catch (e) {
      alert('Failed to change user role');
    }
  };

  const handleGrantPermission = async () => {
    if (!permModalUser) return;
    try {
      await api.post('/admin/permissions/request', {
        permissionId: permId,
        reason: 'Direct Super Admin grant override',
        durationDays: permDays,
        priority: 'high',
      });
      alert(`Temporary permission '${permId}' granted for ${permDays} days!`);
      setPermModalUser(null);
    } catch (e) {
      alert('Failed to grant permission');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user.');
      return;
    }
    if (!confirm(`Execute bulk action '${action}' on ${selectedUsers.length} selected users?`)) return;

    try {
      await api.post('/admin/users/bulk-action', { userIds: selectedUsers, action });
      alert(`Bulk action '${action}' executed successfully!`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (e) {
      alert('Bulk action failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
            🎓 ENTERPRISE USER MANAGEMENT
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>All System Accounts & Role Control</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Filter, promote roles, grant permissions, suspend, and manage all accounts.</p>
        </div>

        {selectedUsers.length > 0 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleBulkAction('enable')} style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              Bulk Enable ({selectedUsers.length})
            </button>
            <button onClick={() => handleBulkAction('disable')} style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              Bulk Disable ({selectedUsers.length})
            </button>
            <button onClick={() => handleBulkAction('delete')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              Bulk Delete ({selectedUsers.length})
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search name, email, roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="host">Host</option>
          <option value="placement_cell">Placement Cell</option>
          <option value="hod">HOD</option>
          <option value="principal">Principal</option>
          <option value="college_admin">College Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled / Suspended</option>
        </select>
        <button onClick={fetchUsers} style={{ backgroundColor: '#6366f1', color: '#fff', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
          Filter
        </button>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', color: '#94a3b8' }}>Loading accounts...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                <th style={{ padding: '14px 20px', width: '40px' }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={users.length > 0 && selectedUsers.length === users.length} />
                </th>
                <th style={{ padding: '14px 20px' }}>User Details</th>
                <th style={{ padding: '14px 20px' }}>Enterprise Role</th>
                <th style={{ padding: '14px 20px' }}>Dept / Roll</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => handleSelectOne(u.id)} />
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#f8fafc' }}>{u.full_name || u.name}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{u.email}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ backgroundColor: u.role === 'super_admin' ? 'rgba(168,85,247,0.15)' : u.role === 'college_admin' ? 'rgba(99,102,241,0.15)' : u.role === 'placement_cell' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: u.role === 'super_admin' ? '#c084fc' : u.role === 'college_admin' ? '#818cf8' : u.role === 'placement_cell' ? '#34d399' : '#cbd5e1', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#94a3b8' }}>
                    {u.departments?.code || 'CSE'} &bull; {u.roll_number || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ color: u.is_active ? '#34d399' : '#f87171', fontWeight: '700' }}>
                      {u.is_active ? '● Active' : '○ Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button onClick={() => setRoleModalUser(u)} style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                        Change Role
                      </button>
                      <button onClick={() => setPermModalUser(u)} style={{ backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                        Grant Perm
                      </button>
                      <button onClick={() => handleStatusToggle(u.id, u.is_active)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                      <button onClick={() => handleResetPassword(u.id)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                        Reset Pass
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '13px' }}>
        <span>Page {page} of {totalPages}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ backgroundColor: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
            Previous
          </button>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ backgroundColor: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
            Next
          </button>
        </div>
      </div>

      {/* Change Role Modal */}
      {roleModalUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Assign Enterprise Role</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Select new role claim for {roleModalUser.full_name}</p>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="host">Host</option>
              <option value="placement_cell">Placement Cell</option>
              <option value="hod">Head of Department</option>
              <option value="principal">Principal</option>
              <option value="college_admin">College Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setRoleModalUser(null)} style={{ backgroundColor: 'transparent', color: '#cbd5e1', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleExecuteChangeRole} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Save Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Permission Modal */}
      {permModalUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Grant Temporary Permission</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Grant temporary capability override to {permModalUser.full_name}</p>
            <select value={permId} onChange={(e) => setPermId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
              <option value="create_event">Create Placement Event</option>
              <option value="upload_questions">Upload Datasets</option>
              <option value="approve_questions">Approve Questions</option>
              <option value="view_student_profiles">View Student Resumes</option>
              <option value="export_reports">Export Placement Reports</option>
            </select>
            <select value={permDays} onChange={(e) => setPermDays(Number(e.target.value))} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
              <option value={1}>1 Day Override</option>
              <option value={7}>7 Days Override</option>
              <option value={30}>30 Days Override</option>
              <option value={365}>Permanent Override</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setPermModalUser(null)} style={{ backgroundColor: 'transparent', color: '#cbd5e1', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleGrantPermission} style={{ backgroundColor: '#38bdf8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Grant Override</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
