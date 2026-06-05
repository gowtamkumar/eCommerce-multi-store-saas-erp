import type { LeadMessage } from '../type';

const CSV_HEADERS = ['Date', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status'];

function escapeCsv(value: string | undefined) {
    return `"${(value || '').replace(/"/g, '""')}"`;
}

export function buildLeadsCsv(leads: LeadMessage[]) {
    return [
        CSV_HEADERS.join(','),
        ...leads.map((lead) => [
            new Date(lead.createdAt).toLocaleDateString(),
            escapeCsv(lead.name),
            escapeCsv(lead.email),
            escapeCsv(lead.phone),
            escapeCsv(lead.subject),
            escapeCsv(lead.message),
            lead.status?.toUpperCase() || '',
        ].join(',')),
    ].join('\n');
}

export function downloadCsv(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
