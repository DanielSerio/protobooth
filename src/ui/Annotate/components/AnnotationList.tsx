import type { Annotation } from '@/types/annotations';

interface AnnotationListProps {
  annotations: Annotation[];
  onEdit: (annotationId: string) => void;
  onDelete: (annotationId: string) => void;
}

export function AnnotationList({ annotations, onEdit, onDelete }: AnnotationListProps) {
  if (annotations.length === 0) {
    return null;
  }

  return (
    <div className="protobooth-annotation-list" data-testid="annotation-list">
      {annotations.map((annotation) => (
        <div key={annotation.id} data-testid={`annotation-item-${annotation.id}`}>
          <p>{annotation.content}</p>
          <button
            data-testid={`edit-annotation-${annotation.id}`}
            onClick={() => onEdit(annotation.id)}
          >
            Edit
          </button>
          <button
            data-testid={`delete-annotation-${annotation.id}`}
            onClick={() => onDelete(annotation.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
