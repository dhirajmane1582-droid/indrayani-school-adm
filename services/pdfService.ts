import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generatePDF = async (elementId: string, fileName: string = 'admission-form.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  try {
    // 1. Capture the element as a canvas
    // scale: 4 for high quality text
    const canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff',
      // Explicitly set dimensions to match A4 ratio in pixels to avoid weird canvas sizes
      width: element.offsetWidth,
      height: element.offsetHeight,
      onclone: (documentClone) => {
        const el = documentClone.getElementById(elementId);
        if (el) {
             (el.style as any).fontSmooth = 'always';
             (el.style as any).webkitFontSmoothing = 'antialiased';
             el.style.filter = 'grayscale(100%)';
        }
      }
    });

    // 2. Setup PDF (A4)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 3; // Reduced to 3mm to maximize printable area while keeping safe zone
    
    const printableWidth = pageWidth - (margin * 2);
    const printableHeight = pageHeight - (margin * 2);

    const imgData = canvas.toDataURL('image/png');
    
    // 3. Calculate dimensions to fit within printable area
    const canvasRatio = canvas.width / canvas.height;
    const printableRatio = printableWidth / printableHeight;

    let renderWidth = printableWidth;
    let renderHeight = printableHeight;

    if (canvasRatio < printableRatio) {
      // Content is taller (narrower) than printable area -> constrain by height
      renderHeight = printableHeight;
      renderWidth = renderHeight * canvasRatio;
    } else {
      // Content is wider -> constrain by width
      renderWidth = printableWidth;
      renderHeight = renderWidth / canvasRatio;

      // Double check height limits
      if (renderHeight > printableHeight) {
         const scale = printableHeight / renderHeight;
         renderHeight = printableHeight;
         renderWidth = renderWidth * scale;
      }
    }

    // Center the image in the printable area
    const xOffset = margin + (printableWidth - renderWidth) / 2;
    const yOffset = margin; // Start from top margin

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF Generation failed:', error);
    throw error;
  }
};