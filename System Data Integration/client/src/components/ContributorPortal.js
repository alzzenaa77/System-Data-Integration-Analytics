import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ClarificationModal from './ClarificationModal';
import { exportFeeData, exportCrossData } from '../utils/exportUtils';

function ContributorPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('submit-fee');
  const [myData, setMyData] = useState({ feeData: [], crossDivisionData: [] });
  const [points, setPoints] = useState({
    totalPoints: 0,
    canRedeem: false,
    redeemableMultiples: 0,
    history: [],
    lastRedemptionDate: null,
    nextRedemptionDate: null
  });
  const [message, setMessage] = useState('');
  const [redeemAmount, setRedeemAmount] = useState(5);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [selectedDataForClarification, setSelectedDataForClarification] = useState(null);
  const [redemptions, setRedemptions] = useState([]);

  const [feeForm, setFeeForm] = useState({
    // Identitas Pengisi
    submitterName: '',
    submitterDivision: '',
    submitterInputDate: '',
    // Identitas
    serviceProvider: '',
    serviceRecipient: '',
    // Detail Jasa
    serviceType: '',
    scopeOfWork: '',
    taxYear: '',
    // Financial Data
    financialType: '',
    financialDescription: '',
    feeScheme: '',
    feeAmount: '',
    currency: 'IDR',
    financialDate: ''
  });

  const [showCustomServiceType, setShowCustomServiceType] = useState(false);
  const [customServiceType, setCustomServiceType] = useState('');

  // Predefined service types (dapat ditambah via "+ Tambah Baru")
  const serviceTypes = [
    'Tax Compliance',
    'Tax Dispute',
    'Transfer Pricing'
  ];

  // Daftar divisi (dipakai di form fee & cross-division)
  const divisionList = [
    'Accounting',
    'Customs',
    'Legal',
    'Tax Advisory',
    'Tax Compliance',
    'Tax Dispute',
    'Transfer Pricing'
  ];

  const [crossForm, setCrossForm] = useState({
    title: '',
    divisionCategory: '',
    description: '',
    submissionDate: '',
    attachment: null
  });

  useEffect(() => {
    if (activeTab === 'my-data') {
      fetchMyData();
    } else if (activeTab === 'my-points') {
      fetchMyData(); // Need myData for Pending Review count
      fetchPoints();
      fetchRedemptions();
    }
  }, [activeTab]);

  // Fetch myData on mount so badge count shows immediately on any tab
  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const response = await api.get('/my-data');
      console.log('=== FETCH MY DATA ===');
      console.log('Fee Data Count:', response.data.feeData.length);
      console.log('Fee Data IDs:', response.data.feeData.map(d => ({ id: d.id, status: d.status })));
      console.log('Cross Division Data Count:', response.data.crossDivisionData.length);

      // Deduplicate data - keep only unique IDs (in case of bugs)
      const uniqueFeeData = Array.from(
        new Map(response.data.feeData.map(item => [item.id, item])).values()
      );

      const uniqueCrossData = Array.from(
        new Map(response.data.crossDivisionData.map(item => [item.id, item])).values()
      );

      if (uniqueFeeData.length !== response.data.feeData.length) {
        console.warn('WARNING: Duplicate fee data detected and removed!');
      }

      if (uniqueCrossData.length !== response.data.crossDivisionData.length) {
        console.warn('WARNING: Duplicate cross-division data detected and removed!');
      }

      console.log('After dedup - Fee Data Count:', uniqueFeeData.length);
      console.log('=== END FETCH ===');

      setMyData({
        feeData: uniqueFeeData,
        crossDivisionData: uniqueCrossData
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchPoints = async () => {
    try {
      const response = await api.get('/my-points');
      setPoints(response.data);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const response = await api.get('/my-redemptions');
      setRedemptions(response.data);
    } catch (error) {
      console.error('Failed to fetch redemptions:', error);
    }
  };

  const handleSubmitFee = async (e) => {
    e.preventDefault();
    try {
      // Use custom service type if "add new" was selected
      const finalServiceType = showCustomServiceType ? customServiceType : feeForm.serviceType;

      await api.post('/fee-data', {
        ...feeForm,
        serviceType: finalServiceType
      });
      setMessage('Data fee berhasil disubmit!');
      setFeeForm({
        submitterName: '', submitterDivision: '', submitterInputDate: '',
        serviceProvider: '', serviceRecipient: '',
        serviceType: '', scopeOfWork: '', taxYear: '',
        financialType: '', financialDescription: '', feeScheme: '',
        feeAmount: '', currency: 'IDR', financialDate: ''
      });
      setShowCustomServiceType(false);
      setCustomServiceType('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error?.message || 'Failed to submit'));
    }
  };

  const handleSubmitCross = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', crossForm.title);
      formData.append('divisionCategory', crossForm.divisionCategory);
      formData.append('description', crossForm.description);
      formData.append('submissionDate', crossForm.submissionDate);
      if (crossForm.attachment) {
        formData.append('attachment', crossForm.attachment);
      }

      await api.post('/cross-division-data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Data cross-division berhasil disubmit!');
      setCrossForm({ title: '', divisionCategory: '', description: '', submissionDate: '', attachment: null });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error?.message || 'Failed to submit'));
    }
  };

  const canRedeemNow = () => {
    if (!points.lastRedemptionDate) return true;

    const lastRedeem = new Date(points.lastRedemptionDate);
    const threeMonthsLater = new Date(lastRedeem);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    return new Date() >= threeMonthsLater;
  };

  const getNextRedemptionDate = () => {
    if (!points.lastRedemptionDate) return null;

    const lastRedeem = new Date(points.lastRedemptionDate);
    const threeMonthsLater = new Date(lastRedeem);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    return threeMonthsLater;
  };

  const handleRedeemPoints = async () => {
    if (!canRedeemNow()) {
      const nextDate = getNextRedemptionDate();
      setMessage(`Error: Anda dapat redeem lagi pada ${nextDate.toLocaleDateString('id-ID')}`);
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    if (redeemAmount % 5 !== 0) {
      setMessage('Error: Jumlah redeem harus kelipatan 5');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (redeemAmount > points.totalPoints) {
      setMessage('Error: Poin tidak mencukupi');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await api.post('/redeem-points', { points: redeemAmount });
      setMessage(`Berhasil redeem ${redeemAmount} poin!`);
      setShowRedeemModal(false);
      setRedeemAmount(5);
      fetchPoints();
      fetchRedemptions(); // Refresh redemption list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error?.message || 'Failed to redeem'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleOpenClarification = (dataId, dataType) => {
    setSelectedDataForClarification({ dataId, dataType });
    setShowClarificationModal(true);
  };

  const handleClarificationSubmit = () => {
    setMessage('Klarifikasi berhasil disubmit! Data akan direview ulang.');
    setTimeout(() => setMessage(''), 3000);
    fetchMyData();
  };

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <div className="header-logo">
            <img src="/muc-logo.png" alt="MUC Consulting" className="muc-logo" />
            <h1>Contributor Portal</h1>
          </div>
          <div className="user-info">
            {user.fullName} ({user.username})
            <button onClick={onLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
        <div className="nav">
          <button className={activeTab === 'submit-fee' ? 'active' : ''} onClick={() => setActiveTab('submit-fee')}>Submit Fee Data</button>
          <button className={activeTab === 'submit-cross' ? 'active' : ''} onClick={() => setActiveTab('submit-cross')}>Submit Cross-Division</button>
          <button className={activeTab === 'my-data' ? 'active' : ''} onClick={() => setActiveTab('my-data')}>
            My Data
            {(() => {
              const count = myData.feeData.filter(d => d.status === 'NEEDS_CLARIFICATION').length
                + myData.crossDivisionData.filter(d => d.status === 'NEEDS_CLARIFICATION').length;
              return count > 0 ? <span className="tab-badge">{count}</span> : null;
            })()}
          </button>
          <button className={activeTab === 'my-points' ? 'active' : ''} onClick={() => setActiveTab('my-points')}>My Points</button>
        </div>
      </div>

      <div className="container">
        {message && <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>{message}</div>}

        {activeTab === 'submit-fee' && (
          <div className="card">
            <h2>Submit Fee Competitor Data</h2>
            <form onSubmit={handleSubmitFee}>
              {/* Identitas Pengisi Section */}
              <div className="form-section">
                <h3 className="section-title">Identitas Pengisi (Submitter Identity)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nama (Name) *</label>
                    <input
                      value={feeForm.submitterName}
                      onChange={(e) => setFeeForm({ ...feeForm, submitterName: e.target.value })}
                      placeholder="Masukkan nama pengisi"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Divisi (Division) *</label>
                    <select
                      value={feeForm.submitterDivision}
                      onChange={(e) => setFeeForm({ ...feeForm, submitterDivision: e.target.value })}
                      required
                    >
                      <option value="">-- Pilih Divisi --</option>
                      {divisionList.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tanggal Input (Input Date) *</label>
                    <input
                      type="date"
                      value={feeForm.submitterInputDate}
                      onChange={(e) => setFeeForm({ ...feeForm, submitterInputDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Identitas Section */}
              <div className="form-section">
                <h3 className="section-title">Identitas (Service Provider & Recipient Identity)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pemberi Jasa (Service Provider) *</label>
                    <input
                      value={feeForm.serviceProvider}
                      onChange={(e) => setFeeForm({ ...feeForm, serviceProvider: e.target.value })}
                      placeholder="Nama pemberi jasa"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Penerima Jasa (Service Recipient) *</label>
                    <input
                      value={feeForm.serviceRecipient}
                      onChange={(e) => setFeeForm({ ...feeForm, serviceRecipient: e.target.value })}
                      placeholder="Nama penerima jasa"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Detail Jasa Section */}
              <div className="form-section">
                <h3 className="section-title">Detail Jasa (Service Details)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Jenis Jasa (Service Type) *</label>
                    {!showCustomServiceType ? (
                      <select
                        value={feeForm.serviceType}
                        onChange={(e) => {
                          if (e.target.value === '__ADD_NEW__') {
                            setShowCustomServiceType(true);
                            setFeeForm({ ...feeForm, serviceType: '' });
                          } else {
                            setFeeForm({ ...feeForm, serviceType: e.target.value });
                          }
                        }}
                        required
                      >
                        <option value="">-- Pilih Jenis Jasa --</option>
                        <option value="__ADD_NEW__" style={{ color: '#0066cc', fontWeight: 'bold' }}>
                          + Tambah Jenis Jasa Baru (Input Manual)
                        </option>
                        {serviceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          value={customServiceType}
                          onChange={(e) => setCustomServiceType(e.target.value)}
                          placeholder="Masukkan jenis jasa baru"
                          required
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomServiceType(false);
                            setCustomServiceType('');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '8px 15px', minWidth: 'auto' }}
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Tahun Pajak (Tax Year) *</label>
                    <input
                      value={feeForm.taxYear}
                      onChange={(e) => setFeeForm({ ...feeForm, taxYear: e.target.value })}
                      placeholder="Contoh: 2024"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Scope of Work *</label>
                  <textarea
                    value={feeForm.scopeOfWork}
                    onChange={(e) => setFeeForm({ ...feeForm, scopeOfWork: e.target.value })}
                    placeholder="Jelaskan ruang lingkup pekerjaan"
                    rows="3"
                    required
                  />
                </div>
              </div>

              {/* Financial Data Section */}
              <div className="form-section">
                <h3 className="section-title">Financial Data</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Jenis (Type) *</label>
                    <input
                      value={feeForm.financialType}
                      onChange={(e) => setFeeForm({ ...feeForm, financialType: e.target.value })}
                      placeholder="Contoh: Professional Fee"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Skema Fee (Fee Scheme) *</label>
                    <input
                      value={feeForm.feeScheme}
                      onChange={(e) => setFeeForm({ ...feeForm, feeScheme: e.target.value })}
                      placeholder="Contoh: Fixed, Hourly, Percentage"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Deskripsi (Description) *</label>
                  <textarea
                    value={feeForm.financialDescription}
                    onChange={(e) => setFeeForm({ ...feeForm, financialDescription: e.target.value })}
                    placeholder="Jelaskan detail financial"
                    rows="3"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nominal (Amount) *</label>
                    <input
                      type="number"
                      value={feeForm.feeAmount}
                      onChange={(e) => setFeeForm({ ...feeForm, feeAmount: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={feeForm.currency}
                      onChange={(e) => setFeeForm({ ...feeForm, currency: e.target.value })}
                    >
                      <option value="IDR">IDR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="SGD">SGD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tanggal (Date) *</label>
                    <input
                      type="date"
                      value={feeForm.financialDate}
                      onChange={(e) => setFeeForm({ ...feeForm, financialDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Submit Data</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setFeeForm({
                      submitterName: '', submitterDivision: '', submitterInputDate: '',
                      serviceProvider: '', serviceRecipient: '',
                      serviceType: '', scopeOfWork: '', taxYear: '',
                      financialType: '', financialDescription: '', feeScheme: '',
                      feeAmount: '', currency: 'IDR', financialDate: ''
                    });
                    setShowCustomServiceType(false);
                    setCustomServiceType('');
                  }}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'submit-cross' && (
          <div className="card">
            <h2>Submit Cross-Division Data</h2>
            <form onSubmit={handleSubmitCross}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  value={crossForm.title}
                  onChange={(e) => setCrossForm({ ...crossForm, title: e.target.value })}
                  placeholder="Masukkan judul data"
                  required
                />
              </div>
              <div className="form-group">
                <label>Division Category *</label>
                <select
                  value={crossForm.divisionCategory}
                  onChange={(e) => setCrossForm({ ...crossForm, divisionCategory: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Divisi --</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Customs">Customs</option>
                  <option value="Legal">Legal</option>
                  <option value="Tax Advisory">Tax Advisory</option>
                  <option value="Tax Compliance">Tax Compliance</option>
                  <option value="Tax Dispute">Tax Dispute</option>
                  <option value="Transfer Pricing">Transfer Pricing</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal Submission (Submission Date) *</label>
                <input
                  type="date"
                  value={crossForm.submissionDate}
                  onChange={(e) => setCrossForm({ ...crossForm, submissionDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={crossForm.description}
                  onChange={(e) => setCrossForm({ ...crossForm, description: e.target.value })}
                  placeholder="Jelaskan detail data cross-division"
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Attachment (File)</label>
                <input
                  type="file"
                  onChange={(e) => setCrossForm({ ...crossForm, attachment: e.target.files[0] })}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Format: PDF, Word, Excel, PowerPoint (Max 10MB)
                </small>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Submit Data</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCrossForm({ title: '', divisionCategory: '', description: '', submissionDate: '', attachment: null })}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'my-data' && (
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0 }}>My Fee Data</h2>
                <button
                  onClick={() => exportFeeData(myData.feeData, 'my_fee_data')}
                  style={{
                    padding: '7px 14px', background: '#0f172a', color: 'white',
                    border: 'none', borderRadius: '7px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                  disabled={myData.feeData.length === 0}
                >⬇️ Export CSV</button>
              </div>
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
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myData.feeData.map(item => (
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
                        <td>
                          <strong>{item.currency} {Number(item.fee_amount).toLocaleString()}</strong>
                        </td>
                        <td>{new Date(item.financial_date).toLocaleDateString()}</td>
                        <td><span className={`badge badge-${item.status.toLowerCase().replace('_', '-')}`}>{item.status}</span></td>
                        <td>
                          {item.status === 'NEEDS_CLARIFICATION' ? (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleOpenClarification(item.id, 'fee-data')}
                            >
                              Submit Clarification
                            </button>
                          ) : item.clarification_submitted ? (
                            <span className="badge" style={{ background: '#17a2b8', color: 'white' }}>
                              ⏳ Clarification Submitted
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0 }}>My Cross-Division Data</h2>
                <button
                  onClick={() => exportCrossData(myData.crossDivisionData, 'my_cross_division_data')}
                  style={{
                    padding: '7px 14px', background: '#0f172a', color: 'white',
                    border: 'none', borderRadius: '7px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                  disabled={myData.crossDivisionData.length === 0}
                >⬇️ Export CSV</button>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Submission Date</th>
                      <th>Description</th>
                      <th>Attachment</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myData.crossDivisionData.map(item => (
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
                        <td><span className={`badge badge-${item.status.toLowerCase().replace('_', '-')}`}>{item.status}</span></td>
                        <td>
                          {item.status === 'NEEDS_CLARIFICATION' ? (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleOpenClarification(item.id, 'cross-division-data')}
                            >
                              Submit Clarification
                            </button>
                          ) : item.clarification_submitted ? (
                            <span className="badge" style={{ background: '#17a2b8', color: 'white' }}>
                              ⏳ Clarification Submitted
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-points' && (
          <div>
            <div className="points-header">
              <h2>My Contribution Points</h2>
              <p className="points-subtitle">Track and redeem your contribution rewards</p>
            </div>

            {/* Available Points Card */}
            <div className="points-card-gradient">
              <div className="points-card-header">
                <div>
                  <h3 className="points-card-title">Available Points</h3>
                  <p className="points-card-subtitle">Ready to redeem</p>
                </div>
                <div className="points-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15l-3-3m0 0l3-3m-3 3h12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="points-display">
                <span className="points-number">{points.totalPoints}</span>
                <span className="points-label">points</span>
              </div>
              <div className="points-badges">
                <span className="points-badge">Silver Member</span>
                <span className="points-badge-info">Total Earned: {points.totalPoints} • Redeemed: 0</span>
              </div>
              <div className="points-redeem-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Kelipatan 5 poin • Dapat ditukar setiap 3 bulan
              </div>

              {/* Redeem Button */}
              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn-redeem"
                  onClick={() => setShowRedeemModal(true)}
                  disabled={points.totalPoints < 5 || !canRedeemNow()}
                >
                  {canRedeemNow() ? 'Redeem Points' : `Available ${getNextRedemptionDate()?.toLocaleDateString('id-ID')}`}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="points-stats-grid">
              <div className="points-stat-card">
                <p className="stat-label">Approved Submissions</p>
                {/* Count from points.history (each +5 = one approved submission) */}
                <p className="stat-value">{points.history ? points.history.length : 0}</p>
              </div>
              <div className="points-stat-card">
                <p className="stat-label">Pending Review</p>
                <p className="stat-value stat-warning">
                  {myData.feeData.filter(d => d.status === 'PENDING' || d.status === 'NEEDS_CLARIFICATION').length +
                    myData.crossDivisionData.filter(d => d.status === 'PENDING' || d.status === 'NEEDS_CLARIFICATION').length}
                </p>
              </div>
              <div className="points-stat-card">
                <p className="stat-label">Points Per Approval</p>
                <p className="stat-value stat-info">5</p>
                <p className="stat-sublabel">Standard rate</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="activity-header">
                <h3>Recent Activity</h3>
                <p className="activity-subtitle">Points history from your contributions</p>
              </div>
              <div className="activity-list">
                {points.history && points.history.length > 0 ? (
                  points.history.map((item, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-info">
                        <p className="activity-title">{item.description}</p>
                        <p className="activity-date">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="activity-points">
                        <span className="activity-badge activity-badge-approved">Approved</span>
                        <span className="activity-points-value">+{item.points}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-empty">
                    <p>No activity yet. Start contributing to earn points!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Redemption History */}
            <div className="card">
              <div className="activity-header">
                <h3>Redemption History</h3>
                <p className="activity-subtitle">Riwayat penukaran poin Anda</p>
              </div>
              <div className="activity-list">
                {redemptions && redemptions.length > 0 ? (
                  redemptions.map((r, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-info">
                        <p className="activity-title">Penukaran {r.points} poin → Hadiah/Reward</p>
                        <p className="activity-date">{new Date(r.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="activity-points">
                        {r.reward_given ? (
                          <span className="activity-badge" style={{ background: '#d1fae5', color: '#065f46' }}>✅ Hadiah Diberikan</span>
                        ) : (
                          <span className="activity-badge" style={{ background: '#fef3c7', color: '#92400e' }}>⏳ Menunggu Konfirmasi</span>
                        )}
                        <span className="activity-points-value" style={{ color: '#ef4444' }}>-{r.points}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-empty">
                    <p>No redemptions yet. Earn 5 points to start redeeming!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="modal-overlay" onClick={() => setShowRedeemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Redeem Points</h3>
              <button className="modal-close" onClick={() => setShowRedeemModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Tukarkan poin Anda dengan HC. Minimum 5 poin, kelipatan 5.
              </p>
              <div className="form-group">
                <label>Jumlah Poin (Kelipatan 5)</label>
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(Number(e.target.value))}
                  min="5"
                  step="5"
                  max={points.totalPoints}
                  placeholder="Masukkan jumlah poin"
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Poin tersedia: {points.totalPoints} • Max redeem: {Math.floor(points.totalPoints / 5) * 5}
                </small>
              </div>
              {!canRedeemNow() && (
                <div className="alert alert-warning" style={{ marginTop: '15px' }}>
                  Anda dapat redeem lagi pada {getNextRedemptionDate()?.toLocaleDateString('id-ID')}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRedeemModal(false)}>
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRedeemPoints}
                disabled={!canRedeemNow() || redeemAmount < 5 || redeemAmount > points.totalPoints}
              >
                Redeem {redeemAmount} Poin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      {showClarificationModal && selectedDataForClarification && (
        <ClarificationModal
          dataId={selectedDataForClarification.dataId}
          dataType={selectedDataForClarification.dataType}
          onClose={() => {
            setShowClarificationModal(false);
            setSelectedDataForClarification(null);
          }}
          onSubmit={handleClarificationSubmit}
        />
      )}
    </div>
  );
}

export default ContributorPortal;
