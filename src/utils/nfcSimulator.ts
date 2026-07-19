/**
 * NFC Utility & Simulator for Senior Citizen ID Profiling
 * 
 * DESIGN CONTEXT:
 * Web NFC is currently only supported in Chrome for Android with built-in NFC hardware.
 * In a desktop admin workstation scenario utilizing external USB NFC readers/writers (such as ACR122U),
 * a standard pure-web application cannot communicate directly with the USB device due to browser security sandboxes.
 * 
 * TRANSITION TO PRODUCTION BACKEND PHASE:
 * To write to physical NFC cards from a desktop admin computer, you should:
 * 1. Build a desktop application shell using Electron (wrapping this React app).
 * 2. Use a native Node.js NFC library (like `@pokusew/pcsclite` or `node-nfc`) inside the Electron main process.
 * 3. Bridge communication between this frontend UI and the native scanner using Electron IPC (ipcRenderer/ipcMain).
 */

export interface NFCPayload {
  oscaNumber: string;
  fullName: string;
  barangay: string;
  birthdate: string;
  pensioner: boolean;
  timestamp: string;
}

export const isWebNFCSupported = (): boolean => {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
};

/**
 * Attempts to write data to an NFC tag using Web NFC (if supported),
 * or simulates the write in fallback environments.
 */
export const writeToNFCTag = async (
  payload: NFCPayload,
  onStatusUpdate: (status: string, isError?: boolean) => void
): Promise<boolean> => {
  if (isWebNFCSupported()) {
    onStatusUpdate('Web NFC detected. Please tap the NFC card on the back of your device...');
    try {
      // Create instances for Web NFC
      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();
      
      // Open communication
      await ndef.write({
        records: [
          {
            recordType: 'mime',
            mediaType: 'application/json',
            data: new TextEncoder().encode(JSON.stringify(payload))
          }
        ]
      });

      onStatusUpdate('Successfully wrote senior credentials to physical NFC Tag!', false);
      return true;
    } catch (error: any) {
      console.error('Web NFC Error:', error);
      onStatusUpdate(`Failed to write to NFC card: ${error.message || error}`, true);
      return false;
    }
  } else {
    // Desktop Simulation Mode
    onStatusUpdate('NFC Simulation Mode initialized. Connecting to mock USB writer (Virtual ACR122U)...');
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onStatusUpdate('Mock USB Writer connected on Port COM4 (State: Ready).');
    
    await new Promise((resolve) => setTimeout(resolve, 1200));
    onStatusUpdate('Card detected on scanner. Writing NDEF Sector 0 & Sector 1...');
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onStatusUpdate(`Writing Record: MIME/json [OSCA: ${payload.oscaNumber}]...`);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onStatusUpdate('Verifying blocks and checksum blocks (MOCK CRC32)...');
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    onStatusUpdate('SUCCESS: Simulation write verified! Senior ID synchronized with NFC card sector payload.', false);
    return true;
  }
};
