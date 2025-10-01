import { useState } from 'react';

interface PublishError {
  type: string;
  message: string;
}

interface UsePublishWorkflowProps {
  onPublish: () => Promise<void>;
}

export function usePublishWorkflow({ onPublish }: UsePublishWorkflowProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [error, setError] = useState<PublishError | null>(null);

  const handlePublishClick = () => {
    setShowPublishDialog(true);
  };

  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
      setShowPublishDialog(false);
    } catch (err) {
      setError({ type: 'publish-error', message: 'Failed to publish annotations' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancelPublish = () => {
    setShowPublishDialog(false);
  };

  return {
    isPublishing,
    showPublishDialog,
    error,
    handlePublishClick,
    handleConfirmPublish,
    handleCancelPublish,
  };
}
