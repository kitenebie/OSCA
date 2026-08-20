import { useState, useCallback } from 'react';
import { NcscFormFiller, fillNcscForm } from '../utils/ncscFormFiller';
import type { SeniorCitizen, NCSCDataForm } from '../types';

interface UseNcscPdfExportReturn {
  /** Whether PDF generation is in progress */
  isGenerating: boolean;
  /** Error message if generation failed */
  error: string | null;
  /** Preview URL (blob URL) for iframe embed — revoke when done */
  previewUrl: string | null;
  /** Generate and download the filled NCSC PDF */
  downloadFilledPdf: (options: ExportOptions) => Promise<void>;
  /** Generate a preview blob URL for iframe display */
  generatePreview: (options: ExportOptions) => Promise<string | null>;
  /** Revoke the current preview URL (call on unmount or before generating new one) */
  revokePreview: () => void;
}

interface ExportOptions {
  senior: SeniorCitizen;
  formData?: Partial<NCSCDataForm>;
  interviewerName?: string;
  interviewDate?: string;
  interviewPlace?: string;
  flatten?: boolean;
  filename?: string;
}

/**
 * React hook for generating filled NCSC Senior Citizen Data Form PDFs.
 * 
 * Usage in component:
 * ```tsx
 * const { isGenerating, error, downloadFilledPdf } = useNcscPdfExport();
 * 
 * const handleExport = () => {
 *   downloadFilledPdf({
 *     senior: selectedSenior,
 *     formData: interviewFormState,
 *     interviewerName: currentUser.fullName,
 *     interviewDate: new Date().toLocaleDateString(),
 *     interviewPlace: 'OSCA Office, Juban, Sorsogon',
 *   });
 * };
 * ```
 */
export function useNcscPdfExport(): UseNcscPdfExportReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const downloadFilledPdf = useCallback(async (options: ExportOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await fillNcscForm({
        senior: options.senior,
        formData: options.formData,
        interviewerName: options.interviewerName,
        interviewDate: options.interviewDate,
        interviewPlace: options.interviewPlace,
        flatten: options.flatten ?? false,
      });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = options.filename || 
        `NCSC_${options.senior.lastName}_${options.senior.firstName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate PDF';
      setError(msg);
      console.error('[useNcscPdfExport] Error:', e);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generatePreview = useCallback(async (options: ExportOptions): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    // Revoke old preview if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    try {
      const blob = await fillNcscForm({
        senior: options.senior,
        formData: options.formData,
        interviewerName: options.interviewerName,
        interviewDate: options.interviewDate,
        interviewPlace: options.interviewPlace,
        flatten: options.flatten ?? false,
      });

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate preview';
      setError(msg);
      console.error('[useNcscPdfExport] Preview Error:', e);
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
