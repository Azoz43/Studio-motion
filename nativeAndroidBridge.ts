export interface NativeMediaCodecModule {
  probeMedia(uri: string): Promise<{
    width?: number;
    height?: number;
    durationMs?: number;
    fps?: number;
    hasAudio?: boolean;
    mimeType?: string;
  }>;
  exportProjectMp4(
    projectJson: string,
    outputPath: string
  ): Promise<{
    success: boolean;
    outputPath: string;
    sizeBytes: number;
    durationMs: number;
  }>;
  cancelActiveExport(): Promise<boolean>;
}

export function getAndroidNativeMediaModule(): NativeMediaCodecModule | null {
  try {
    const rn = require('react-native');
    if (rn && rn.NativeModules && rn.NativeModules.MotionStudioMedia) {
      return rn.NativeModules.MotionStudioMedia as NativeMediaCodecModule;
    }
  } catch {
    // Headless Node environment
  }
  return null;
}
