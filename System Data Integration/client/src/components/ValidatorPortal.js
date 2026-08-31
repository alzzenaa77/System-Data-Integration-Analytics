import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import FeeInsightsDashboard from './FeeInsightsDashboard';
import AuditReport from './AuditReport';
import { exportFeeData, exportCrossData, exportAuditReport } from '../utils/exportUtils';

const ROLE_OPTIONS = ['CONTRIBUTOR', 'VALIDATOR', 'PARTNER', 'SPV_MANAGER_PM'];

const ROLE_COLORS = {
  CONTRIBUTOR: { bg: '#e8f5e9', color: '#2e7d32' },
  VALIDATOR: { bg: '#e3f2fd', color: '#1565c0' },
  PARTNER: { bg: '#fff8e1', color: '#f57f17' },
  SPV_MANAGER_PM: { bg: '#fce4ec', color: '#880e4f' }
};

function ValidatorPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pending, setPending] = useState({ feeData: [], crossDivisionData: [] });
  const [feeData, setFeeData] = useState([]);
  const [crossData, setCrossData] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [filteredCrossData, setFilteredCrossData] = useState([]);
  const [message, setMessage] = useState('');
  const [pointRedemptions, setPointRedemptions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newRedemptionToast, setNewRedemptionToast] = useState(null);
  const [newPendingToast, setNewPendingToast] = useState(null);
  const prevPendingCountRef = useRef({ fee: 0, cross: 0 });

  // --- Audit Report State ---
  const [auditData, setAuditData] = useState({ feeData: [], crossData: [] });

  // --- User Control State ---
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ username: '', password: '', email: '', fullName: '', role: 'CONTRIBUTOR' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRole, setEditingRole] = useState('');

  const divisions = [
    'Accounting',
    'Customs',
    'Legal',
    'Tax Advisory',
    'Tax Compliance',
    'Tax Dispute',
    'Transfer Pricing'
  ];

  useEffect(() => {
    fetchPending();
    fetchPointRedemptions();
    if (activeTab === 'fee') {
      fetchFeeData();
    } else if (activeTab === 'cross') {
      fetchCrossData();
    } else if (activeTab === 'userControl') {
      fetchUsers();
    } else if (activeTab === 'auditReport') {
      fetchAuditReport();
    }
  }, [activeTab]);

  // Real-time polling for new redemptions AND new pending data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPointRedemptionsSilent();
      fetchPendingSilent();
    }, 5000);
    return () => clearInterval(interval);
  }, [unreadCount]);

  useEffect(() => {
    if (selectedDivision === 'all') {
      setFilteredCrossData(crossData);
    } else {
      setFilteredCrossData(crossData.filter(item => item.division_category === selectedDivision));
    }
  }, [selectedDivision, crossData]);

  const fetchPending = async () => {
    try {
      const response = await api.get('/validations/pending');
      setPending(response.data);
      // Seed prevPendingCountRef on first load
      if (prevPendingCountRef.current.fee === 0 && prevPendingCountRef.current.cross === 0) {
        prevPendingCountRef.current = {
          fee: response.data.feeData.length,
          cross: response.data.crossDivisionData.length
        };
      }
    } catch (error) {
      console.error('Failed to fetch pending:', error);
    }
  };

  const fetchPendingSilent = async () => {
    try {
      const response = await api.get('/validations/pending');
      const newFeeCount = response.data.feeData.length;
      const newCrossCount = response.data.crossDivisionData.length;
      const prev = prevPendingCountRef.current;
      if (newFeeCount > prev.fee || newCrossCount > prev.cross) {
        const added = (newFeeCount - prev.fee) + (newCrossCount - prev.cross);
        setNewPendingToast(`Ada ${added} data baru menunggu validasi!`);
        setTimeout(() => setNewPendingToast(null), 6000);
      }
      prevPendingCountRef.current = { fee: newFeeCount, cross: newCrossCount };
      setPending(response.data);
    } catch (error) {
      // silent
    }
  };

  const fetchFeeData = async () => {
    try {
      const response = await api.get('/dashboard/fee-competitor');
      setFeeData(response.data);
    } catch (error) {
      console.error('Failed to fetch fee data:', error);
    }
  };

  const fetchCrossData = async () => {
    try {
      const response = await api.get('/dashboard/cross-division');
      setCrossData(response.data);
    } catch (error) {
      console.error('Failed to fetch cross data:', error);
    }
  };

  const fetchAuditReport = async () => {
    try {
      const response = await api.get('/dashboard/audit-report');
      setAuditData(response.data || { feeData: [], crossData: [] });
    } catch (error) {
      console.error('Failed to fetch audit report:', error);
    }
  };

  const fetchPointRedemptions = async () => {
    try {
      const response = await api.get('/point-redemptions');
      setPointRedemptions(response.data);
      const pendingCount = response.data.filter(r => !r.reward_given).length;
      setUnreadCount(pendingCount);
    } catch (error) {
      console.error('Failed to fetch point redemptions:', error);
    }
  };

  const fetchPointRedemptionsSilent = async () => {
    try {
      const response = await api.get('/point-redemptions');
      const data = response.data;
      const newPending = data.filter(r => !r.reward_given).length;
      setPointRedemptions(data);
      setUnreadCount(prev => {
        if (newPending > prev) {
          const newest = data.filter(r => !r.reward_given).slice(-1)[0];
          setNewRedemptionToast(newest);
          setTimeout(() => setNewRedemptionToast(null), 6000);
        }
        return newPending;
      });
    } catch (error) {
      // silent
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleMarkRewardGiven = async (redemptionId) => {
    try {
      await api.post(`/mark-reward-given/${redemptionId}`);
      setMessage('Reward marked as given successfully!');
      fetchPointRedemptions();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: Failed to mark reward');
    }
  };

  const handleValidate = async (id, type, decision) => {
    const notes = prompt(`Enter validation notes for ${decision}:`);
    if (!notes) return;

    try {
      const endpoint = type === 'fee' ? `/fee-data/${id}/validate` : `/cross-division-data/${id}/validate`;
      await api.post(endpoint, { decision, notes });
      setMessage(`Data ${decision.toLowerCase()} successfully!`);
      fetchPending();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error?.message || 'Failed'));
    }
  };

  // --- User Control Handlers ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      await api.post('/users', addForm);
      setMessage('User berhasil ditambahkan!');
      setShowAddModal(false);
      setAddForm({ username: '', password: '', email: '', fullName: '', role: 'CONTRIBUTOR' });
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || 'Gagal menambahkan user';
      setAddError(msg);
    } finally {
      setAddLoading(false);
    }
  };

  const handleSaveRole = async (userId) => {
    try {
      await api.put(`/users/${userId}/role`, { role: editingRole });
      setMessage('Role berhasil diubah!');
      setEditingRoleId(null);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error?.message || 'Gagal mengubah role'));
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
    if (!window.confirm(`Yakin ingin ${action} user ini?`)) return;
    try {
      await api.put(`/users/${userId}/toggle-status`);
      setMessage(`User berhasil di${action}!`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error?.message || 'Gagal mengubah status'));
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Yakin ingin menghapus user "${username}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/users/${userId}`);
      setMessage(`User "${username}" berhasil dihapus!`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error?.message || 'Gagal menghapus user'));
    }
  };

  const filteredUsers = userFilter === 'all' ? users : users.filter(u => u.role === userFilter);

  return (
    <div>
      {/* Real-time Redemption Toast Notification */}
      {newRedemptionToast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white', borderRadius: '12px', padding: '16px 20px',
          boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
          minWidth: '300px', maxWidth: '380px',
          animation: 'slideInRight 0.4s ease-out',
          display: 'flex', alignItems: 'flex-start', gap: '12px'
        }}>
          <div style={{ fontSize: '24px', flexShrink: 0 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>Permintaan Penukaran Poin Baru!</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>
              <strong>{newRedemptionToast.contributor_name}</strong> mengajukan penukaran{' '}
              <strong>{newRedemptionToast.points} poin</strong>
            </p>
            <button
              onClick={() => { setActiveTab('redemptions'); setNewRedemptionToast(null); }}
              style={{
                marginTop: '10px', padding: '5px 12px', background: 'white',
                color: '#1e40af', border: 'none', borderRadius: '6px',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Lihat Detail →
            </button>
          </div>
          <button
            onClick={() => setNewRedemptionToast(null)}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', padding: 0, lineHeight: 1, flexShrink: 0 }}
          >×</button>
        </div>
      )}

      {/* ---- PENDING DATA TOAST ---- */}
      {newPendingToast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#1d4ed8', color: 'white', borderRadius: '12px',
          padding: '14px 18px', maxWidth: '340px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideIn 0.3s ease'
        }}>
          <span style={{ fontSize: '22px' }}>📋</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>Data Baru Masuk</p>
            <p style={{ margin: '2px 0 0', fontSize: '13px', opacity: 0.9 }}>{newPendingToast}</p>
          </div>
          <button
            onClick={() => setNewPendingToast(null)}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', padding: 0, lineHeight: 1 }}
          >×</button>
        </div>
      )}

      <div className="header">
        <div className="header-content">
          <div className="header-logo">
            <img src="/muc-logo.png" alt="MUC Consulting" className="muc-logo" />
            <h1>Validator Portal</h1>
          </div>
          <div className="user-info">
            {user.fullName} ({user.username})
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        </div>
        <div className="nav">
          <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
            Pending Validations
            {(pending.feeData.length + pending.crossDivisionData.length) > 0 && (
              <span className="tab-badge">{pending.feeData.length + pending.crossDivisionData.length}</span>
            )}
          </button>
          <button className={activeTab === 'fee' ? 'active' : ''} onClick={() => setActiveTab('fee')}>Fee Competitor</button>
          <button className={activeTab === 'cross' ? 'active' : ''} onClick={() => setActiveTab('cross')}>Cross-Division</button>
          <button className={activeTab === 'redemptions' ? 'active' : ''} onClick={() => setActiveTab('redemptions')}>
            Point Redemptions
            {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </button>
          <button className={activeTab === 'userControl' ? 'active' : ''} onClick={() => setActiveTab('userControl')}>
            👥 User Control
          </button>
          <button className={activeTab === 'auditReport' ? 'active' : ''} onClick={() => setActiveTab('auditReport')}>
            📊 Audit Report
          </button>
        </div>
      </div>

      <div className="container">
        {message && <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>{message}</div>}

        {/* ---- PENDING TAB ---- */}
        {activeTab === 'pending' && (
          <div>
            <div className="card">
              <h2>Pending Fee Data</h2>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Submitter</th>
                      <th>Service Provider</th>
                      <th>Service Recipient</th>
                      <th>Service Type</th>
                      <th>Tax Year</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.feeData.map(item => (
                      <React.Fragment key={item.id}>
                        <tr>
                          <td>
                            <div className="submitter-info">
                              <strong>{item.submitter_name}</strong>
                              <small>{item.submitter_division}</small>
                            </div>
                          </td>
                          <td>{item.service_provider}</td>
                          <td>{item.service_recipient}</td>
                          <td>{item.service_type}</td>
                          <td>{item.tax_year}</td>
                          <td>
                            <strong>{item.currency} {Number(item.fee_amount).toLocaleString()}</strong>
                            <small className="fee-scheme">{item.fee_scheme}</small>
                          </td>
                          <td>
                            <span className={`badge badge-${item.status.toLowerCase().replace('_', '-')}`}>{item.status}</span>
                            {item.clarification_submitted && item.clarification_text && (
                              <div style={{ marginTop: '5px', fontSize: '11px', color: '#17a2b8' }}>
                                📝 Clarification provided
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              <button className="btn btn-success" onClick={() => handleValidate(item.id, 'fee', 'ACCEPT')}>Accept</button>
                              <button className="btn btn-warning" onClick={() => handleValidate(item.id, 'fee', 'NEED_CLARIFICATION')}>Clarify</button>
                              <button className="btn btn-danger" onClick={() => handleValidate(item.id, 'fee', 'REJECT')}>Reject</button>
                            </div>
                          </td>
                        </tr>
                        {item.clarification_submitted && item.clarification_text && (
                          <tr className="clarification-row">
                            <td colSpan="8" style={{ background: '#f0f8ff', padding: '15px', borderLeft: '4px solid #17a2b8' }}>
                              <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                                <div style={{ fontSize: '20px' }}>💬</div>
                                <div style={{ flex: 1 }}>
                                  <strong style={{ color: '#17a2b8', display: 'block', marginBottom: '5px' }}>
                                    Clarification from Contributor:
                                  </strong>
                                  <p style={{ margin: 0, color: '#333', lineHeight: '1.5' }}>{item.clarification_text}</p>
                                  {item.clarification_submitted_at && (
                                    <small style={{ color: '#666', display: 'block', marginTop: '8px' }}>
                                      Submitted: {new Date(item.clarification_submitted_at).toLocaleString('id-ID')}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h2>Pending Cross-Division Data</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.crossDivisionData.map(item => (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td>{item.title}</td>
                        <td>{item.division_category}</td>
                        <td>
                          <span className={`badge badge-${item.status.toLowerCase().replace('_', '-')}`}>{item.status}</span>
                          {item.clarification_submitted && item.clarification_text && (
                            <div style={{ marginTop: '5px', fontSize: '11px', color: '#17a2b8' }}>
                              📝 Clarification provided
                            </div>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-success" style={{ marginRight: '5px' }} onClick={() => handleValidate(item.id, 'cross', 'ACCEPT')}>Accept</button>
                          <button className="btn btn-warning" style={{ marginRight: '5px' }} onClick={() => handleValidate(item.id, 'cross', 'NEED_CLARIFICATION')}>Clarify</button>
                          <button className="btn btn-danger" onClick={() => handleValidate(item.id, 'cross', 'REJECT')}>Reject</button>
                        </td>
                      </tr>
                      {item.clarification_submitted && item.clarification_text && (
                        <tr className="clarification-row">
                          <td colSpan="4" style={{ background: '#f0f8ff', padding: '15px', borderLeft: '4px solid #17a2b8' }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                              <div style={{ fontSize: '20px' }}>💬</div>
                              <div style={{ flex: 1 }}>
                                <strong style={{ color: '#17a2b8', display: 'block', marginBottom: '5px' }}>
                                  Clarification from Contributor:
                                </strong>
                                <p style={{ margin: 0, color: '#333', lineHeight: '1.5' }}>{item.clarification_text}</p>
                                {item.clarification_submitted_at && (
                                  <small style={{ color: '#666', display: 'block', marginTop: '8px' }}>
                                    Submitted: {new Date(item.clarification_submitted_at).toLocaleString('id-ID')}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- FEE TAB ---- */}
        {activeTab === 'fee' && (
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0 }}>Fee Competitor Dashboard</h2>
                <button
                  onClick={() => exportFeeData(feeData, 'fee_competitor_data')}
                  style={{ padding: '7px 14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  disabled={feeData.length === 0}
                >⬇️ Export CSV</button>
              </div>
              <p style={{ color: '#666', marginBottom: '20px' }}>Comprehensive analysis and data of accepted fee submissions</p>
            </div>
            <FeeInsightsDashboard feeData={feeData} />
            <div className="card" style={{ marginTop: '20px' }}>
              <h3>Fee Data Table</h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Submitter</th>
                      <th>Service Provider</th>
                      <th>Service Recipient</th>
                      <th>Service Type</th>
                      <th>Tax Year</th>
                      <th>Financial Type</th>
                      <th>Fee Scheme</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeData.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="submitter-info">
                            <strong>{item.submitter_name}</strong>
                            <small>{item.submitter_division}</small>
                          </div>
                        </td>
                        <td>{item.service_provider}</td>
                        <td>{item.service_recipient}</td>
                        <td>{item.service_type}</td>
                        <td>{item.tax_year}</td>
                        <td><span className="badge badge-info">{item.financial_type}</span></td>
                        <td>{item.fee_scheme}</td>
                        <td><strong>{item.currency} {Number(item.fee_amount).toLocaleString()}</strong></td>
                        <td>{new Date(item.financial_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---- CROSS-DIVISION TAB ---- */}
        {activeTab === 'cross' && (
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0 }}>Cross-Division Data by Division</h2>
                <button
                  onClick={() => exportCrossData(filteredCrossData, 'cross_division_data')}
                  style={{ padding: '7px 14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  disabled={filteredCrossData.length === 0}
                >⬇️ Export CSV</button>
              </div>
              <div className="division-filter-tabs">
                <button
                  className={`division-tab ${selectedDivision === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedDivision('all')}
                >
                  All Divisions ({crossData.length})
                </button>
                {divisions.map(division => {
                  const count = crossData.filter(item => item.division_category === division).length;
                  return (
                    <button
                      key={division}
                      className={`division-tab ${selectedDivision === division ? 'active' : ''}`}
                      onClick={() => setSelectedDivision(division)}
                    >
                      {division} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <h3>{selectedDivision === 'all' ? 'All Divisions' : selectedDivision}</h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Submission Date</th>
                      <th>Description</th>
                      <th>Attachment</th>
                      <th>Contributor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCrossData.length > 0 ? (
                      filteredCrossData.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.title}</strong></td>
                          <td><span className="badge badge-info">{item.division_category}</span></td>
                          <td>{item.submission_date ? new Date(item.submission_date).toLocaleDateString() : '-'}</td>
                          <td style={{ maxWidth: '300px' }}>{item.description}</td>
                          <td>
                            {item.attachment_url ? (
                              <a href={item.attachment_url} target="_blank" rel="noopener noreferrer" className="btn-link">
                                📄 {item.attachment_name || 'View File'}
                              </a>
                            ) : item.attachment_name ? (
                              <span style={{ color: '#333', fontSize: '13px' }}>📄 {item.attachment_name}</span>
                            ) : (
                              <span style={{ color: '#999' }}>No file</span>
                            )}
                          </td>
                          <td>{item.contributor_name || 'Unknown'}</td>
                          <td>
                            <span className={`badge badge-${(item.status || 'pending').toLowerCase().replace('_', '-')}`}>
                              {item.status || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                          No data available for {selectedDivision === 'all' ? 'any division' : selectedDivision}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---- REDEMPTIONS TAB ---- */}
        {activeTab === 'redemptions' && (
          <div className="card">
            <h2>Point Redemption Tracking</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Track and manage contributor point redemptions</p>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Contributor</th>
                    <th>Points Redeemed</th>
                    <th>Status</th>
                    <th>Reward Given At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pointRedemptions.length > 0 ? (
                    pointRedemptions.map(redemption => (
                      <tr key={redemption.id} className={redemption.reward_given ? 'reward-given-row' : ''}>
                        <td>{new Date(redemption.created_at).toLocaleString('id-ID')}</td>
                        <td>
                          <strong>{redemption.contributor_name}</strong>
                          <br />
                          <small style={{ color: '#666' }}>ID: {redemption.contributor_id}</small>
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ fontSize: '14px', padding: '6px 12px' }}>
                            {redemption.points} points
                          </span>
                        </td>
                        <td>
                          {redemption.reward_given ? (
                            <span className="badge" style={{ background: '#28a745', color: 'white' }}>✅ Reward Given</span>
                          ) : (
                            <span className="badge" style={{ background: '#ffc107', color: 'black' }}>⏳ Pending</span>
                          )}
                        </td>
                        <td>
                          {redemption.reward_given_at ? (
                            <span style={{ color: '#28a745', fontSize: '13px' }}>
                              {new Date(redemption.reward_given_at).toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                        <td>
                          {!redemption.reward_given ? (
                            <button className="btn btn-success btn-sm" onClick={() => handleMarkRewardGiven(redemption.id)}>
                              Mark as Given
                            </button>
                          ) : (
                            <span style={{ color: '#28a745', fontSize: '13px' }}>✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No point redemptions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- USER CONTROL TAB ---- */}
        {activeTab === 'userControl' && (
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>👥 User Control</h2>
                  <p style={{ color: '#666', margin: '4px 0 0' }}>Kelola akun pengguna dan role akses berdasarkan kebutuhan</p>
                </div>
                <button
                  className="btn btn-success"
                  style={{ padding: '10px 20px', fontWeight: 600, fontSize: '14px' }}
                  onClick={() => { setShowAddModal(true); setAddError(''); }}
                >
                  + Tambah User
                </button>
              </div>

              {/* Role Filter */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', ...ROLE_OPTIONS].map(r => (
                  <button
                    key={r}
                    onClick={() => setUserFilter(r)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: userFilter === r ? '2px solid #1e40af' : '2px solid #e0e0e0',
                      background: userFilter === r ? '#1e40af' : 'white',
                      color: userFilter === r ? 'white' : '#555',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {r === 'all' ? `Semua (${users.length})` : `${r} (${users.filter(u => u.role === r).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="card">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Dibuat</th>
                      <th style={{ minWidth: '200px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                      <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.55 }}>
                        <td>
                          <strong>{u.username}</strong>
                          {u.id === user.id && (
                            <span style={{ marginLeft: '6px', fontSize: '11px', background: '#e3f2fd', color: '#1565c0', borderRadius: '4px', padding: '1px 6px' }}>
                              Anda
                            </span>
                          )}
                        </td>
                        <td>{u.fullName}</td>
                        <td style={{ fontSize: '13px', color: '#555' }}>{u.email}</td>
                        <td>
                          {editingRoleId === u.id ? (
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                              <select
                                value={editingRole}
                                onChange={e => setEditingRole(e.target.value)}
                                style={{
                                  padding: '4px 8px', borderRadius: '6px',
                                  border: '1px solid #1e40af', fontSize: '12px',
                                  background: 'white', cursor: 'pointer'
                                }}
                              >
                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <button
                                onClick={() => handleSaveRole(u.id)}
                                style={{ padding: '3px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingRoleId(null)}
                                style={{ padding: '3px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span
                              onClick={() => { if (u.id !== user.id) { setEditingRoleId(u.id); setEditingRole(u.role); } }}
                              style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.3px',
                                background: (ROLE_COLORS[u.role] || {}).bg || '#eee',
                                color: (ROLE_COLORS[u.role] || {}).color || '#333',
                                cursor: u.id !== user.id ? 'pointer' : 'default',
                                border: '1.5px solid transparent',
                                transition: 'border-color 0.2s',
                                title: u.id !== user.id ? 'Klik untuk mengubah role' : ''
                              }}
                              title={u.id !== user.id ? 'Klik untuk mengubah role' : 'Role Anda sendiri'}
                            >
                              {u.role}
                              {u.id !== user.id && <span style={{ marginLeft: '4px', opacity: 0.6 }}>✏️</span>}
                            </span>
                          )}
                        </td>
                        <td>
                          {u.isActive ? (
                            <span style={{ color: '#28a745', fontWeight: 600, fontSize: '13px' }}>● Aktif</span>
                          ) : (
                            <span style={{ color: '#dc3545', fontWeight: 600, fontSize: '13px' }}>● Nonaktif</span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: '#888' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {u.id !== user.id && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(u.id, u.isActive)}
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    background: u.isActive ? '#fff3cd' : '#d4edda',
                                    color: u.isActive ? '#856404' : '#155724'
                                  }}
                                >
                                  {u.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    background: '#f8d7da',
                                    color: '#721c24'
                                  }}
                                >
                                  🗑️ Hapus
                                </button>
                              </>
                            )}
                            {u.id === user.id && (
                              <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                          Tidak ada user dengan role {userFilter}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---- ADD USER MODAL ---- */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#1e40af' }}>➕ Tambah User Baru</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#999' }}
              >×</button>
            </div>

            {addError && (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                ⚠️ {addError}
              </div>
            )}

            <form onSubmit={handleAddUser}>
              {[
                { label: 'Username', key: 'username', type: 'text', placeholder: 'cth: john.doe' },
                { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'cth: John Doe' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'cth: john@muc.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 6 karakter' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '13px', color: '#374151' }}>
                    {label} <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type={type}
                    value={addForm[key]}
                    onChange={e => setAddForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db',
                      borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                      outline: 'none', transition: 'border-color 0.2s',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '13px', color: '#374151' }}>
                  Role <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select
                  value={addForm.role}
                  onChange={e => setAddForm(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                    background: 'white', cursor: 'pointer', fontFamily: 'inherit'
                  }}
                >
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1, padding: '12px', background: '#f3f4f6',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '14px', color: '#374151'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  style={{
                    flex: 1, padding: '12px',
                    background: addLoading ? '#93c5fd' : '#1e40af',
                    border: 'none', borderRadius: '8px', cursor: addLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: '14px', color: 'white',
                    transition: 'background 0.2s'
                  }}
                >
                  {addLoading ? 'Menyimpan...' : '✓ Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- AUDIT REPORT TAB ---- */}
      {activeTab === 'auditReport' && (
        <div className="container" style={{ paddingTop: '24px' }}>
          <AuditReport feeData={auditData.feeData} crossData={auditData.crossData} />
        </div>
      )}
    </div>
  );
}

export default ValidatorPortal;
