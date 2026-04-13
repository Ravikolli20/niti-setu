// src/utils/pdfUtils.ts
import { PDFDocument } from 'pdf-lib';
import type { FarmerProfile } from '../types';

/**
 * Maps farmer profile data to PM-KISAN form fields.
 */
const PM_KISAN_MAPPING: Record<string, keyof FarmerProfile | string> = {
  full_name: 'name',
  age: 'age',
  gender: 'gender',
  land_size: 'landSize',
  income: 'income',
  state: 'state',
  district: 'district',
};

/**
 * Loads a PDF template, fills it with profile data, and triggers a download.
 */
export async function fillAndDownloadPdf(
  templatePath: string,
  profile: FarmerProfile,
  fileName: string
) {
  try {
    // 1. Fetch the template
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error(`Failed to fetch PDF template: ${response.statusText}`);
    const pdfBytes = await response.arrayBuffer();

    // 2. Load the document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // 3. Map and fill fields
    // We iterate through all fields in the PDF form
    const fields = form.getFields();
    fields.forEach((field) => {
      const fieldName = field.getName();
      const profileKey = PM_KISAN_MAPPING[fieldName];

      if (profileKey) {
        const value = profile[profileKey as keyof FarmerProfile];
        if (value !== undefined) {
          const textField = form.getTextField(fieldName);
          textField.setText(String(value));
        }
      }
    });

    // 4. Flatten the form to prevent editing (optional, but professional)
    form.flatten();

    // 5. Serialize the PDF document to bytes (Uint8Array)
    const filledPdfBytes = await pdfDoc.save();

    // 6. Trigger download
    const blob = new Blob([filledPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error filling PDF:', error);
    throw error;
  }
}
