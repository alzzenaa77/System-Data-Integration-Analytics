/**
 * Export Utilities — CSV export for fee data, cross-division data, and audit reports
 */

/**
 * Convert an array of objects to CSV string
 */
function toCSV(rows, columns) {
    if (!rows || rows.length === 0) return '';

    const header = columns.map(c => `"${c.label}"`).join(',');
    const body = rows.map(row =>
        columns.map(c => {
            const val = c.get ? c.get(row) : (row[c.key] ?? '');
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        }).join(',')
    );
    return [header, ...body].join('\r\n');
}

/**
 * Trigger browser download of a CSV file
 */
function downloadCSV(csvStr, filename) {
    const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([bom + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export fee data table to CSV
 */
export function exportFeeData(feeData, filename = 'fee_data.csv') {
    const columns = [
        { label: 'Submitter Name', key: 'submitter_name' },
        { label: 'Submitter Division', key: 'submitter_division' },
        { label: 'Input Date', get: r => r.submitter_input_date || '' },
        { label: 'Service Provider', key: 'service_provider' },
        { label: 'Service Recipient', key: 'service_recipient' },
        { label: 'Service Type', key: 'service_type' },
        { label: 'Scope of Work', key: 'scope_of_work' },
        { label: 'Tax Year', key: 'tax_year' },
        { label: 'Financial Type', key: 'financial_type' },
        { label: 'Financial Description', key: 'financial_description' },
        { label: 'Fee Scheme', key: 'fee_scheme' },
        { label: 'Fee Amount', get: r => Number(r.fee_amount) || 0 },
        { label: 'Currency', key: 'currency' },
        { label: 'Financial Date', get: r => r.financial_date ? new Date(r.financial_date).toLocaleDateString('id-ID') : '' },
        { label: 'Status', key: 'status' },
        { label: 'Contributor', key: 'contributor_name' },
    ];
    const ts = new Date().toISOString().slice(0, 10);
    downloadCSV(toCSV(feeData, columns), `${filename.replace('.csv', '')}_${ts}.csv`);
}

/**
 * Export cross-division data to CSV
 */
export function exportCrossData(crossData, filename = 'cross_division_data.csv') {
    const columns = [
        { label: 'Title', key: 'title' },
        { label: 'Division Category', key: 'division_category' },
        { label: 'Description', key: 'description' },
        { label: 'Submission Date', get: r => r.submission_date ? new Date(r.submission_date).toLocaleDateString('id-ID') : '' },
        { label: 'Status', key: 'status' },
        { label: 'Contributor', key: 'contributor_name' },
        { label: 'Created At', get: r => r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '' },
    ];
    const ts = new Date().toISOString().slice(0, 10);
    downloadCSV(toCSV(crossData, columns), `${filename.replace('.csv', '')}_${ts}.csv`);
}

/**
 * Export audit report (client service tracking) to CSV
 */
export function exportAuditReport(feeData, filename = 'audit_report.csv') {
    // Flatten client-service map into rows
    const clientMap = {};
    feeData.forEach(item => {
        const client = item.service_recipient || item.service_provider || 'Unknown';
        if (!clientMap[client]) clientMap[client] = [];
        clientMap[client].push(item);
    });

    const rows = [];
    Object.entries(clientMap).forEach(([client, services]) => {
        services.forEach(svc => {
            rows.push({
                client,
                division: svc.submitter_division || '-',
                service_type: svc.service_type || '-',
                fee_scheme: svc.fee_scheme || '-',
                tax_year: svc.tax_year || '-',
                fee_amount: Number(svc.fee_amount) || 0,
                currency: svc.currency || 'IDR',
                date: svc.financial_date ? new Date(svc.financial_date).toLocaleDateString('id-ID') : '-',
                status: svc.status || '-',
            });
        });
    });

    const columns = [
        { label: 'Client (Service Recipient)', key: 'client' },
        { label: 'Divisi', key: 'division' },
        { label: 'Jenis Layanan', key: 'service_type' },
        { label: 'Fee Scheme', key: 'fee_scheme' },
        { label: 'Tax Year', key: 'tax_year' },
        { label: 'Fee Amount', key: 'fee_amount' },
        { label: 'Currency', key: 'currency' },
        { label: 'Tanggal', key: 'date' },
        { label: 'Status', key: 'status' },
    ];
    const ts = new Date().toISOString().slice(0, 10);
    downloadCSV(toCSV(rows, columns), `${filename.replace('.csv', '')}_${ts}.csv`);
}

/**
 * Export notifications log to CSV
 */
export function exportNotifications(notifications, filename = 'notifications.csv') {
    const columns = [
        { label: 'Waktu', get: r => r.time ? new Date(r.time).toLocaleString('id-ID') : '' },
        { label: 'Tipe', key: 'type' },
        { label: 'Pesan', key: 'message' },
        { label: 'Status', key: 'status' },
    ];
    const ts = new Date().toISOString().slice(0, 10);
    downloadCSV(toCSV(notifications, columns), `${filename.replace('.csv', '')}_${ts}.csv`);
}
