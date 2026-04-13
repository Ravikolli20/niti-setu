import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function createForm() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 500]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Title
  page.drawText('PM-KISAN Application Form', {
    x: 50, y: 450, size: 24, font: boldFont, color: rgb(0, 0.2, 0.5)
  });
  
  page.drawText('Self-Declaration for Scheme Eligibility', {
    x: 50, y: 420, size: 12, font: font, color: rgb(0.3, 0.3, 0.3)
  });

  const form = pdfDoc.getForm();

  // Helper for drawing labels and fields
  let currentY = 370;
  const drawField = (label, name, width = 200) => {
    page.drawText(label, { x: 50, y: currentY, size: 12, font: boldFont });
    const field = form.createTextField(name);
    field.addToPage(page, { x: 200, y: currentY - 5, width, height: 20 });
    currentY -= 40;
  };

  drawField('Full Name:', 'full_name');
  drawField('Age:', 'age', 50);
  drawField('Gender:', 'gender', 80);
  drawField('Land Size (Acres):', 'land_size', 50);
  drawField('Income (Annual):', 'income', 100);
  drawField('State:', 'state', 150);
  drawField('District:', 'district', 150);

  // Signature area
  page.drawText('Applicant Signature:', { x: 400, y: 50, size: 10, font: font });
  page.drawLine({
    start: { x: 400, y: 45 },
    end: { x: 550, y: 45 },
    thickness: 1,
    color: rgb(0, 0, 0)
  });

  const pdfBytes = await pdfDoc.save();
  
  if (!fs.existsSync('client/public/forms')) {
    fs.mkdirSync('client/public/forms', { recursive: true });
  }
  
  fs.writeFileSync('client/public/forms/pmkisan_form.pdf', pdfBytes);
  console.log('Successfully created client/public/forms/pmkisan_form.pdf');
}

createForm();
