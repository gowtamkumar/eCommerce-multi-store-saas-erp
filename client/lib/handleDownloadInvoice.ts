import { useSettings } from '@/hooks/SettingsContext';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * Custom hook to provide invoice download functionality
 */
export const useDownloadInvoice = () => {
  const { formatPrice, settings } = useSettings();

  const downloadInvoice = (order: any) => {
    try {
      if (!order) {
        toast.error('Order data is missing');
        return;
      }
      const doc = new jsPDF();
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper for multi-line text (address)
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
    doc.text('OFFICIAL INVOICE', margin, 28);

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

    // Invoice & Date Details
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Invoice Details', margin, 50);
    
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    const displayInvoiceNum = order?.invoiceNumber || (order?.id ? `ORD-${order.id.slice(-8).toUpperCase()}` : 'N/A');
    doc.text(`Invoice #: ${displayInvoiceNum}`, margin, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${order?.createdAt ? dayjs(order.createdAt).format('MMMM D, YYYY') : dayjs().format('MMMM D, YYYY')}`, margin, 61);
    doc.text(`Payment: ${order?.paymentMethod || 'N/A'}`, margin, 66);
    if (order?.transactionId) {
      doc.text(`TXN: ${order.transactionId}`, margin, 71);
    }

    // Bill To
    doc.setTextColor(100);
    doc.text('Bill To', pageWidth / 2, 50);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(order?.customerName || 'Customer', pageWidth / 2, 56);
    doc.setFont('helvetica', 'normal');
    const customerDetailsX = pageWidth / 2;
    let customerY = 61;
    if (order?.address) {
      const height = addWrappedText(order.address, customerDetailsX, customerY, 70, 4);
      customerY += height + 1;
    }
    if (order?.customerPhone) {
      doc.text(order.customerPhone, customerDetailsX, customerY);
      customerY += 4;
    }
    if (order?.customerEmail) {
      doc.text(order.customerEmail, customerDetailsX, customerY);
    }

    // Items Table
    const tableBody = (order?.items || []).map((item: any) => {
      const productName = item.snapshot?.productName || item.product?.name || 'Product';
      const variantInfo = item.snapshot?.variantOptions 
        ? Object.entries(item.snapshot.variantOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
        : '';
      const fullName = variantInfo ? `${productName} (${variantInfo})` : productName;
      
      const unitPrice = Number(item.unitPrice || 0);
      const discount = Number(item.discountAmount || 0);
      const netPrice = unitPrice - discount;

      return [
        fullName,
        item.quantity || 0,
        formatPrice(unitPrice),
        discount > 0 ? `-${formatPrice(discount)}` : '0',
        formatPrice(item.totalAmount || (netPrice * item.quantity))
      ];
    });

    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Qty', 'Unit Price', 'Discount', 'Total']],
      body: tableBody,
      headStyles: { 
        fillColor: [79, 70, 229],
        fontSize: 10,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 },
      },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = pageWidth - margin - 60;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);

    let currentY = finalY;
    const subtotal = (order?.items || []).reduce((acc: number, item: any) => acc + (Number(item.unitPrice) * item.quantity), 0);
    const totalDiscount = (order?.items || []).reduce((acc: number, item: any) => acc + (Number(item.discountAmount) * item.quantity), 0);
    
    // Subtotal
    doc.text('Subtotal:', totalsX, currentY);
    doc.setTextColor(0);
    doc.text(formatPrice(subtotal), pageWidth - margin, currentY, { align: 'right' });
    currentY += 6;

    // Discount
    if (totalDiscount > 0 || Number(order?.couponDiscountAmount) > 0) {
        const disc = totalDiscount + Number(order?.couponDiscountAmount || 0);
        doc.setTextColor(100);
        doc.text('Discount:', totalsX, currentY);
        doc.setTextColor(220, 38, 38); // Red
        doc.text(`-${formatPrice(disc)}`, pageWidth - margin, currentY, { align: 'right' });
        currentY += 6;
    }

    // Shipping
    doc.setTextColor(100);
    doc.text('Shipping:', totalsX, currentY);
    doc.setTextColor(0);
    doc.text(Number(order?.shippingFee) === 0 ? 'FREE' : formatPrice(order?.shippingFee || 0), pageWidth - margin, currentY, { align: 'right' });
    currentY += 6;

    // Tax
    if (Number(order?.taxAmount) > 0) {
        doc.setTextColor(100);
        doc.text('Tax:', totalsX, currentY);
        doc.setTextColor(0);
        doc.text(formatPrice(order.taxAmount), pageWidth - margin, currentY, { align: 'right' });
        currentY += 6;
    }

    // Grand Total
    currentY += 2;
    doc.setDrawColor(200);
    doc.line(totalsX, currentY - 4, pageWidth - margin, currentY - 4);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', totalsX, currentY);
    doc.setTextColor(79, 70, 229);
    doc.text(formatPrice(order?.totalAmount || 0), pageWidth - margin, currentY, { align: 'right' });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(`Thank you for your business! Generated on ${dayjs().format('YYYY-MM-DD HH:mm')}`, margin, footerY);
    doc.text(`${settings?.brandName || 'Store'} | ${settings?.contactEmail || ''}`, pageWidth - margin, footerY, { align: 'right' });

    doc.save(`Invoice-${displayInvoiceNum}.pdf`);
    toast.success('Invoice downloaded!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF. Check console for details.');
    }
  };

  return { downloadInvoice };
};
