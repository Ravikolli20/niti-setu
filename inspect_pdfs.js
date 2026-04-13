import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

async function checkPdf(filePath) {
  try {
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`\n--- ${filePath} ---`);
    if (fields.length === 0) {
      console.log("No AcroForm fields found.");
    } else {
      console.log(`${fields.length} fields found:`);
      fields.forEach(f => {
        console.log(`- ${f.getName()} (${f.constructor.name})`);
      });
    }
  } catch (err) {
    console.error(`Error checking ${filePath}:`, err.message);
  }
}

async function main() {
  const pdfs = [
    'server/pdfs/pmkisan.pdf',
    'server/pdfs/kcc.pdf',
    'server/pdfs/pmfby.pdf'
  ];

  for (const pdf of pdfs) {
    if (fs.existsSync(pdf)) {
      await checkPdf(pdf);
    }
  }
}

main();
