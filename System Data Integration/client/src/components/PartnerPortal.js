import React, { useState, useEffect } from 'react';
import api from '../services/api';
import FeeInsightsDashboard from './FeeInsightsDashboard';

function PartnerPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('data');
  const [feeData, setFeeData] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/fee-competitor');
      setFeeData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <div className="header-logo">
            <img src="/muc-logo.png" alt="MUC Consulting" className="muc-logo" />
            <h1>Partner Portal</h1>
          </div>
          <div className="user-info">
            {user.fullName} ({user.username})
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        </div>
        <div className="nav">
          <button className={activeTab === 'data' ? 'active' : ''} onClick={() => setActiveTab('data')}>Fee Competitor</button>
        </div>
      </div>

      <div className="container">
        <div>
          <div className="card">
            <h2>Fee Competitor Dashboard</h2>
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
      </div>
    </div>
  );
}

export default PartnerPortal;
