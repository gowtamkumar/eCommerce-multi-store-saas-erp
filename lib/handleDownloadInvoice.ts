import { useSettings } from '@/contexts/SettingsContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * Custom hook to provide invoice download functionality
 */
export const useDownloadInvoice = () => {
  const { formatPrice, settings } = useSettings();

  const downloadInvoice = (order: any) => {
    if (!order) return;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // brand color
    doc.text(`${settings?.brandName || 'Store'}`, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Official Invoice', 14, 28);

    // Order Info
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Order ID: ${order?.id?.slice(-6).toUpperCase()}`, 140, 22);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 28);

    // Customer Details
    doc.text(`Bill To:`, 14, 45);
    doc.setFontSize(12);
    doc.text(order?.customerName || '', 14, 52);
    doc.setFontSize(10);
    doc.text(order?.address || '', 14, 58);
    doc.text(order?.customerPhone || '', 14, 64);

    // Table
    autoTable(doc, {
      startY: 75,
      head: [['Item Description', 'Qty', 'Unit Price', 'Discount', 'Total']],
      body: [
        [
          order?.productId?.name || 'Item',
          order?.quantity || 1,
          `${formatPrice(order?.unitPrice || 0)}`,
          `${formatPrice(order?.discountAmount || 0)}`,
          `${formatPrice(order?.totalAmount || 0)}`
        ]
      ],
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 }
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Paid: ${formatPrice(order?.totalAmount || 0)}`, 140, finalY);

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(`Thank you for shopping with ${settings?.brandName || 'us'}.`, 14, finalY + 20);

    doc.save(`invoice-${order?.id}.pdf`);
    toast.success('Invoice downloaded!');
  };

  return { downloadInvoice };
};
