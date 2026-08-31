import React from 'react';

function FeeInsightsDashboard({ feeData }) {
  // Calculate insights
  const totalData = feeData.length;
  const totalAmount = feeData.reduce((sum, item) => sum + Number(item.fee_amount), 0);
  const avgAmount = totalData > 0 ? totalAmount / totalData : 0;
  
  // Group by service type
  const byServiceType = feeData.reduce((acc, item) => {
    const type = item.service_type || 'Unknown';
    if (!acc[type]) {
      acc[type] = { count: 0, total: 0 };
    }
    acc[type].count++;
    acc[type].total += Number(item.fee_amount);
    return acc;
  }, {});

  // Group by fee scheme
  const byFeeScheme = feeData.reduce((acc, item) => {
    const scheme = item.fee_scheme || 'Unknown';
    if (!acc[scheme]) {
      acc[scheme] = { count: 0, total: 0 };
    }
    acc[scheme].count++;
    acc[scheme].total += Number(item.fee_amount);
    return acc;
  }, {});

  // Get top 5 service types
  const topServiceTypes = Object.entries(byServiceType)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  // Get min and max
  const amounts = feeData.map(item => Number(item.fee_amount));
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

  return (
    <div className="insights-dashboard">
      {/* Summary Cards */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div className="insight-content">
            <p className="insight-label">Total Data</p>
            <p className="insight-value">{totalData}</p>
            <p className="insight-sublabel">Accepted submissions</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div className="insight-content">
            <p className="insight-label">Total Amount</p>
            <p className="insight-value">IDR {(totalAmount / 1000000).toFixed(1)}M</p>
            <p className="insight-sublabel">All accepted fees</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div className="insight-content">
            <p className="insight-label">Average Fee</p>
            <p className="insight-value">IDR {(avgAmount / 1000000).toFixed(1)}M</p>
            <p className="insight-sublabel">Per submission</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <div className="insight-content">
            <p className="insight-label">Fee Range</p>
            <p className="insight-value">{(minAmount / 1000000).toFixed(0)}M - {(maxAmount / 1000000).toFixed(0)}M</p>
            <p className="insight-sublabel">Min to Max (IDR)</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="insights-charts">
        {/* Top Service Types */}
        <div className="chart-card">
          <h3>Top 5 Service Types by Total Fee</h3>
          <div className="bar-chart">
            {topServiceTypes.map(([type, data]) => {
              const percentage = (data.total / totalAmount) * 100;
              return (
                <div key={type} className="bar-item">
                  <div className="bar-label">
                    <span className="bar-name">{type}</span>
                    <span className="bar-value">IDR {(data.total / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="bar-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <span className="bar-count">{data.count} submissions</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fee Scheme Distribution */}
        <div className="chart-card">
          <h3>Fee Scheme Distribution</h3>
          <div className="pie-chart-legend">
            {Object.entries(byFeeScheme).map(([scheme, data]) => {
              const percentage = (data.count / totalData) * 100;
              return (
                <div key={scheme} className="legend-item">
                  <div className="legend-color" style={{ background: `hsl(${Object.keys(byFeeScheme).indexOf(scheme) * 60}, 70%, 60%)` }}></div>
                  <div className="legend-content">
                    <span className="legend-name">{scheme}</span>
                    <span className="legend-stats">{data.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeeInsightsDashboard;
