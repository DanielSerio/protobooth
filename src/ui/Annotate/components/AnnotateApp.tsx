import { useState } from 'react';
import type { Screenshot } from '@/types/screenshot';
import { AnnotationForm } from './AnnotationForm';
import { AnnotationList } from './AnnotationList';
import { ToolPalette } from './ToolPalette';
import { ColorPicker } from './ColorPicker';
import { PublishDialog } from './PublishDialog';
import { ErrorDisplay } from './ErrorDisplay';
import { useAnnotationManagement, useCanvasTools, usePublishWorkflow } from '../hooks';
import '../../styles/annotate-ui/index.scss';

export interface AnnotateAppProps {
  onSaveAnnotation: (annotation: any) => Promise<void>;
  onPublish: () => Promise<void>;
  screenshots: Screenshot[];
}

/**
 * Main component for the annotation app. this will be injected into the router.
 */
export function AnnotateApp({ onSaveAnnotation, onPublish, screenshots }: AnnotateAppProps) {
  const [screenshotLoadError, setScreenshotLoadError] = useState(false);

  const {
    annotations,
    annotationContent,
    annotationPriority,
    showAnnotationForm,
    error: annotationError,
    handleSaveAnnotation,
    handleCancelAnnotation,
    handleEditAnnotation,
    handleDeleteAnnotation,
    handleDismissError,
    handleRetry,
    handleCanvasClick,
    setAnnotationContent,
    setAnnotationPriority,
  } = useAnnotationManagement({
    onSaveAnnotation,
    defaultRoute: screenshots[0]?.route || '/home',
    defaultViewport: screenshots[0]?.viewport || 'desktop',
  });

  const { activeTool, selectedColor, fabricRef, handleToolClick, handleColorChange, handleClearCanvas } =
    useCanvasTools({
      screenshots,
      onScreenshotLoadError: () => setScreenshotLoadError(true),
    });

  const {
    isPublishing,
    showPublishDialog,
    error: publishError,
    handlePublishClick,
    handleConfirmPublish,
    handleCancelPublish,
  } = usePublishWorkflow({ onPublish });

  const error = annotationError || publishError;

  if (screenshots.length === 0) {
    return (
      <div data-testid="no-screenshots-error">
        <div data-testid="error-message">No screenshots available</div>
      </div>
    );
  }

  if (screenshotLoadError) {
    return (
      <div data-testid="screenshot-load-error">
        <div data-testid="error-message">Failed to load screenshot</div>
      </div>
    );
  }

  return (
    <div className="protobooth-annotate-app">
      <div className="protobooth-canvas-container">
        <canvas ref={fabricRef} data-testid="annotate-canvas" onClick={handleCanvasClick} />
        <img data-testid="screenshot-image" src={screenshots[0].filePath} style={{ display: 'none' }} alt="" />
      </div>

      <ToolPalette
        activeTool={activeTool}
        onToolClick={handleToolClick}
        onClearCanvas={handleClearCanvas}
      />

      <ColorPicker selectedColor={selectedColor} onColorChange={handleColorChange} />

      {showAnnotationForm && (
        <AnnotationForm
          content={annotationContent}
          priority={annotationPriority}
          onContentChange={setAnnotationContent}
          onPriorityChange={setAnnotationPriority}
          onSave={handleSaveAnnotation}
          onCancel={handleCancelAnnotation}
        />
      )}

      <AnnotationList
        annotations={annotations}
        onEdit={handleEditAnnotation}
        onDelete={handleDeleteAnnotation}
      />

      <button
        className="protobooth-publish-button"
        data-testid="publish-button"
        onClick={handlePublishClick}
        disabled={annotations.length === 0 || isPublishing}
      >
        Publish
      </button>

      {showPublishDialog && (
        <PublishDialog
          annotationCount={annotations.length}
          onConfirm={handleConfirmPublish}
          onCancel={handleCancelPublish}
        />
      )}

      {isPublishing && <div data-testid="publish-progress">Publishing...</div>}

      {error && (
        <ErrorDisplay
          type={error.type}
          message={error.message}
          onDismiss={handleDismissError}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
