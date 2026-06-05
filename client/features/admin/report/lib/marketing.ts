import type { MarketingCampaign, MarketingCoupon } from '../types';

export function getCampaignSuccessRate(campaign: Pick<MarketingCampaign, 'sentCount' | 'failedCount'>): number {
    const attempts = (campaign.sentCount || 0) + (campaign.failedCount || 0);
    return attempts > 0 ? ((campaign.sentCount || 0) / attempts) * 100 : 100;
}

function escapeCsv(value: string | number): string {
    return `"${String(value).replace(/"/g, '""')}"`;
}

export function buildMarketingCsv(
    campaigns: MarketingCampaign[],
    coupons: MarketingCoupon[],
): string {
    let csv = 'TYPE,NAME/CODE,DETAILS,STATUS,REACH/LIMIT,SUCCESS/USED,FAILURES/UNUSED,SUCCESS RATE\n';

    campaigns.forEach((c) => {
        const rate = getCampaignSuccessRate(c);
        csv += [
            escapeCsv('CAMPAIGN'),
            escapeCsv(c.name),
            escapeCsv(`Channel: ${c.type}`),
            escapeCsv(c.status),
            c.totalAudience || 0,
            c.sentCount || 0,
            c.failedCount || 0,
            escapeCsv(`${rate.toFixed(1)}%`),
        ].join(',') + '\n';
    });

    coupons.forEach((c) => {
        const statusStr = c.isActive ? 'Active' : 'Inactive';
        const discDetails = c.discountType === 'percentage' ? `${c.amount}% off` : `${c.amount} flat off`;
        const unused = c.usageLimit ? c.usageLimit - (c.usedCount || 0) : 'N/A';
        csv += [
            escapeCsv('COUPON'),
            escapeCsv(c.code),
            escapeCsv(discDetails),
            escapeCsv(statusStr),
            c.usageLimit || 'Unlimited',
            c.usedCount || 0,
            unused,
            escapeCsv('N/A'),
        ].join(',') + '\n';
    });

    return csv;
}

export function downloadCsv(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
