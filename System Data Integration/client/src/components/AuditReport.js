import React, { useState, useMemo } from 'react';

// ── Palette ───────────────────────────────────────────────────
const PALETTE = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316',
    '#ec4899', '#14b8a6'
];

// ── SVG Pie Chart ─────────────────────────────────────────────
function PieChart({ data, title, size = 220 }) {
    const [hovered, setHovered] = useState(null);
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = size / 2 - 20;
    const cx = size / 2;
    const cy = size / 2;

    // Build slices
    let cumAngle = -Math.PI / 2;
    const slices = data.map((d, i) => {
        const angle = total > 0 ? (d.value / total) * 2 * Math.PI : 0;
        const startAngle = cumAngle;
        cumAngle += angle;
        const endAngle = cumAngle;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = angle > Math.PI ? 1 : 0;
        const pathD = total > 0
            ? `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
            : `M ${cx} ${cy} m -1 0 a 1 1 0 1 0 2 0 a 1 1 0 1 0 -2 0`;
        const midAngle = startAngle + angle / 2;
        return {
            pathD,
            color: PALETTE[i % PALETTE.length],
            midAngle,
            label: d.label,
            value: d.value,
        };
    });

    const isHov = hovered !== null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#1e293b', textAlign: 'center' }}>{title}</h3>
            <svg width={size} height={size} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>
                {slices.map((s, i) => (
                    <path
                        key={i}
                        d={s.pathD}
                        fill={s.color}
                        stroke="white"
                        strokeWidth={2}
                        opacity={isHov && hovered !== i ? 0.5 : 1}
                        style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        transform={hovered === i ? `translate(${Math.cos(s.midAngle) * 6}, ${Math.sin(s.midAngle) * 6})` : ''}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    />
                ))}
                {/* Center label */}
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">
                    {total}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#64748b">
                    total
                </text>
            </svg>
            {/* Legend */}
            <div style={{ marginTop: '14px', width: '100%' }}>
                {data.map((d, i) => {
                    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0';
                    return (
                        <div
                            key={i}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '4px 6px', borderRadius: '6px',
                                background: hovered === i ? `${PALETTE[i % PALETTE.length]}15` : 'transparent',
                                cursor: 'pointer', marginBottom: '3px', transition: 'background 0.2s'
                            }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div style={{ width: '11px', height: '11px', borderRadius: '3px', flexShrink: 0, background: PALETTE[i % PALETTE.length] }} />
                            <span style={{ fontSize: '12px', color: '#475569', flex: 1, lineHeight: 1.3 }}>{d.label}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{d.value}</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '38px', textAlign: 'right' }}>{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Main AuditReport Component ────────────────────────────────
function AuditReport({ feeData = [], crossData = [] }) {
    const [searchClient, setSearchClient] = useState('');
    const [filterDivision, setFilterDivision] = useState('all');
    const [sortBy, setSortBy] = useState('client');

    // ── Clients Per Division (from fee_data: service_recipient per submitter_division)
    const clientsPerDivision = useMemo(() => {
        const map = {};
        feeData.forEach(item => {
            const div = item.submitter_division || 'Unknown';
            if (!map[div]) map[div] = new Set();
            if (item.service_recipient) map[div].add(item.service_recipient);
        });
        return Object.entries(map)
            .map(([label, clients]) => ({ label, value: clients.size }))
            .sort((a, b) => b.value - a.value);
    }, [feeData]);

    // ── Services Per Division (from cross_division_data: unique titles per division_category)
    const servicesPerDivision = useMemo(() => {
        const map = {};
        crossData.forEach(item => {
            const div = item.division_category || 'Unknown';
            if (!map[div]) map[div] = new Set();
            if (item.title) map[div].add(item.title);
        });
        // Also count service_type from feeData per division
        feeData.forEach(item => {
            const div = item.submitter_division || 'Unknown';
            if (!map[div]) map[div] = new Set();
            if (item.service_type) map[div].add(item.service_type);
        });
        return Object.entries(map)
            .map(([label, services]) => ({ label, value: services.size }))
            .sort((a, b) => b.value - a.value);
    }, [feeData, crossData]);

    // ── Client tracking table: client → list of services used
    const clientServiceMap = useMemo(() => {
        const map = {};
        feeData.forEach(item => {
            const client = item.service_recipient || item.service_provider || 'Unknown';
            if (!map[client]) {
                map[client] = {
                    name: client,
                    divisions: new Set(),
                    services: [],
                    totalFee: 0,
                    latestDate: null
                };
            }
            map[client].divisions.add(item.submitter_division || '-');
            map[client].services.push({
                serviceType: item.service_type || '-',
                division: item.submitter_division || '-',
                feeAmount: Number(item.fee_amount) || 0,
                currency: item.currency || 'IDR',
                feeScheme: item.fee_scheme || '-',
                taxYear: item.tax_year || '-',
                date: item.financial_date || item.submitter_input_date || null,
                status: item.status || 'ACCEPTED'
            });
            map[client].totalFee += Number(item.fee_amount) || 0;
            const d = item.financial_date || item.created_at;
            if (d && (!map[client].latestDate || d > map[client].latestDate)) {
                map[client].latestDate = d;
            }
        });
        return map;
    }, [feeData]);

    // Cross-division contributions per client (by contributor_name)
    const crossByContributor = useMemo(() => {
        const map = {};
        crossData.forEach(item => {
            const name = item.contributor_name || 'Unknown';
            if (!map[name]) map[name] = [];
            map[name].push(item);
        });
        return map;
    }, [crossData]);

    const allClients = useMemo(() => Object.values(clientServiceMap), [clientServiceMap]);
    const allDivisions = useMemo(() => {
        const divs = new Set();
        feeData.forEach(f => { if (f.submitter_division) divs.add(f.submitter_division); });
        return ['all', ...Array.from(divs).sort()];
    }, [feeData]);

    const filteredClients = useMemo(() => {
        let list = allClients;
        if (searchClient.trim()) {
            const q = searchClient.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q));
        }
        if (filterDivision !== 'all') {
            list = list.filter(c => c.divisions.has(filterDivision));
        }
        if (sortBy === 'client') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === 'services') list = [...list].sort((a, b) => b.services.length - a.services.length);
        if (sortBy === 'fee') list = [...list].sort((a, b) => b.totalFee - a.totalFee);
        return list;
    }, [allClients, searchClient, filterDivision, sortBy]);

    // ── Summary stats
    const totalClients = allClients.length;
    const totalServices = feeData.length;
    const totalCross = crossData.length;
    const totalFeeValue = feeData.reduce((s, f) => s + (Number(f.fee_amount) || 0), 0);

    const [expandedClient, setExpandedClient] = useState(null);

    const noData = feeData.length === 0 && crossData.length === 0;

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* ── Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
                borderRadius: '16px', padding: '28px 32px', marginBottom: '24px',
                color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ position: 'absolute', bottom: '-50px', right: '80px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px' }}>📊 Audit Report</h2>
                <p style={{ margin: '6px 0 20px', opacity: 0.7, fontSize: '14px' }}>
                    Analisis data lintas divisi — tracking penggunaan layanan per client
                </p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total Client', value: totalClients, icon: '🏢' },
                        { label: 'Fee Entries', value: totalServices, icon: '📋' },
                        { label: 'Cross-Division Insights', value: totalCross, icon: '🔗' },
                        { label: 'Total Fee Value', value: `IDR ${(totalFeeValue / 1e9).toFixed(1)}B`, icon: '💰' },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
                            padding: '12px 18px', backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.15)'
                        }}>
                            <p style={{ margin: 0, fontSize: '20px' }}>{stat.icon}</p>
                            <p style={{ margin: '4px 0 2px', fontSize: '20px', fontWeight: 800 }}>{stat.value}</p>
                            <p style={{ margin: 0, fontSize: '11px', opacity: 0.7 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {noData && (
                <div style={{
                    textAlign: 'center', padding: '60px 20px', background: '#f8fafc',
                    borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#94a3b8'
                }}>
                    <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📭</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px' }}>Belum ada data</p>
                    <p style={{ fontSize: '13px', margin: 0 }}>Data akan muncul setelah contributor mengirim dan validator menyetujui fee data atau cross-division insights.</p>
                </div>
            )}

            {!noData && (
                <>
                    {/* ── Pie Charts Row ── */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px', marginBottom: '24px'
                    }}>
                        <div className="card" style={{ padding: '24px' }}>
                            {clientsPerDivision.length > 0
                                ? <PieChart data={clientsPerDivision} title="Jumlah Client per Divisi" />
                                : <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <p style={{ fontSize: '32px' }}>📊</p>
                                    <p style={{ fontSize: '13px' }}>Belum ada data client per divisi</p>
                                </div>
                            }
                        </div>
                        <div className="card" style={{ padding: '24px' }}>
                            {servicesPerDivision.length > 0
                                ? <PieChart data={servicesPerDivision} title="Jumlah Service per Divisi" />
                                : <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <p style={{ fontSize: '32px' }}>🔧</p>
                                    <p style={{ fontSize: '13px' }}>Belum ada data service per divisi</p>
                                </div>
                            }
                        </div>
                    </div>

                    {/* ── Client Service Tracking Table ── */}
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>
                                🏢 Tracking Service per Client
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                Lihat layanan apa saja yang sudah pernah digunakan oleh setiap client
                            </p>
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            <input
                                type="text"
                                placeholder="🔍 Cari nama client..."
                                value={searchClient}
                                onChange={e => setSearchClient(e.target.value)}
                                style={{
                                    flex: '1', minWidth: '200px', padding: '9px 14px',
                                    border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                    fontSize: '13px', outline: 'none', fontFamily: 'inherit'
                                }}
                            />
                            <select
                                value={filterDivision}
                                onChange={e => setFilterDivision(e.target.value)}
                                style={{
                                    padding: '9px 14px', border: '1.5px solid #e2e8f0',
                                    borderRadius: '8px', fontSize: '13px', background: 'white',
                                    cursor: 'pointer', fontFamily: 'inherit'
                                }}
                            >
                                {allDivisions.map(d => (
                                    <option key={d} value={d}>{d === 'all' ? '— Semua Divisi —' : d}</option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                style={{
                                    padding: '9px 14px', border: '1.5px solid #e2e8f0',
                                    borderRadius: '8px', fontSize: '13px', background: 'white',
                                    cursor: 'pointer', fontFamily: 'inherit'
                                }}
                            >
                                <option value="client">Urutkan: A-Z Client</option>
                                <option value="services">Urutkan: Terbanyak Service</option>
                                <option value="fee">Urutkan: Total Fee Tertinggi</option>
                            </select>
                        </div>

                        {/* Table */}
                        {filteredClients.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                <p style={{ fontSize: '28px', margin: '0 0 8px' }}>🔍</p>
                                <p style={{ fontSize: '14px', margin: 0 }}>Tidak ada client yang cocok dengan filter</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f5f9' }}>
                                            {['Client', 'Divisi Terlibat', 'Jumlah Service', 'Total Fee (IDR)', 'Aksi'].map(h => (
                                                <th key={h} style={{
                                                    padding: '12px 14px', textAlign: 'left',
                                                    fontWeight: 700, color: '#475569', fontSize: '12px',
                                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                                    borderBottom: '2px solid #e2e8f0'
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClients.map((client, idx) => {
                                            const isExpanded = expandedClient === client.name;
                                            const divArr = Array.from(client.divisions);
                                            return (
                                                <React.Fragment key={client.name}>
                                                    <tr style={{
                                                        background: isExpanded ? '#eff6ff' : idx % 2 === 0 ? 'white' : '#fafafa',
                                                        transition: 'background 0.15s'
                                                    }}>
                                                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{
                                                                    width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                                                                    background: `${PALETTE[idx % PALETTE.length]}20`,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '16px'
                                                                }}>🏢</div>
                                                                <div>
                                                                    <strong style={{ color: '#1e293b', display: 'block' }}>{client.name}</strong>
                                                                    <small style={{ color: '#94a3b8' }}>
                                                                        {client.latestDate ? `Terakhir: ${new Date(client.latestDate).toLocaleDateString('id-ID')}` : ''}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                {divArr.map(div => (
                                                                    <span key={div} style={{
                                                                        display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                                                                        background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 600
                                                                    }}>{div}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                                                            <span style={{
                                                                display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                                                                background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '13px'
                                                            }}>
                                                                {client.services.length} service
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                                                            <strong style={{ color: '#1e293b' }}>
                                                                {client.totalFee.toLocaleString('id-ID')}
                                                            </strong>
                                                        </td>
                                                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                                                            <button
                                                                onClick={() => setExpandedClient(isExpanded ? null : client.name)}
                                                                style={{
                                                                    padding: '5px 12px', borderRadius: '6px', border: 'none',
                                                                    cursor: 'pointer', fontWeight: 600, fontSize: '12px',
                                                                    background: isExpanded ? '#bfdbfe' : '#e0e7ff',
                                                                    color: isExpanded ? '#1e40af' : '#3730a3',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {isExpanded ? '▲ Tutup' : '▼ Detail'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan="5" style={{ padding: '0', background: '#eff6ff' }}>
                                                                <div style={{ padding: '16px 24px 20px', borderLeft: '4px solid #3b82f6' }}>
                                                                    <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#1e40af', fontSize: '13px' }}>
                                                                        📋 Riwayat Layanan — {client.name}
                                                                    </p>
                                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                                        <thead>
                                                                            <tr>
                                                                                {['Jenis Layanan', 'Divisi', 'Fee Scheme', 'Tax Year', 'Fee (IDR)', 'Tanggal', 'Status'].map(h => (
                                                                                    <th key={h} style={{
                                                                                        padding: '7px 10px', textAlign: 'left',
                                                                                        background: '#dbeafe', color: '#1e40af',
                                                                                        fontWeight: 700, fontSize: '11px',
                                                                                        borderBottom: '1px solid #bfdbfe'
                                                                                    }}>{h}</th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {client.services.map((svc, si) => (
                                                                                <tr key={si} style={{ background: si % 2 === 0 ? 'white' : '#f0f7ff' }}>
                                                                                    <td style={{ padding: '7px 10px', fontWeight: 600 }}>{svc.serviceType}</td>
                                                                                    <td style={{ padding: '7px 10px' }}>
                                                                                        <span style={{
                                                                                            background: '#e0f2fe', color: '#0369a1',
                                                                                            padding: '1px 7px', borderRadius: '8px', fontSize: '11px', fontWeight: 600
                                                                                        }}>{svc.division}</span>
                                                                                    </td>
                                                                                    <td style={{ padding: '7px 10px', color: '#475569' }}>{svc.feeScheme}</td>
                                                                                    <td style={{ padding: '7px 10px' }}>{svc.taxYear}</td>
                                                                                    <td style={{ padding: '7px 10px', fontWeight: 700, color: '#166534' }}>
                                                                                        {svc.feeAmount.toLocaleString('id-ID')}
                                                                                    </td>
                                                                                    <td style={{ padding: '7px 10px', color: '#64748b' }}>
                                                                                        {svc.date ? new Date(svc.date).toLocaleDateString('id-ID') : '-'}
                                                                                    </td>
                                                                                    <td style={{ padding: '7px 10px' }}>
                                                                                        <span style={{
                                                                                            padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                                                                                            background: svc.status === 'ACCEPTED' ? '#dcfce7' : svc.status === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                                                                                            color: svc.status === 'ACCEPTED' ? '#166534' : svc.status === 'REJECTED' ? '#991b1b' : '#92400e'
                                                                                        }}>
                                                                                            {svc.status}
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Cross-Division Insights Section */}
                        {crossData.length > 0 && (
                            <div style={{ marginTop: '32px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                                    🔗 Cross-Division Insight Submissions
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                    {crossData.slice(0, 12).map((item, i) => (
                                        <div key={item.id || i} style={{
                                            padding: '14px 16px', borderRadius: '10px',
                                            border: '1.5px solid #e2e8f0', background: 'white',
                                            borderLeft: `4px solid ${PALETTE[i % PALETTE.length]}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                                <strong style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.4, flex: 1 }}>
                                                    {item.title}
                                                </strong>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, flexShrink: 0,
                                                    background: item.status === 'ACCEPTED' ? '#dcfce7' : item.status === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                                                    color: item.status === 'ACCEPTED' ? '#166534' : item.status === 'REJECTED' ? '#991b1b' : '#92400e'
                                                }}>
                                                    {item.status || 'PENDING'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 600 }}>
                                                    {item.division_category}
                                                </span>
                                                {item.contributor_name && (
                                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>by {item.contributor_name}</span>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                                                    {item.description.length > 100 ? item.description.slice(0, 100) + '...' : item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {crossData.length > 12 && (
                                    <p style={{ margin: '12px 0 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                        +{crossData.length - 12} insight lainnya
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default AuditReport;
