/// <reference types="@digitalpersona/websdk" />
/// <reference types="@digitalpersona/fingerprint" />

// HID ships browser-only scripts. Vite copies these installed package assets
// into the production build; they must execute in this order as classic scripts.
import webSdkUrl from '../../node_modules/@digitalpersona/websdk/dist/websdk.client.ui.min.js?url';
import fingerprintSdkUrl from '../../node_modules/@digitalpersona/fingerprint/dist/fingerprint.sdk.min.js?url';

export interface ScannerStatus {
  connected: boolean;
  device: string | null;
  error?: string;
}

export interface CaptureResult {
  success: true;
  qualityLabel: string;
  message: string;
  imageDataUrl?: string;
}

export class FingerprintError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FingerprintError';
  }
}

let sdkReady: Promise<void> | null = null;
let reader: Fingerprint.WebApi | null = null;
let activeCancellation: (() => void) | null = null;

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new FingerprintError('Could not load the HID fingerprint SDK.', 'sdk_unavailable'));
    document.head.appendChild(script);
  });
}

async function getReader(): Promise<Fingerprint.WebApi> {
  if (!sdkReady) {
    sdkReady = loadScript(webSdkUrl).then(() => loadScript(fingerprintSdkUrl)).catch(error => {
      sdkReady = null;
      throw error;
    });
  }
  await sdkReady;
  if (typeof Fingerprint === 'undefined' || !Fingerprint.WebApi) {
    throw new FingerprintError('HID fingerprint SDK is unavailable.', 'sdk_unavailable');
  }
  return reader ??= new Fingerprint.WebApi();
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new FingerprintError(message, 'timeout')), ms);
    promise.then(
      value => { window.clearTimeout(timer); resolve(value); },
      error => { window.clearTimeout(timer); reject(error); },
    );
  });
}

function agentError(): FingerprintError {
  return new FingerprintError('DigitalPersona Agent unavailable. Install or start HID Authentication Device Client on this computer.', 'agent_unavailable');
}

export async function checkScanner(): Promise<ScannerStatus> {
  try {
    const api = await getReader();
    const devices = await withTimeout(api.enumerateDevices(), 5000, 'DigitalPersona Agent did not respond.');
    return devices.length
      ? { connected: true, device: 'DigitalPersona fingerprint reader' }
      : { connected: false, device: null, error: 'Scanner Disconnected. Check the U.are.U 4500 USB connection and driver.' };
  } catch (error) {
    if (error instanceof FingerprintError && error.code === 'sdk_unavailable') throw error;
    throw agentError();
  }
}

function qualityLabel(code: Fingerprint.QualityCode): string {
  const name = Fingerprint.QualityCode[code] || 'Unknown';
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export async function captureFingerprint(signal?: AbortSignal, captureImage = false): Promise<CaptureResult> {
  if (activeCancellation) throw new FingerprintError('Scanner is already in use.', 'busy');
  if (signal?.aborted) throw new FingerprintError('Scan cancelled.', 'cancelled');

  const status = await checkScanner();
  if (signal?.aborted) throw new FingerprintError('Scan cancelled.', 'cancelled');
  if (!status.connected) throw new FingerprintError(status.error || 'Scanner Disconnected.', 'disconnected');
  const api = await getReader();
  if (signal?.aborted) throw new FingerprintError('Scan cancelled.', 'cancelled');
  if (activeCancellation) throw new FingerprintError('Scanner is already in use.', 'busy');

  return new Promise<CaptureResult>((resolve, reject) => {
    let finished = false;
    let acquisitionRequested = false;
    let latestQuality = 'Not reported';
    let timer: number;

    const finish = (result?: CaptureResult, error?: FingerprintError) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      api.off('SamplesAcquired', onSample as Fingerprint.Handler<Fingerprint.Event>);
      api.off('QualityReported', onQuality as Fingerprint.Handler<Fingerprint.Event>);
      api.off('DeviceDisconnected', onDisconnect as Fingerprint.Handler<Fingerprint.Event>);
      api.off('CommunicationFailed', onCommunicationFailed as Fingerprint.Handler<Fingerprint.Event>);
      api.off('ErrorOccurred', onReaderError as Fingerprint.Handler<Fingerprint.Event>);

      const stop = acquisitionRequested
        ? withTimeout(api.stopAcquisition(), 3000, 'Could not stop scanner.').catch(() => undefined)
        : Promise.resolve();
      void stop.finally(() => {
        activeCancellation = null;
        if (error) reject(error);
        else resolve(result!);
      });
    };

    const onAbort = () => finish(undefined, new FingerprintError('Scan cancelled.', 'cancelled'));
    const onSample = (event: Fingerprint.SamplesAcquired) => {
      if (!event.samples || event.samples === '[]') return;
      if (!captureImage) {
        // Configuration test never retains the biometric sample.
        finish({ success: true, qualityLabel: latestQuality, message: 'Fingerprint Captured' });
        return;
      }
      try {
        if (event.sampleFormat !== Fingerprint.SampleFormat.PngImage) throw new Error('Unexpected sample format');
        const samples: unknown = JSON.parse(event.samples);
        if (!Array.isArray(samples) || typeof samples[0] !== 'string') throw new Error('No PNG sample');
        const encoded = samples[0] as string;
        if (encoded.length > 2_800_000) throw new Error('PNG sample is too large');
        const pngBytes = Fingerprint.b64UrlToUtf8(encoded);
        if (!pngBytes.startsWith('\x89PNG\r\n\x1a\n')) throw new Error('Invalid PNG sample');
        const imageDataUrl = `data:image/png;base64,${window.btoa(pngBytes)}`;
        finish({ success: true, qualityLabel: latestQuality, message: 'Fingerprint Captured', imageDataUrl });
      } catch {
        finish(undefined, new FingerprintError('Scanner returned an invalid fingerprint image. Try again.', 'invalid_image'));
      }
    };
    const onQuality = (event: Fingerprint.QualityReported) => {
      latestQuality = qualityLabel(event.quality);
      if (event.quality !== Fingerprint.QualityCode.Good) {
        finish(undefined, new FingerprintError(`Poor Fingerprint Quality: ${latestQuality}. Try again.`, 'poor_quality'));
      }
    };
    const onDisconnect = () => finish(undefined, new FingerprintError('Scanner Disconnected.', 'disconnected'));
    const onCommunicationFailed = () => finish(undefined, agentError());
    const onReaderError = () => finish(undefined, new FingerprintError('Scanner Error. Check the U.are.U driver and try again.', 'scanner_error'));

    activeCancellation = onAbort;
    signal?.addEventListener('abort', onAbort, { once: true });
    api.on('SamplesAcquired', onSample);
    api.on('QualityReported', onQuality);
    api.on('DeviceDisconnected', onDisconnect);
    api.on('CommunicationFailed', onCommunicationFailed);
    api.on('ErrorOccurred', onReaderError);
    timer = window.setTimeout(() => finish(undefined, new FingerprintError('Scan timed out. Place a finger on the scanner and try again.', 'timeout')), 15000);

    acquisitionRequested = true;
    void withTimeout(api.startAcquisition(captureImage ? Fingerprint.SampleFormat.PngImage : Fingerprint.SampleFormat.Intermediate), 5000, 'Could not start scanner.')
      .catch(() => finish(undefined, agentError()));
  });
}

export async function cancelCapture(): Promise<void> {
  activeCancellation?.();
}
