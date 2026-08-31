import React, { useState, useEffect } from 'react';
import api from '../services/api';
import FeeInsightsDashboard from './FeeInsightsDashboard';
import AuditReport from './AuditReport';
import { exportFeeData, exportCrossData, exportAuditReport } from '../utils/exportUtils';

function ManagerPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('fee');
  const [feeData, setFeeData] = useState([]);
  const [crossData, setCrossData] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [filteredCrossData, setFilteredCrossData] = useState([]);
  const [auditData, setAuditData] = useState({ feeData: [], crossData: [] });

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
    fetchFeeData();
    fetchCrossData();
  }, []);

  useEffect(() => {
    if (activeTab === 'auditReport') {
      fetchAuditReport();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedDivision === 'all') {
      setFilteredCrossData(crossData);
    } else {
      setFilteredCrossData(crossData.filter(item => item.division_category === selectedDivision));
    }
  }, [selectedDivision, crossData]);

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

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <div className="header-logo">
            <img src="/muc-logo.png" alt="MUC Consulting" className="muc-logo" />
            <h1>Manager Portal</h1>
          </div>
          <div className="user-info">
            {user.fullName} ({user.username})
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        </div>
        <div className="nav">
          <button className={activeTab === 'fee' ? 'active' : ''} onClick={() => setActiveTab('fee')}>Fee Competitor</button>
          <button className={activeTab === 'cross' ? 'active' : ''} onClick={() => setActiveTab('cross')}>Cross-Division</button>
          <button className={activeTab === 'auditReport' ? 'active' : ''} onClick={() => setActiveTab('auditReport')}>📊 Audit Report</button>
        </div>
      </div>

      <div className="container">
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

            {/* Insights Section */}
            <FeeInsightsDashboard feeData={feeData} />

            {/* Data Table Section */}
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

        {activeTab === 'cross' && (
          <div>
            {/* Division Filter Tabs */}
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

            {/* Data Table */}
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
                          <td>
                            <span className="badge badge-info">{item.division_category}</span>
                          </td>
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

        {activeTab === 'auditReport' && (
          <div style={{ paddingTop: '8px' }}>
            <AuditReport feeData={auditData.feeData} crossData={auditData.crossData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerPortal;
