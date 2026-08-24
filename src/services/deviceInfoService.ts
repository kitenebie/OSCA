// ============================================================
// DEVICE INFO SERVICE
// Captures device name (browser/OS), IP address, and location
// ============================================================

export interface DeviceInfo {
  deviceName: string;  // e.g. "Chrome 115 on Windows 11"
  ipAddress: string;   // e.g. "192.168.1.100"
  location: string;    // e.g. "Quezon City, Metro Manila"
}

/**
 * Parse the User-Agent string to get a human-readable device name.
 * Format: "BrowserName Version on OS Name"
 */
function parseDeviceName(): string {
  const ua = navigator.userAgent;

  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browser = `Edge ${match?.[1]?.split('.')[0] || ''}`.trim();
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browser = `Chrome ${match?.[1]?.split('.')[0] || ''}`.trim();
  } else if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browser = `Firefox ${match?.[1]?.split('.')[0] || ''}`.trim();
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    const match = ua.match(/Version\/([\d.]+)/);
    browser = `Safari ${match?.[1]?.split('.')[0] || ''}`.trim();
  }

  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('Windows NT 10.0')) {
    // Windows 11 also reports as NT 10.0, check for build number
    os = ua.includes('Windows NT 10.0; Win64') ? 'Windows' : 'Windows';
    // Attempt to detect Win 11 via platform version (not always reliable from UA alone)
    if (navigator.userAgentData) {
      // Modern browsers: use getHighEntropyValues for accurate OS version
      os = 'Windows';
    } else {
      os = 'Windows 10/11';
    }
  } else if (ua.includes('Windows NT 6.3')) {
    os = 'Windows 8.1';
  } else if (ua.includes('Windows NT 6.1')) {
    os = 'Windows 7';
  } else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    const version = match?.[1]?.replace(/_/g, '.') || '';
    os = `macOS ${version}`.trim();
  } else if (ua.includes('Linux') && ua.includes('Android')) {
    const match = ua.match(/Android ([\d.]+)/);
    os = `Android ${match?.[1] || ''}`.trim();
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS ([\d_]+)/);
    const version = match?.[1]?.replace(/_/g, '.') || '';
    os = `iOS ${version}`.trim();
  }

  return `${browser} on ${os}`;
}

/**
 * Get the PC/hostname if available via modern User-Agent Client Hints API.
 * Falls back to device name from UA parsing.
 */
async function getEnhancedDeviceName(): Promise<string> {
  const baseName = parseDeviceName();

  // Try to get more detailed platform info via Client Hints (Chromium browsers)
  if (navigator.userAgentData) {
    try {
      const highEntropy = await navigator.userAgentData.getHighEntropyValues([
        'platform',
        'platformVersion',
        'model',
      ]);
      const platform = highEntropy.platform || '';
      const version = highEntropy.platformVersion || '';
      const model = highEntropy.model || '';

      // Build enhanced name
      let osLabel = platform;
      if (platform === 'Windows' && version) {
        const major = parseInt(version.split('.')[0]);
        osLabel = major >= 13 ? 'Windows 11' : 'Windows 10';
      } else if (platform === 'macOS' && version) {
        osLabel = `macOS ${version}`;
      }

      const browserPart = baseName.split(' on ')[0];
      const modelPart = model ? ` (${model})` : '';
      return `${browserPart} on ${osLabel}${modelPart}`;
    } catch {
      // Client hints not supported or rejected
    }
  }

  return baseName;
}

/**
 * Fetch the client's public IP address and approximate location.
 * Uses ip-api.com (free, no API key needed, 45 req/min limit).
 * Falls back gracefully on failure.
 */
async function fetchIpAndLocation(): Promise<{ ip: string; location: string }> {
  try {
    const response = await fetch('http://ip-api.com/json/?fields=query,city,regionName,country', {
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) throw new Error('IP API failed');

    const data = await response.json();
    const ip = data.query || 'Unknown';
    const parts = [data.city, data.regionName, data.country].filter(Boolean);
    const location = parts.length > 0 ? parts.join(', ') : 'Unknown location';

    return { ip, location };
  } catch {
    // Fallback: try ipify for IP only
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(3000),
      });
      const ipData = await ipResponse.json();
      return { ip: ipData.ip || 'Unknown', location: 'Unknown location' };
    } catch {
      return { ip: 'Unknown', location: 'Unknown location' };
    }
  }
}

/**
 * Collect all device info for session creation.
 * This should be called once during login.
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const [deviceName, ipLocation] = await Promise.all([
    getEnhancedDeviceName(),
    fetchIpAndLocation(),
  ]);

  return {
    deviceName,
    ipAddress: ipLocation.ip,
    location: ipLocation.location,
  };
}
