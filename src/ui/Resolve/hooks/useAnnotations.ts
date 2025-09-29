import { useState, useEffect, useCallback } from 'react';
import type { Annotation, DownloadBundle } from '@/types/annotations';

interface UseAnnotationsOptions {
  fileOperations: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    fileExists: (path: string) => Promise<boolean>;
  };
}

export function useAnnotations(options: UseAnnotationsOptions) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const annotationsFilePath = 'protobooth-annotations.json';

  const loadAnnotations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const exists = await options.fileOperations.fileExists(annotationsFilePath);
      if (!exists) {
        setAnnotations([]);
        return;
      }

      const content = await options.fileOperations.readFile(annotationsFilePath);

      try {
        const data = JSON.parse(content);

        // Handle both direct annotation arrays and download bundles
        if (Array.isArray(data)) {
          setAnnotations(data);
        } else if (data.session && Array.isArray(data.session.annotations)) {
          setAnnotations(data.session.annotations);
        } else if (Array.isArray(data.annotations)) {
          setAnnotations(data.annotations);
        } else {
          setAnnotations([]);
        }
      } catch (parseError) {
        console.error('Failed to parse annotation data:', parseError);
        setError('Failed to load annotations - corrupted data');
        setAnnotations([]);
      }
    } catch (err) {
      console.error('Failed to load annotations:', err);
      setError('Failed to load annotations');
      setAnnotations([]);
    } finally {
      setIsLoading(false);
    }
  }, [options.fileOperations, annotationsFilePath]);

  const markAsResolved = useCallback(async (annotationId: string) => {
    try {
      setError(null);

      const updatedAnnotations = annotations.map(annotation =>
        annotation.id === annotationId
          ? { ...annotation, status: 'resolved' as const }
          : annotation
      );

      await options.fileOperations.writeFile(
        annotationsFilePath,
        JSON.stringify(updatedAnnotations, null, 2)
      );

      setAnnotations(updatedAnnotations);
    } catch (err) {
      console.error('Failed to update annotation:', err);
      setError('Failed to update annotation status');
      throw err;
    }
  }, [annotations, options.fileOperations, annotationsFilePath]);

  const markAsInProgress = useCallback(async (annotationId: string) => {
    try {
      setError(null);

      const updatedAnnotations = annotations.map(annotation =>
        annotation.id === annotationId
          ? { ...annotation, status: 'in-progress' as const }
          : annotation
      );

      await options.fileOperations.writeFile(
        annotationsFilePath,
        JSON.stringify(updatedAnnotations, null, 2)
      );

      setAnnotations(updatedAnnotations);
    } catch (err) {
      console.error('Failed to update annotation:', err);
      setError('Failed to update annotation status');
      throw err;
    }
  }, [annotations, options.fileOperations, annotationsFilePath]);

  const downloadAnnotations = useCallback(async (stagingUrl?: string) => {
    try {
      setDownloadProgress(0);
      setError(null);

      if (stagingUrl && typeof fetch !== 'undefined') {
        // Download from staging server
        const response = await fetch(`${stagingUrl}/api/annotations/download`);

        if (!response.ok) {
          throw new Error(`Network error: ${response.statusText}`);
        }

        setDownloadProgress(50);

        const bundle: DownloadBundle = await response.json();

        // Save to local file
        const filename = `annotations-session-${bundle.session.sessionId}.zip`;
        await options.fileOperations.writeFile(filename, JSON.stringify(bundle, null, 2));

        // Update local annotations
        setAnnotations(bundle.session.annotations);

        setDownloadProgress(100);

        // Reset progress after a delay
        setTimeout(() => setDownloadProgress(null), 2000);

        return filename;
      } else {
        // Local development mode - just reload existing annotations
        await loadAnnotations();
        return null;
      }
    } catch (err) {
      console.error('Failed to download annotations:', err);
      setError(`Failed to download annotations: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDownloadProgress(null);
      throw err;
    }
  }, [options.fileOperations, loadAnnotations]);

  // Load annotations on mount
  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  // Calculate progress statistics
  const progressStats = {
    total: annotations.length,
    pending: annotations.filter(a => a.status === 'pending').length,
    inProgress: annotations.filter(a => a.status === 'in-progress').length,
    resolved: annotations.filter(a => a.status === 'resolved').length,
    percentComplete: annotations.length > 0 ? Math.round((annotations.filter(a => a.status === 'resolved').length / annotations.length) * 100) : 0
  };

  return {
    annotations,
    isLoading,
    error,
    downloadProgress,
    progressStats,
    loadAnnotations,
    markAsResolved,
    markAsInProgress,
    downloadAnnotations
  };
}