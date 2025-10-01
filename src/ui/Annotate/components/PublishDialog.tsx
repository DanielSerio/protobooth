interface PublishDialogProps {
  annotationCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PublishDialog({ annotationCount, onConfirm, onCancel }: PublishDialogProps) {
  return (
    <div className="protobooth-publish-dialog" data-testid="publish-confirmation-dialog">
      <p>
        Ready to publish <span data-testid="annotation-count">{annotationCount}</span> annotations?
      </p>
      <button data-testid="confirm-publish-button" onClick={onConfirm}>
        Confirm
      </button>
      <button data-testid="cancel-publish-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
