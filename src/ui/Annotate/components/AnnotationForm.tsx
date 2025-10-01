interface AnnotationFormProps {
  content: string;
  priority: 'low' | 'medium' | 'high';
  onContentChange: (content: string) => void;
  onPriorityChange: (priority: 'low' | 'medium' | 'high') => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AnnotationForm({
  content,
  priority,
  onContentChange,
  onPriorityChange,
  onSave,
  onCancel,
}: AnnotationFormProps) {
  return (
    <div className="protobooth-annotation-form" data-testid="annotation-form">
      <textarea
        data-testid="annotation-content-input"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Enter annotation content"
      />
      <select
        data-testid="annotation-priority-select"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as 'low' | 'medium' | 'high')}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button data-testid="annotation-save-button" onClick={onSave}>
        Save
      </button>
      <button data-testid="annotation-cancel-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
