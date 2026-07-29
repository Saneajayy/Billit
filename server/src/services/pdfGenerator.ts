import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = async (invoiceData: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `${invoiceData.invoiceNumber}.pdf`;
      
      // Ensure directory exists
      const pdfsDir = path.join(__dirname, '../../../.volumes/pdfs');
      if (!fs.existsSync(pdfsDir)) {
        fs.mkdirSync(pdfsDir, { recursive: true });
      }

      const filePath = path.join(pdfsDir, filename);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // --- Header ---
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', { align: 'center' })
        .moveDown();

      // --- Business Details ---
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(invoiceData.user.businessName)
        .font('Helvetica')
        .text(invoiceData.user.businessAddress)
        .text(`GSTIN: ${invoiceData.user.businessGSTIN}`)
        .text(`State: ${invoiceData.user.businessState}`)
        .moveDown();

      // --- Invoice Info & Customer Details ---
      const customerY = doc.y;
      
      doc
        .text(`Invoice Number: ${invoiceData.invoiceNumber}`)
        .text(`Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString()}`)
        .text(`Due Date: ${invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : 'N/A'}`);

      doc
        .font('Helvetica-Bold')
        .text('Billed To:', 300, customerY)
        .font('Helvetica')
        .text(invoiceData.customer.name, 300)
        .text(invoiceData.customer.billingAddress || 'N/A', 300)
        .text(`GSTIN: ${invoiceData.customer.gstin || 'Unregistered'}`, 300)
        .text(`State: ${invoiceData.customer.billingState}`, 300);

      doc.moveDown(3);

      // --- Line Items Table Header ---
      let currentY = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, currentY);
      doc.text('Qty', 250, currentY);
      doc.text('Price', 300, currentY);
      doc.text('Taxable', 350, currentY);
      
      if (invoiceData.isInterState) {
        doc.text('IGST', 420, currentY);
      } else {
        doc.text('CGST', 400, currentY);
        doc.text('SGST', 450, currentY);
      }
      
      doc.text('Total', 500, currentY, { width: 50, align: 'right' });
      
      doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();
      doc.font('Helvetica');
      currentY += 25;

      // --- Line Items ---
      invoiceData.lineItems.forEach((item: any) => {
        doc.text(item.description, 50, currentY, { width: 180 });
        doc.text(item.quantity.toString(), 250, currentY);
        doc.text(item.unitPrice.toFixed(2), 300, currentY);
        doc.text(item.taxableValue.toFixed(2), 350, currentY);
        
        if (invoiceData.isInterState) {
          doc.text(item.igstAmount.toFixed(2), 420, currentY);
        } else {
          doc.text(item.cgstAmount.toFixed(2), 400, currentY);
          doc.text(item.sgstAmount.toFixed(2), 450, currentY);
        }
        
        doc.text(item.lineTotal.toFixed(2), 500, currentY, { width: 50, align: 'right' });
        currentY += 20;
      });

      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 15;

      // --- Totals ---
      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', 350, currentY);
      doc.text(invoiceData.subtotal.toFixed(2), 500, currentY, { width: 50, align: 'right' });
      currentY += 15;

      if (invoiceData.isInterState) {
        doc.text('Total IGST:', 350, currentY);
        doc.text(invoiceData.totalIGST.toFixed(2), 500, currentY, { width: 50, align: 'right' });
      } else {
        doc.text('Total CGST:', 350, currentY);
        doc.text(invoiceData.totalCGST.toFixed(2), 500, currentY, { width: 50, align: 'right' });
        currentY += 15;
        doc.text('Total SGST:', 350, currentY);
        doc.text(invoiceData.totalSGST.toFixed(2), 500, currentY, { width: 50, align: 'right' });
      }
      currentY += 20;

      doc.fontSize(12);
      doc.text('Grand Total:', 350, currentY);
      doc.text(invoiceData.grandTotal.toFixed(2), 500, currentY, { width: 50, align: 'right' });

      // Footer
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('grey')
        .text('This is a computer-generated invoice.', 50, 700, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        // Return the public URL path
        resolve(`/pdfs/${filename}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};
