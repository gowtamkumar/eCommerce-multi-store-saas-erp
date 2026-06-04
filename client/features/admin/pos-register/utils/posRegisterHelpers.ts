import toast from 'react-hot-toast';
import { Shift } from '../types';

export const cashierLabel = (shift: Shift): string =>
    shift.user?.username || shift.user?.email || shift.userId.substring(0, 8);

export const exportShiftsToCSV = (sortedShifts: Shift[]): boolean => {
    if (sortedShifts.length === 0) {
        toast.error('No shift audits to export');
        return false;
    }
    try {
        const esc = (value: string) => value.replace(/"/g, '""');
        let csv =
            '\ufeffCashier,Terminal,Opened At,Closed At,Opening Balance,Cash Sales,Card Sales,Mobile Sales,Expected,Audited Actual,Variance,Status,Remarks\n';

        sortedShifts.forEach((s) => {
            const opened = new Date(s.openingTime).toLocaleString();
            const closed = s.closingTime ? new Date(s.closingTime).toLocaleString() : '';
            const actual = s.closingBalance !== null ? Number(s.closingBalance).toFixed(2) : '';
            const variance =
                s.status === 'CLOSED' && s.difference !== null ? Number(s.difference).toFixed(2) : '';

            csv += `"${esc(cashierLabel(s))}","${esc(s.register?.name || 'N/A')}","${opened}","${closed}",${Number(s.openingBalance).toFixed(2)},${Number(s.cashSales).toFixed(2)},${Number(s.cardSales || 0).toFixed(2)},${Number(s.mobileSales || 0).toFixed(2)},${Number(s.expectedClosingBalance).toFixed(2)},"${actual}","${variance}","${s.status}","${esc(s.remarks || '')}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `shift_audits_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${sortedShifts.length} shift audits`);
        return true;
    } catch (error) {
        console.error('Failed to export shift audits', error);
        toast.error('Failed to export shift audits');
        return false;
    }
};
