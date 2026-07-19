import { domToCanvas } from 'modern-screenshot';
import { jsPDF } from 'jspdf';

/**
 * Exports a target HTML element to a PDF file.
 * 
 * @param elementId The ID of the HTML element to render and export
 * @param filename The desired filename for the downloaded PDF
 * @param orientation 'p' (portrait) or 'l' (landscape)
 * @param format PDF format sizes ('a4', 'letter', or custom like CR80 dimensions [85.6, 54] in mm)
 */
export const exportElementToPDF = async (
  elementId: string,
  filename: string,
  orientation: 'p' | 'l' = 'p',
  format: string | number[] = 'a4'
): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return false;
  }

  try {
    const canvas = await domToCanvas(element, {
      scale: 2, // Retain high resolution for text and barcodes
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Create jsPDF instance
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate aspect ratio
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Centered or top aligned depending on size
    const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;

    pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    return false;
  }
};

/**
 * Specifically exports the double-sided CR80-sized Senior ID Card.
 * Standard CR80 card size is 85.6mm x 54mm (3.375 inches x 2.125 inches).
 */
export const exportSeniorIDCardPDF = async (
  frontElementId: string,
  backElementId: string,
  seniorName: string
): Promise<boolean> => {
  const front = document.getElementById(frontElementId);
  const back = document.getElementById(backElementId);

  if (!front || !back) {
    console.error('Front or Back ID card elements not found.');
    return false;
  }

  try {
    const canvasFront = await domToCanvas(front, {
      scale: 3, // Very high definition for printing
      backgroundColor: '#ffffff'
    });
    const canvasBack = await domToCanvas(back, {
      scale: 3,
      backgroundColor: '#ffffff'
    });

    const imgFront = canvasFront.toDataURL('image/png', 1.0);
    const imgBack = canvasBack.toDataURL('image/png', 1.0);

    // Create a landscape PDF with custom CR80 dimensions: 85.6mm x 54.0mm
    const pdf = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: [85.6, 54]
    });

    // Page 1: Front of ID
    pdf.addImage(imgFront, 'PNG', 0, 0, 85.6, 54);
    
    // Page 2: Back of ID
    pdf.addPage([85.6, 54], 'l');
    pdf.addImage(imgBack, 'PNG', 0, 0, 85.6, 54);

    pdf.save(`SENIOR_ID_${seniorName.replace(/\s+/g, '_').toUpperCase()}.pdf`);
    return true;
  } catch (error) {
    console.error('Senior ID Export Error:', error);
    return false;
  }
};
