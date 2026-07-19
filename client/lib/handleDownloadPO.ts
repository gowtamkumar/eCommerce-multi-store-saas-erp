import { useSettings } from '@/hooks/SettingsContext';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * Custom hook to provide Purchase Order (PO) PDF download functionality
 */
export const useDownloadPO = () => {
  const { formatPrice, settings } = useSettings();

  const downloadPO = (order: any) => {
    try {
      if (!order) {
        toast.error('Purchase Order data is missing');
        return;
      }
      const doc = new jsPDF();
      const margin = 14;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Helper for multi-line text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string, index: number) => {
          doc.text(line, x, y + (index * lineHeight));
        });
        return lines.length * lineHeight;
      };

      // Header & Logo
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // brand color
      doc.setFont('helvetica', 'bold');
      doc.text(`${settings?.brandName || 'Store'}`, margin, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL PURCHASE ORDER', margin, 28);

      // Store Details (Top Right)
      doc.setTextColor(0);
      doc.setFontSize(9);
      let storeY = 22;
      const storeDetailsX = pageWidth - margin - 60;
      if (settings?.address) {
        const height = addWrappedText(settings.address, storeDetailsX, storeY, 60, 4);
        storeY += height + 1;
      }
      if (settings?.contactEmail) {
        doc.text(settings.contactEmail, storeDetailsX, storeY);
        storeY += 4;
      }
      if (settings?.contactPhone) {
        doc.text(settings.contactPhone, storeDetailsX, storeY);
      }

      // Horizontal Line
      doc.setDrawColor(230);
      doc.line(margin, 40, pageWidth - margin, 40);

      // PO Details
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('PO Details', margin, 50);
      
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(`PO #: ${order.referenceNumber || 'N/A'}`, margin, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${order.createdAt ? dayjs(order.createdAt).format('MMMM D, YYYY') : dayjs().format('MMMM D, YYYY')}`, margin, 61);
      doc.text(`Status: ${order.status || 'N/A'}`, margin, 66);
      doc.text(`Payment Status: ${order.paymentStatus || 'N/A'}`, margin, 71);

      // Supplier Details (Bill From / Ship To)
      doc.setTextColor(100);
      doc.text('Supplier Details', pageWidth / 2, 50);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(order.supplier?.name || 'Supplier', pageWidth / 2, 56);
      doc.setFont('helvetica', 'normal');
      const supplierX = pageWidth / 2;
      let supplierY = 61;
      if (order.supplier?.contactName) {
        doc.text(`Contact: ${order.supplier.contactName}`, supplierX, supplierY);
        supplierY += 4;
      }
      if (order.supplier?.address) {
        const height = addWrappedText(order.supplier.address, supplierX, supplierY, 70, 4);
        supplierY += height + 1;
      }
      if (order.supplier?.phone) {
        doc.text(`Phone: ${order.supplier.phone}`, supplierX, supplierY);
        supplierY += 4;
      }
      if (order.supplier?.email) {
        doc.text(`Email: ${order.supplier.email}`, supplierX, supplierY);
      }

      // Items Table
      const tableBody = (order.items || []).map((item: any) => {
        const productName = item.product?.name || 'Unknown Product';
        const variantInfo = item.variant?.combination 
          ? Object.entries(item.variant.combination).map(([k, v]) => `${k}: ${v}`).join(', ')
          : '';
        const fullName = variantInfo ? `${productName} (${variantInfo})` : productName;
        
        const unitPrice = Number(item.unitPrice || 0);
        const qty = Number(item.quantity || 0);

        return [
          { content: fullName, styles: { fontStyle: 'bold' } },
          item.variant?.sku || item.product?.slug || 'N/A',
          qty,
          formatPrice(unitPrice),
          formatPrice(qty * unitPrice)
        ];
      });

      autoTable(doc, {
        startY: 85,
        head: [['Description', 'SKU', 'Qty', 'Unit Cost', 'Total']],
        body: tableBody,
        headStyles: { 
          fillColor: [79, 70, 229],
          fontSize: 10,
          halign: 'left',
          textColor: [255, 255, 255]
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40 },
          2: { halign: 'center', cellWidth: 15 },
          3: { halign: 'right', cellWidth: 30 },
          4: { halign: 'right', cellWidth: 30 },
        },
        styles: { fontSize: 9, cellPadding: 4, textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [250, 250, 250] }
      });

      // Totals
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const totalsX = pageWidth - margin - 60;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);

      let currentY = finalY;
      const subtotal = (order.items || []).reduce((acc: number, item: any) => acc + (Number(item.unitPrice) * item.quantity), 0);
      
      // Subtotal
      doc.text('Subtotal:', totalsX, currentY);
      doc.setTextColor(0);
      doc.text(formatPrice(subtotal), pageWidth - margin, currentY, { align: 'right' });
      currentY += 6;

      // Paid Amount
      if (Number(order.paidAmount) > 0) {
        doc.setTextColor(100);
        doc.text('Paid Amount:', totalsX, currentY);
        doc.setTextColor(22, 163, 74); // green
        doc.text(`-${formatPrice(order.paidAmount)}`, pageWidth - margin, currentY, { align: 'right' });
        currentY += 6;
      }

      // Balance Due
      const balance = subtotal - Number(order.paidAmount || 0);
      if (balance > 0) {
        doc.setTextColor(100);
        doc.text('Balance Due:', totalsX, currentY);
        doc.setTextColor(220, 38, 38); // red
        doc.text(formatPrice(balance), pageWidth - margin, currentY, { align: 'right' });
        currentY += 6;
      }

      // Grand Total
      currentY += 2;
      doc.setDrawColor(230);
      doc.line(totalsX, currentY - 4, pageWidth - margin, currentY - 4);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Grand Total:', totalsX, currentY);
      doc.setTextColor(79, 70, 229);
      doc.text(formatPrice(subtotal), pageWidth - margin, currentY, { align: 'right' });

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150);
      doc.text(`Generated on ${dayjs().format('YYYY-MM-DD HH:mm')} | Purchase Order Copy`, margin, footerY);
      doc.text(`${settings?.brandName || 'Store'} | ${settings?.contactEmail || ''}`, pageWidth - margin, footerY, { align: 'right' });

      doc.save(`PO-${order.referenceNumber || order.id}.pdf`);
      toast.success('Purchase Order PDF downloaded!');
    } catch (error) {
      console.error('PO PDF Generation Error:', error);
      toast.error('Failed to generate PO PDF. Check console for details.');
    }
  };

  return { downloadPO };
};
