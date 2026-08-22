import { useState, useCallback } from 'react';
import { fillCentenarianForm } from '../utils/centenarianFormFiller';
import type { SeniorCitizen, CentenarianApplication } from '../types';

interface UseCentenarianPdfExportReturn {
  /** Whether PDF generation is in progress */
  isGenerating: boolean;
  /** Error message if generation failed */
  error: string | null;
  /** Preview URL (blob URL) for iframe embed — revoke when done */
  previewUrl: string | null;
  /** Generate and download the filled Centenarian PDF */
  downloadFilledPdf: (options: CentenarianExportOptions) => Promise<void>;
  /** Generate a preview blob URL for iframe display */
  generatePreview: (options: CentenarianExportOptions) => Promise<string | null>;
  /** Revoke the current preview URL (call on unmount or before generating new one) */
  revokePreview: () => void;
}

interface CentenarianExportOptions {
  senior: SeniorCitizen;
  centenarianApp?: CentenarianApplication;
  flatten?: boolean;
  filename?: string;
}

/**
 * React hook for generating filled Centenarian Honoring Grantee Claim Form PDFs.
 * 
 * Usage in component:
 * ```tsx
 * const { isGenerating, error, generatePreview, downloadFilledPdf } = useCentenarianPdfExport();
 * 
 * const handlePreview = () => {
 *   generatePreview({
 *     senior: selectedSenior,
 *     centenarianApp: centenarianData[0],
 *   });
 * };
 * ```
 */
export function useCentenarianPdfExport(): UseCentenarianPdfExportReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const downloadFilledPdf = useCallback(async (options: CentenarianExportOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await fillCentenarianForm({
        senior: options.senior,
        centenarianApp: options.centenarianApp,
        flatten: options.flatten ?? false,
      });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = options.filename ||
        `Centenarian_Honoring_${options.senior.lastName}_${options.senior.firstName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate Centenarian PDF';
      setError(msg);
      console.error('[useCentenarianPdfExport] Error:', e);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generatePreview = useCallback(async (options: CentenarianExportOptions): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    // Revoke old preview if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    try {
      const blob = await fillCentenarianForm({
        senior: options.senior,
        centenarianApp: options.centenarianApp,
        flatten: options.flatten ?? false,
      });

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate Centenarian preview';
      setError(msg);
      console.error('[useCentenarianPdfExport] Preview Error:', e);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [previewUrl]);

  return {
    isGenerating,
    error,
    previewUrl,
    downloadFilledPdf,
    generatePreview,
    revokePreview,
  };
}
