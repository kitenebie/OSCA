import FingerprintScanner from '../fingerprint/FingerprintScanner';

interface ThumbprintCaptureProps {
  value: string | null;
  onChange: (imageUrl: string | null) => void;
}

export default function ThumbprintCapture({ value, onChange }: ThumbprintCaptureProps) {
  return <FingerprintScanner imageDataUrl={value} onImageCaptured={onChange} />;
}
