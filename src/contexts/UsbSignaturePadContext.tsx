import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

interface UsbSignaturePadContextType {
  /** The field ID that is currently active (receiving signature pad input) */
  activeFieldId: string | null;
  /** Whether the USB device is connected */
  isConnected: boolean;
  /** Whether currently receiving data from the pad */
  isCapturing: boolean;
  /** Error message if any */
  error: string | null;
  /** Activate a specific field to receive the next signature */
  activateField: (fieldId: string) => void;
  /** Deactivate current field */
  deactivateField: () => void;
  /** Connect to USB signature pad device */
  connectDevice: () => Promise<void>;
  /** Disconnect USB device */
  disconnectDevice: () => void;
  /** Register a callback for when signature data is captured for a specific field */
  registerFieldCallback: (fieldId: string, callback: (dataUrl: string) => void) => void;
  /** Unregister a field callback */
  unregisterFieldCallback: (fieldId: string) => void;
}

const UsbSignaturePadContext = createContext<UsbSignaturePadContextType | null>(null);

export function useUsbSignaturePad() {
  const ctx = useContext(UsbSignaturePadContext);
  if (!ctx) {
    throw new Error('useUsbSignaturePad must be used within UsbSignaturePadProvider');
  }
  return ctx;
}

interface Props {
  children: React.ReactNode;
}

export function UsbSignaturePadProvider({ children }: Props) {
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceRef = useRef<USBDevice | null>(null);
  const callbacksRef = useRef<Map<string, (dataUrl: string) => void>>(new Map());
  const pollingRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        try { deviceRef.current.close(); } catch (_) {}
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Register/unregister field callbacks
  const registerFieldCallback = useCallback((fieldId: string, callback: (dataUrl: string) => void) => {
    callbacksRef.current.set(fieldId, callback);
  }, []);

  const unregisterFieldCallback = useCallback((fieldId: string) => {
    callbacksRef.current.delete(fieldId);
  }, []);

  // Activate a field — only one can be active at a time
  const activateField = useCallback((fieldId: string) => {
    setActiveFieldId(fieldId);
    setError(null);
  }, []);

  // Deactivate current field
  const deactivateField = useCallback(() => {
    setActiveFieldId(null);
  }, []);

  // Convert raw signature data to canvas PNG dataUrl
  const processSignatureData = useCallback((rawData: Uint8Array): string | null => {
    try {
      // Create offscreen canvas to render the signature
      const canvas = document.createElement('canvas');
      const width = 500;
      const height = 160;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Clear with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Signature pad typically sends coordinate pairs (x, y) as 16-bit values
      // Parse the raw data as pen stroke coordinates
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      let penDown = false;
      const dataView = new DataView(rawData.buffer);
      let i = 0;

      while (i + 4 <= rawData.byteLength) {
        // Read status byte, x (16-bit), y (16-bit)
        const status = rawData[i];
        const x = dataView.getUint16(i + 1, true);
        const y = dataView.getUint16(i + 3, true);
        i += 5;

        // Normalize coordinates to canvas size
        const normalizedX = (x / 10000) * width;
        const normalizedY = (y / 10000) * height;

        if (status & 0x01) {
          // Pen is touching the pad
          if (!penDown) {
            ctx.moveTo(normalizedX, normalizedY);
            penDown = true;
          } else {
            ctx.lineTo(normalizedX, normalizedY);
          }
        } else {
          // Pen lifted
          if (penDown) {
            ctx.stroke();
            ctx.beginPath();
            penDown = false;
          }
        }
      }

      // Final stroke
      if (penDown) {
        ctx.stroke();
      }

      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Error processing signature data:', err);
      return null;
    }
  }, []);

  // Send captured signature to the active field
  const deliverSignatureToActiveField = useCallback((dataUrl: string) => {
    if (activeFieldId) {
      const callback = callbacksRef.current.get(activeFieldId);
      if (callback) {
        callback(dataUrl);
      }
    }
  }, [activeFieldId]);

  // Connect to USB signature pad
  const connectDevice = useCallback(async () => {
    setError(null);

    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x0403 }, // FTDI (Topaz, ePad)
          { vendorId: 0x04b4 }, // Cypress (Topaz SignatureGem)
          { vendorId: 0x2B24 }, // Wacom STU
          { vendorId: 0x056a }, // Wacom
          { vendorId: 0x5765 }, // Evolis Sig
          { vendorId: 0x0525 }, // ePadLink
          { vendorId: 0x13fe }, // FTDI-based pads
        ],
      });

      deviceRef.current = device;
      await device.open();

      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);

      setIsConnected(true);
      setError(null);

      // Start polling for signature input from device
      startPolling(device);
    } catch (err: any) {
      setIsConnected(false);
      if (err.name === 'NotFoundError') {
        setError('No signature pad selected. Please connect your USB signature pad and try again.');
      } else if (err.name === 'SecurityError') {
        setError('USB access denied. Allow USB access in browser settings.');
      } else {
        setError(err.message || 'Failed to connect to signature pad.');
      }
    }
  }, []);

  // Start polling the USB device for signature data
  const startPolling = useCallback((device: USBDevice) => {
    const inEndpoint = device.configuration?.interfaces[0]?.alternate?.endpoints?.find(
      (ep) => ep.direction === 'in'
    );

    if (!inEndpoint) {
      setError('Unable to find input endpoint on the device.');
      return;
    }

    const poll = async () => {
      if (!deviceRef.current) return;
      try {
        setIsCapturing(true);
        const result = await device.transferIn(inEndpoint.endpointNumber, 4096);

        if (result.data && result.data.byteLength > 10) {
          // Got meaningful data — process it
          const rawData = new Uint8Array(result.data.buffer);
          const dataUrl = processSignatureData(rawData);
          if (dataUrl) {
            deliverSignatureToActiveField(dataUrl);
            setIsCapturing(false);
          }
        }
      } catch (err: any) {
        // Transfer errors on disconnect are expected
        if (err.name !== 'NetworkError' && err.name !== 'NotFoundError') {
          console.warn('USB polling error:', err);
        }
        setIsCapturing(false);
      }
    };

    // Poll at interval
    pollingRef.current = window.setInterval(poll, 200);
  }, [processSignatureData, deliverSignatureToActiveField]);

  // Disconnect device
  const disconnectDevice = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (deviceRef.current) {
      try { deviceRef.current.close(); } catch (_) {}
      deviceRef.current = null;
    }
    setIsConnected(false);
    setIsCapturing(false);
    setActiveFieldId(null);
  }, []);

  return (
    <UsbSignaturePadContext.Provider
      value={{
        activeFieldId,
        isConnected,
        isCapturing,
        error,
        activateField,
        deactivateField,
        connectDevice,
        disconnectDevice,
        registerFieldCallback,
        unregisterFieldCallback,
      }}
    >
      {children}
    </UsbSignaturePadContext.Provider>
  );
}
