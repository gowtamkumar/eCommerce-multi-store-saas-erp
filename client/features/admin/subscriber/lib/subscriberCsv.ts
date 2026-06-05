import type { Subscriber } from '../type';

const CSV_HEADERS = ['Date', 'Email', 'Status', 'Source'];

function resolveStatus(subscriber: Subscriber) {
    return subscriber.status || (subscriber.isActive ? 'confirmed' : 'unsubscribed');
}

export function buildSubscribersCsv(subscribers: Subscriber[]) {
    return [
        CSV_HEADERS.join(','),
        ...subscribers.map((subscriber) => [
            new Date(subscriber.createdAt).toISOString(),
            `"${subscriber.email}"`,
            resolveStatus(subscriber),
            `"${subscriber.source || ''}"`,
        ].join(',')),
    ].join('\n');
}

export function downloadCsv(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
