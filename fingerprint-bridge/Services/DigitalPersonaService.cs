// ============================================================
// OSCA Fingerprint Bridge - DigitalPersona U.are.U 4500 Service
// v2.1 — Returns both fingerprint IMAGE (PNG) and TEMPLATE (FMD)
//
// Uses native DigitalPersona SDK DLLs (dpfpdd.dll + dpfj.dll)
// for REAL biometric template capture and matching.
//
// SETUP:
//   1. Install "DigitalPersona U.are.U SDK" or "One Touch for Windows SDK"
//      Download: https://sdk.hidglobal.com/developer-center/digitalpersona-touchchip
//   2. Copy these DLLs to same folder as FingerprintBridge.exe:
//      - dpfpdd.dll   (Device Driver - capture fingerprint images)
//      - dpfj.dll     (Feature Extraction - create/compare templates)
//      Typical location: C:\Program Files\DigitalPersona\Bin\
//   3. Install the U.are.U 4500 device driver
//      (usually included with the SDK installer)
//
// TEMPLATE FORMAT:
//   This service produces ANSI 378-2004 FMD (Fingerprint Minutiae Data)
//   templates — an industry-standard format suitable for storage in
//   your Supabase database and cross-device matching.
//
// ARCHITECTURE:
//   Web App (React) → POST /api/capture → .NET Bridge → 
//   DigitalPersonaService → dpfpdd.dll → U.are.U 4500 Hardware
// ============================================================

using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Drawing;

namespace FingerprintBridge.Services;

public class DigitalPersonaService : IDisposable
{
    // ═══════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════

    // dpfpdd status codes
    private const int DPFPDD_SUCCESS = 0;
    private const int DPFPDD_E_DEVICE_BUSY = 0x10100005;
    private const int DPFPDD_E_DEVICE_FAILURE = 0x10100006;
    private const int DPFPDD_E_MORE_DATA = 0x10100007;

    // dpfj status codes
    private const int DPFJ_SUCCESS = 0;

    // Capture parameters
    private const int DPFPDD_IMG_FMT_ISOIEC19794 = 0x01A00001; // ISO/IEC 19794-4 image
    private const int DPFPDD_IMG_FMT_ANSI381 = 0x001B0401;     // ANSI 381-2004 image (FID)
    private const int DPFPDD_IMG_FMT_PIXEL_BUFFER = 0;          // Raw pixel buffer
    
    // We capture as PIXEL_BUFFER to get raw grayscale pixels for PNG conversion
    private const int DPFPDD_IMG_PROC_DEFAULT = 0;

    // FMD (template) formats
    private const int DPFJ_FMD_ANSI_378_2004 = 0x001B0001;     // ANSI 378-2004 standard
    private const int DPFJ_FMD_ISO_19794_2_2005 = 0x01010001;  // ISO 19794-2:2005

    // FID (image) formats  
    private const int DPFJ_FID_ANSI_381_2004 = 0x001B0401;     // ANSI 381-2004
    private const int DPFJ_FID_ISO_19794_4_2005 = 0x01010007;  // ISO 19794-4:2005

    // Capture resolution
    private const int DPFPDD_QUALITY_GOOD = 0;
    private const int DPFPDD_QUALITY_TOOMOIST = 1;
    private const int DPFPDD_QUALITY_TOODRY = 2;
    private const int DPFPDD_QUALITY_TOOLIGHT = 3;
    private const int DPFPDD_QUALITY_TOODARK = 4;

    // Dissimilarity threshold (lower = more strict match)
    // DP SDK: 0 = identical, higher = more different
    // Recommended thresholds: 
    //   21474 = FAR 0.1% (1 in 1,000 false accept)
    //   107374 = FAR 1% (1 in 100 false accept)
    private const uint DISSIMILARITY_THRESHOLD = 21474; // FAR 0.1%

    // ═══════════════════════════════════════════════════════════
    // P/INVOKE - dpfpdd.dll (Device Driver)
    // ═══════════════════════════════════════════════════════════

    [DllImport("dpfpdd.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int dpfpdd_init();

    [DllImport("dpfpdd.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int dpfpdd_exit();

    [DllImport("dpfpdd.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int dpfpdd_query_devices(ref int devCount, IntPtr devInfos);

    [DllImport("dpfpdd.dll", CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern int dpfpdd_open([MarshalAs(UnmanagedType.LPStr)] string devName, ref IntPtr devHandle);

    [DllImport("dpfpdd.dll", CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern int dpfpdd_open_ext([MarshalAs(UnmanagedType.LPStr)] string devName, int priority, ref IntPtr devHandle);

    [DllImport("dpfpdd.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int dpfpdd_close(IntPtr devHandle);

    [DllImport("dpfpdd.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int dpfpdd_capture(IntPtr devHandle, ref DPFPDD_CAPTURE_PARAM captureParam,
        uint timeout, ref DPFPDD_CAPTURE_RESULT captureResult, ref uint imageSize, byte[] imageData);

    [DllImport("dpfpdd.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int dpfpdd_get_device_status(IntPtr devHandle, ref DPFPDD_DEV_STATUS status);

    // ═══════════════════════════════════════════════════════════
    // P/INVOKE - dpfj.dll (Feature Extraction & Matching)
    // ═══════════════════════════════════════════════════════════

    [DllImport("dpfj.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int dpfj_create_fmd_from_fid(
        int fidFormat, byte[] fidData, uint fidSize,
        int fmdFormat, byte[] fmdData, ref uint fmdSize);

    [DllImport("dpfj.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int dpfj_compare(
        int fmd1Format, byte[] fmd1, uint fmd1Size, uint fmd1ViewIdx,
        int fmd2Format, byte[] fmd2, uint fmd2Size, uint fmd2ViewIdx,
        ref uint dissimilarity);

    // ═══════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    private struct DPFPDD_DEV_INFO
    {
        public uint size;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 1024)]
        public string name;
        public DPFPDD_HW_DESCR descr;
        public DPFPDD_HW_ID id;
        public DPFPDD_HW_VERSION ver;
        public uint modality;
        public uint technology;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    private struct DPFPDD_HW_DESCR
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)]
        public string vendorName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)]
        public string productName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)]
        public string serialNum;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct DPFPDD_HW_ID
    {
        public ushort vendorId;
        public ushort productId;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct DPFPDD_HW_VERSION
    {
        public DPFPDD_VER hwVer;
        public DPFPDD_VER fwVer;
        public ushort bcdRevision;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct DPFPDD_VER
    {
        public int major;
        public int minor;
        public int maintenance;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct DPFPDD_CAPTURE_PARAM
    {
        public uint size;
        public uint imageFormat;
        public uint imageProc;
        public uint imageRes;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct DPFPDD_CAPTURE_RESULT
    {
        public uint size;
        public int success;       // 1=success
        public int quality;       // DPFPDD_QUALITY_*
        public uint score;        // NFIQ score (1-5, 1=best)
        public DPFPDD_IMAGE_INFO info;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct DPFPDD_IMAGE_INFO
    {
        public uint width;
        public uint height;
        public uint res;
        public uint bpp;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct DPFPDD_DEV_STATUS
    {
        public uint size;
        public int status;
        public int fingerDetected;
        public IntPtr data;
        public uint dataSize;
    }

    // ═══════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════

    private bool _initialized = false;
    private bool _dllsAvailable = false;
    private IntPtr _deviceHandle = IntPtr.Zero;
    private string? _deviceName = null;

    // ═══════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Check if DigitalPersona SDK DLLs are available on this system.
    /// Call this at startup to decide whether to use this service.
    /// </summary>
    public bool IsAvailable()
    {
        if (_dllsAvailable) return true;

        try
        {
            int result = dpfpdd_init();
            if (result == DPFPDD_SUCCESS)
            {
                _dllsAvailable = true;
                _initialized = true;
                Console.WriteLine("[DP] ✓ DigitalPersona SDK initialized successfully");
                return true;
            }
            else
            {
                Console.WriteLine($"[DP] SDK init failed: 0x{result:X8}");
                return false;
            }
        }
        catch (DllNotFoundException)
        {
            Console.WriteLine("[DP] dpfpdd.dll not found — DigitalPersona SDK not installed");
            Console.WriteLine("[DP] To enable: copy dpfpdd.dll + dpfj.dll to this directory");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DP] SDK load error: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Detect connected U.are.U devices and return their names.
    /// </summary>
    public List<string> GetDevices()
    {
        var devices = new List<string>();
        if (!EnsureInitialized()) return devices;

        try
        {
            int devCount = 0;
            // First call: get count
            int result = dpfpdd_query_devices(ref devCount, IntPtr.Zero);

            if (devCount == 0)
            {
                Console.WriteLine("[DP] No DigitalPersona devices detected");
                return devices;
            }

            // Second call: get device info
            int structSize = Marshal.SizeOf<DPFPDD_DEV_INFO>();
            IntPtr buffer = Marshal.AllocHGlobal(structSize * devCount);

            try
            {
                // Set the size field for each struct
                for (int i = 0; i < devCount; i++)
                {
                    Marshal.WriteInt32(buffer + (i * structSize), structSize);
                }

                result = dpfpdd_query_devices(ref devCount, buffer);

                if (result == DPFPDD_SUCCESS || devCount > 0)
                {
                    for (int i = 0; i < devCount; i++)
                    {
                        var devInfo = Marshal.PtrToStructure<DPFPDD_DEV_INFO>(buffer + (i * structSize));
                        devices.Add(devInfo.name);
                        Console.WriteLine($"[DP] ✓ Device {i}: {devInfo.descr.productName} (S/N: {devInfo.descr.serialNum})");
                    }
                }
            }
            finally
            {
                Marshal.FreeHGlobal(buffer);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DP] Query devices error: {ex.Message}");
        }

        return devices;
    }

    /// <summary>
    /// Capture a fingerprint from the U.are.U 4500 device.
    /// Returns a proper ANSI 378-2004 biometric template (FMD).
    /// </summary>
    /// <param name="timeoutMs">Max time to wait for finger (default 10 seconds)</param>
    public CaptureOutput? Capture(uint timeoutMs = 10000)
    {
        if (!EnsureInitialized()) return null;

        if (!EnsureDeviceOpen()) return null;

        try
        {
            Console.WriteLine("[DP] Waiting for finger on U.are.U sensor...");

            // Capture as raw pixel buffer so we can create a PNG image
            var captureParam = new DPFPDD_CAPTURE_PARAM
            {
                size = (uint)Marshal.SizeOf<DPFPDD_CAPTURE_PARAM>(),
                imageFormat = DPFPDD_IMG_FMT_PIXEL_BUFFER, // Raw grayscale pixels
                imageProc = 2,  // Enhancement
                imageRes = 500  // 500 DPI
            };

            var captureResult = new DPFPDD_CAPTURE_RESULT
            {
                size = (uint)Marshal.SizeOf<DPFPDD_CAPTURE_RESULT>()
            };

            // Initial call to get required buffer size
            uint imageSize = 0;
            int status = dpfpdd_capture(_deviceHandle, ref captureParam, timeoutMs,
                ref captureResult, ref imageSize, null!);

            if (status == DPFPDD_E_MORE_DATA && imageSize > 0)
            {
                // Allocate buffer and capture again
                byte[] imageData = new byte[imageSize];
                status = dpfpdd_capture(_deviceHandle, ref captureParam, timeoutMs,
                    ref captureResult, ref imageSize, imageData);

                if (status == DPFPDD_SUCCESS && captureResult.success == 1)
                {
                    int width = (int)captureResult.info.width;
                    int height = (int)captureResult.info.height;

                    Console.WriteLine($"[DP] ✓ Image captured! Size: {imageSize} bytes, " +
                        $"Resolution: {width}x{height} @ {captureResult.info.res} DPI, " +
                        $"Quality: NFIQ {captureResult.score}");
                    
                    // Convert raw grayscale pixels to PNG (base64)
                    string? imagePngBase64 = ConvertRawToPngBase64(imageData, (int)imageSize, width, height);
                    
                    if (imagePngBase64 != null)
                        Console.WriteLine($"[DP] ✓ PNG image created ({imagePngBase64.Length / 1024} KB base64)");

                    // Extract FMD (template) from the captured image (FID)
                    byte[]? fmdTemplate = CreateTemplate(imageData, imageSize);

                    if (fmdTemplate != null)
                    {
                        int qualityPercent = captureResult.score switch
                        {
                            1 => 95,  // Excellent
                            2 => 85,  // Very Good
                            3 => 70,  // Good
                            4 => 55,  // Fair
                            5 => 40,  // Poor
                            _ => 75
                        };

                        string qualityLabel = captureResult.quality switch
                        {
                            DPFPDD_QUALITY_GOOD => "Good",
                            DPFPDD_QUALITY_TOOMOIST => "Too moist",
                            DPFPDD_QUALITY_TOODRY => "Too dry",
                            DPFPDD_QUALITY_TOOLIGHT => "Too light pressure",
                            DPFPDD_QUALITY_TOODARK => "Too much pressure",
                            _ => "OK"
                        };

                        string templateId = $"FP-DP-{DateTime.Now:yyyyMMddHHmmss}-{RandomNumberGenerator.GetInt32(100000, 999999)}";

                        Console.WriteLine($"[DP] ✓ Template extracted! FMD size: {fmdTemplate.Length} bytes, " +
                            $"Quality: {qualityPercent}% ({qualityLabel}), Format: ANSI 378-2004");

                        return new CaptureOutput
                        {
                            Success = true,
                            TemplateBase64 = Convert.ToBase64String(fmdTemplate),
                            TemplateId = templateId,
                            Quality = qualityPercent,
                            QualityLabel = qualityLabel,
                            ImageWidth = (int)captureResult.info.width,
                            ImageHeight = height,
                            ImageBase64 = imagePngBase64 ?? "",
                            NfiqScore = (int)captureResult.score,
                            TemplateFormat = "ANSI_378_2004",
                            TemplateSizeBytes = fmdTemplate.Length
                        };
                    }
                    else
                    {
                        Console.WriteLine("[DP] ✗ Failed to extract template from captured image");
                        return new CaptureOutput
                        {
                            Success = false,
                            ErrorMessage = "Template extraction failed. Try pressing finger more firmly and evenly on the sensor."
                        };
                    }
                }
            }
            else if (status == DPFPDD_SUCCESS && captureResult.success == 1)
            {
                // Image fit in zero-size buffer? Shouldn't happen, but handle gracefully
                Console.WriteLine("[DP] ✗ Unexpected: capture succeeded but no image data");
                return new CaptureOutput { Success = false, ErrorMessage = "No image data returned from device." };
            }
            else if (imageSize == 0 && status != DPFPDD_E_MORE_DATA)
            {
                // Direct capture without MORE_DATA (some SDK versions)
                Console.WriteLine($"[DP] Capture returned status 0x{status:X8}, imageSize=0");
                // Fall through to error handling below
            }

            // Handle specific failure cases
            string errorMsg = status switch
            {
                0x10100004 => "Timeout — walang finger na na-detect sa sensor. Ilagay ang daliri sa scanner.",
                DPFPDD_E_DEVICE_BUSY => "Device busy. Subukan ulit pagkatapos ng ilang segundo.",
                DPFPDD_E_DEVICE_FAILURE => "Device error. I-unplug at i-plug ulit ang scanner.",
                _ => captureResult.success != 1
                    ? $"Capture quality too low ({QualityToString(captureResult.quality)}). Linisin ang daliri at subukan ulit."
                    : $"Capture failed (0x{status:X8})"
            };

            return new CaptureOutput { Success = false, ErrorMessage = errorMsg };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DP] Capture exception: {ex.Message}");

            // If device disconnected, reset handle
            if (ex.Message.Contains("access") || ex.Message.Contains("device"))
            {
                CloseDevice();
            }

            return new CaptureOutput
            {
                Success = false,
                ErrorMessage = $"Capture error: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Compare two fingerprint templates (1:1 verification).
    /// Returns match confidence (0-100%) and whether they match.
    /// </summary>
    public VerifyOutput Compare(string template1Base64, string template2Base64)
    {
        try
        {
            byte[] fmd1 = Convert.FromBase64String(template1Base64);
            byte[] fmd2 = Convert.FromBase64String(template2Base64);

            uint dissimilarity = uint.MaxValue;

            int result = dpfj_compare(
                DPFJ_FMD_ANSI_378_2004, fmd1, (uint)fmd1.Length, 0,
                DPFJ_FMD_ANSI_378_2004, fmd2, (uint)fmd2.Length, 0,
                ref dissimilarity);

            if (result == DPFJ_SUCCESS)
            {
                // Convert dissimilarity to confidence percentage
                // dissimilarity: 0 = identical, MAX_UINT = completely different
                // Threshold: 21474 = FAR 0.1%
                bool isMatch = dissimilarity < DISSIMILARITY_THRESHOLD;
                double confidence = Math.Max(0, 100.0 - (dissimilarity / (double)DISSIMILARITY_THRESHOLD * 100.0));
                confidence = Math.Min(100, Math.Max(0, confidence));

                Console.WriteLine($"[DP] Compare result: dissimilarity={dissimilarity}, " +
                    $"threshold={DISSIMILARITY_THRESHOLD}, match={isMatch}, confidence={confidence:F1}%");

                return new VerifyOutput
                {
                    IsMatch = isMatch,
                    Confidence = confidence,
                    Dissimilarity = dissimilarity
                };
            }
            else
            {
                Console.WriteLine($"[DP] Compare failed: 0x{result:X8}");
                return new VerifyOutput
                {
                    IsMatch = false,
                    Confidence = 0,
                    ErrorMessage = $"Comparison failed (0x{result:X8}). Templates may be corrupted."
                };
            }
        }
        catch (DllNotFoundException)
        {
            return new VerifyOutput
            {
                IsMatch = false,
                Confidence = 0,
                ErrorMessage = "dpfj.dll not found. DigitalPersona SDK required for matching."
            };
        }
        catch (Exception ex)
        {
            return new VerifyOutput
            {
                IsMatch = false,
                Confidence = 0,
                ErrorMessage = $"Compare error: {ex.Message}"
            };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PNG IMAGE CONVERSION
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Convert raw 8-bit grayscale pixel buffer to a PNG image (base64 encoded).
    /// The U.are.U 4500 captures at 512 DPI, producing ~300x400 pixel grayscale images.
    /// </summary>
    private static string? ConvertRawToPngBase64(byte[] rawPixels, int dataSize, int width, int height)
    {
        try
        {
            if (width <= 0 || height <= 0 || dataSize < width * height)
            {
                Console.WriteLine($"[DP] Invalid image dimensions: {width}x{height}, data size: {dataSize}");
                return null;
            }

            // Create a BMP file in memory (grayscale 8-bit)
            // BMP format: header (54 bytes) + color table (1024 bytes for 8-bit) + pixel data
            int rowStride = ((width + 3) / 4) * 4; // BMP rows are 4-byte aligned
            int bmpDataSize = rowStride * height;
            int fileSize = 54 + 1024 + bmpDataSize;
            byte[] bmp = new byte[fileSize];

            // BMP File Header (14 bytes)
            bmp[0] = 0x42; bmp[1] = 0x4D; // "BM"
            BitConverter.GetBytes(fileSize).CopyTo(bmp, 2);
            BitConverter.GetBytes(54 + 1024).CopyTo(bmp, 10); // Pixel data offset

            // BMP Info Header (40 bytes)
            BitConverter.GetBytes(40).CopyTo(bmp, 14); // Header size
            BitConverter.GetBytes(width).CopyTo(bmp, 18);
            BitConverter.GetBytes(height).CopyTo(bmp, 22);
            BitConverter.GetBytes((short)1).CopyTo(bmp, 26); // Color planes
            BitConverter.GetBytes((short)8).CopyTo(bmp, 28); // Bits per pixel (8 = grayscale)
            BitConverter.GetBytes(0).CopyTo(bmp, 30); // No compression
            BitConverter.GetBytes(bmpDataSize).CopyTo(bmp, 34);
            BitConverter.GetBytes(19685).CopyTo(bmp, 38); // 500 DPI horizontal (pixels/meter)
            BitConverter.GetBytes(19685).CopyTo(bmp, 42); // 500 DPI vertical
            BitConverter.GetBytes(256).CopyTo(bmp, 46); // Colors used
            BitConverter.GetBytes(256).CopyTo(bmp, 50); // Important colors

            // Color table (256 grayscale entries: BGRA)
            for (int i = 0; i < 256; i++)
            {
                int offset = 54 + (i * 4);
                bmp[offset] = (byte)i;     // Blue
                bmp[offset + 1] = (byte)i; // Green
                bmp[offset + 2] = (byte)i; // Red
                bmp[offset + 3] = 0xFF;    // Alpha
            }

            // Pixel data (BMP stores bottom-to-top)
            int pixelOffset = 54 + 1024;
            for (int y = 0; y < height; y++)
            {
                int srcRow = (height - 1 - y) * width; // Flip vertically for BMP
                int dstRow = pixelOffset + (y * rowStride);
                Array.Copy(rawPixels, srcRow, bmp, dstRow, width);
                // Remaining bytes in stride are already 0 (padding)
            }

            // Return as base64 (BMP format — browser can display this directly)
            // Using BMP instead of PNG since we don't have System.Drawing on all platforms
            return Convert.ToBase64String(bmp);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DP] PNG conversion error: {ex.Message}");
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════

    private bool EnsureInitialized()
    {
        if (_initialized) return true;

        try
        {
            int result = dpfpdd_init();
            _initialized = (result == DPFPDD_SUCCESS);
            return _initialized;
        }
        catch
        {
            return false;
        }
    }

    private bool EnsureDeviceOpen()
    {
        if (_deviceHandle != IntPtr.Zero) return true;

        var devices = GetDevices();
        if (devices.Count == 0)
        {
            Console.WriteLine("[DP] No devices found. Is U.are.U 4500 plugged in?");
            return false;
        }

        _deviceName = devices[0]; // Use first available device
        IntPtr handle = IntPtr.Zero;

        int result = dpfpdd_open(_deviceName, ref handle);
        if (result == DPFPDD_SUCCESS)
        {
            _deviceHandle = handle;
            Console.WriteLine($"[DP] ✓ Device opened: {_deviceName}");
            return true;
        }
        else
        {
            Console.WriteLine($"[DP] ✗ Failed to open device: 0x{result:X8}");
            return false;
        }
    }

    private void CloseDevice()
    {
        if (_deviceHandle != IntPtr.Zero)
        {
            try { dpfpdd_close(_deviceHandle); } catch { }
            _deviceHandle = IntPtr.Zero;
        }
    }

    /// <summary>
    /// Convert a captured fingerprint image (FID) to a minutiae template (FMD).
    /// </summary>
    private byte[]? CreateTemplate(byte[] imageData, uint imageSize)
    {
        try
        {
            // Start with a reasonable buffer size for FMD
            uint fmdSize = 2048;
            byte[] fmdData = new byte[fmdSize];

            int result = dpfj_create_fmd_from_fid(
                DPFJ_FID_ISO_19794_4_2005, imageData, imageSize,
                DPFJ_FMD_ANSI_378_2004, fmdData, ref fmdSize);

            if (result == DPFPDD_E_MORE_DATA && fmdSize > 0)
            {
                // Buffer was too small, retry with correct size
                fmdData = new byte[fmdSize];
                result = dpfj_create_fmd_from_fid(
                    DPFJ_FID_ISO_19794_4_2005, imageData, imageSize,
                    DPFJ_FMD_ANSI_378_2004, fmdData, ref fmdSize);
            }

            if (result == DPFJ_SUCCESS && fmdSize > 0)
            {
                // Trim to actual size
                byte[] template = new byte[fmdSize];
                Array.Copy(fmdData, template, fmdSize);
                return template;
            }

            // Try alternate FID format (ANSI 381)
            result = dpfj_create_fmd_from_fid(
                DPFJ_FID_ANSI_381_2004, imageData, imageSize,
                DPFJ_FMD_ANSI_378_2004, fmdData, ref fmdSize);

            if (result == DPFJ_SUCCESS && fmdSize > 0)
            {
                byte[] template = new byte[fmdSize];
                Array.Copy(fmdData, template, fmdSize);
                return template;
            }

            Console.WriteLine($"[DP] FMD creation failed: 0x{result:X8}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DP] Template creation error: {ex.Message}");
            return null;
        }
    }

    private static string QualityToString(int quality) => quality switch
    {
        DPFPDD_QUALITY_GOOD => "Good",
        DPFPDD_QUALITY_TOOMOIST => "Too moist",
        DPFPDD_QUALITY_TOODRY => "Too dry",
        DPFPDD_QUALITY_TOOLIGHT => "Too light",
        DPFPDD_QUALITY_TOODARK => "Too dark",
        _ => $"Unknown ({quality})"
    };

    // ═══════════════════════════════════════════════════════════
    // DISPOSAL
    // ═══════════════════════════════════════════════════════════

    public void Dispose()
    {
        CloseDevice();
        if (_initialized)
        {
            try { dpfpdd_exit(); } catch { }
            _initialized = false;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // OUTPUT MODELS
    // ═══════════════════════════════════════════════════════════

    public class CaptureOutput
    {
        public bool Success { get; set; }
        public string TemplateBase64 { get; set; } = "";
        public string TemplateId { get; set; } = "";
        public int Quality { get; set; }
        public string QualityLabel { get; set; } = "";
        public int ImageWidth { get; set; }
        public int ImageHeight { get; set; }
        public int NfiqScore { get; set; }
        public string ImageBase64 { get; set; } = "";  // Base64 BMP/PNG image for display
        public string TemplateFormat { get; set; } = "";
        public int TemplateSizeBytes { get; set; }
        public string ErrorMessage { get; set; } = "";
    }

    public class VerifyOutput
    {
        public bool IsMatch { get; set; }
        public double Confidence { get; set; }
        public uint Dissimilarity { get; set; }
        public string ErrorMessage { get; set; } = "";
    }
}
