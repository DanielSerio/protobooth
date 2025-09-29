import { useState, useCallback } from 'react';

interface ScreenshotCaptureOptions {
  appUrl: string;
  projectPath: string;
  routerType: 'vite' | 'nextjs';
  authState: 'authenticated' | 'unauthenticated';
  includeGlobalState?: boolean;
}

interface CaptureResult {
  success: boolean;
  screenshotCount: number;
  outputPath: string;
  deploymentInstructions?: string[];
}

interface UseScreenshotCaptureOptions {
  fixtureManager: any;
  screenshotService: any;
  fileOperations: {
    fileExists: (path: string) => Promise<boolean>;
  };
}

export function useScreenshotCapture(options: UseScreenshotCaptureOptions) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastCaptureResult, setLastCaptureResult] = useState<CaptureResult | null>(null);

  const validateConfiguration = useCallback(async (): Promise<boolean> => {
    try {
      const configExists = await options.fileOperations.fileExists('protobooth.config.json');
      return configExists;
    } catch {
      return false;
    }
  }, [options.fileOperations]);

  const captureScreenshots = useCallback(async (captureOptions: ScreenshotCaptureOptions): Promise<CaptureResult> => {
    try {
      setIsCapturing(true);
      setError(null);
      setCaptureProgress('Validating configuration...');

      // Validate configuration
      const isConfigValid = await validateConfiguration();
      if (!isConfigValid) {
        throw new Error('Configuration required - please configure fixtures');
      }

      setCaptureProgress('Discovering routes...');

      // Simulate route discovery progress
      await new Promise(resolve => setTimeout(resolve, 500));

      setCaptureProgress('Capturing screenshots...');

      // Call the actual screenshot service
      const result = await options.screenshotService.captureRoutes(captureOptions);

      setCaptureProgress('Processing results...');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 300));

      const captureResult: CaptureResult = {
        success: true,
        screenshotCount: result.screenshots.length,
        outputPath: result.outputDirectory || '/temp/screenshots',
        deploymentInstructions: [
          '1. Deploy to staging server',
          '2. Share URL with clients',
          '3. Wait for client feedback'
        ]
      };

      setLastCaptureResult(captureResult);
      setCaptureProgress('Screenshots captured successfully!');

      return captureResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Screenshot capture failed:', err);
      setError(`Screenshot capture failed: ${errorMessage}`);
      setCaptureProgress('Screenshot capture failed!');

      throw err;
    } finally {
      setIsCapturing(false);
      // Clear progress after a delay
      setTimeout(() => setCaptureProgress(''), 3000);
    }
  }, [options.screenshotService, validateConfiguration]);

  const getValidationErrors = useCallback(async (): Promise<string[]> => {
    const errors: string[] = [];

    try {
      const configExists = await options.fileOperations.fileExists('protobooth.config.json');
      if (!configExists) {
        errors.push('Missing protobooth.config.json - please configure fixtures');
      }
    } catch {
      errors.push('Unable to check configuration file');
    }

    return errors;
  }, [options.fileOperations]);

  return {
    isCapturing,
    captureProgress,
    error,
    lastCaptureResult,
    captureScreenshots,
    validateConfiguration,
    getValidationErrors
  };
}