import { useState } from 'react';
import type { Annotation } from '@/types/annotations';

interface UseAnnotationManagementProps {
  onSaveAnnotation: (annotation: any) => Promise<void>;
  defaultRoute: string;
  defaultViewport: string;
}

interface AnnotationError {
  type: string;
  message: string;
}

export function useAnnotationManagement({
  onSaveAnnotation,
  defaultRoute,
  defaultViewport,
}: UseAnnotationManagementProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [annotationContent, setAnnotationContent] = useState('');
  const [annotationPriority, setAnnotationPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [error, setError] = useState<AnnotationError | null>(null);

  const handleSaveAnnotation = async () => {
    if (!annotationContent.trim()) {
      setValidationError(true);
      setError({ type: 'validation-error', message: 'Content is required' });
      return;
    }

    const annotation = {
      id: editingAnnotationId || String(annotations.length + 1),
      timestamp: new Date(),
      route: defaultRoute,
      viewport: defaultViewport,
      position: { x: 100, y: 200 },
      content: annotationContent,
      priority: annotationPriority,
      status: 'pending' as const,
    };

    try {
      await onSaveAnnotation(annotation);

      if (editingAnnotationId) {
        setAnnotations(annotations.map(a => (a.id === editingAnnotationId ? annotation : a)));
      } else {
        setAnnotations([...annotations, annotation]);
      }

      setShowAnnotationForm(false);
      setAnnotationContent('');
      setAnnotationPriority('medium');
      setEditingAnnotationId(null);
      setValidationError(false);
      setError(null);
    } catch (err) {
      setError({ type: 'save-error', message: 'Failed to save annotation' });
    }
  };

  const handleCancelAnnotation = () => {
    setShowAnnotationForm(false);
    setAnnotationContent('');
    setAnnotationPriority('medium');
    setEditingAnnotationId(null);
    setValidationError(false);
    setError(null);
  };

  const handleEditAnnotation = (annotationId: string) => {
    const annotation = annotations.find(a => a.id === annotationId);
    if (annotation) {
      setAnnotationContent(annotation.content);
      setAnnotationPriority(annotation.priority);
      setEditingAnnotationId(annotationId);
      setShowAnnotationForm(true);
    }
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    setAnnotations(annotations.filter(a => a.id !== annotationId));
  };

  const handleDismissError = () => {
    setError(null);
    setValidationError(false);
  };

  const handleRetry = async () => {
    setError(null);
    await handleSaveAnnotation();
  };

  const handleCanvasClick = () => {
    setShowAnnotationForm(true);
  };

  return {
    annotations,
    editingAnnotationId,
    annotationContent,
    annotationPriority,
    showAnnotationForm,
    validationError,
    error,
    handleSaveAnnotation,
    handleCancelAnnotation,
    handleEditAnnotation,
    handleDeleteAnnotation,
    handleDismissError,
    handleRetry,
    handleCanvasClick,
    setAnnotationContent,
    setAnnotationPriority,
  };
}
