import { Sidebar } from '@/ui/Core/components';
import { AnnotationList } from './AnnotationList';
import type { Annotation } from '@/types/annotations';

interface AnnotateSidebarProps {
  annotations: Annotation[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AnnotateSidebar({ annotations, onEdit, onDelete }: AnnotateSidebarProps) {
  return (
    <Sidebar>
      <Sidebar.Section id="title">
        <h1>Annotations</h1>
        <p className="protobooth-annotation-count">
          {annotations.length} {annotations.length === 1 ? 'annotation' : 'annotations'}
        </p>
      </Sidebar.Section>

      <Sidebar.Section id="annotations">
        <AnnotationList annotations={annotations} onEdit={onEdit} onDelete={onDelete} />
      </Sidebar.Section>
    </Sidebar>
  );
}
