import { ToolbarStack } from '@/ui/Core/components';
import ResolveTools from './ResolveTools';
import { ResolveNavigation } from './ResolveNavigation';
import { VERSION } from '@/version';

export interface ResolveFooterProps {
  workflowState: 'in-development' | 'reviews-requested' | 'in-review' | 'submitted-for-development';
  isCapturing: boolean;
  validationErrors: string[];
  downloadProgress: number | null;
  onRequestReview: () => void;
  onRecapture: () => void;
  onDownloadAnnotations: () => void;
  onResetWorkflow: () => void;
}

export function ResolveFooter({
  workflowState,
  isCapturing,
  validationErrors,
  downloadProgress,
  onRequestReview,
  onRecapture,
  onDownloadAnnotations,
  onResetWorkflow,
}: ResolveFooterProps) {
  return (
    <ToolbarStack>
      <ResolveTools
        workflowState={workflowState}
        isCapturing={isCapturing}
        validationErrors={validationErrors}
        downloadProgress={downloadProgress}
        onRequestReview={onRequestReview}
        onRecapture={onRecapture}
        onDownloadAnnotations={onDownloadAnnotations}
        onResetWorkflow={onResetWorkflow}
      />

      <ResolveNavigation />

      <div className="version-info" data-testid="version-info">
        <small>protobooth v{VERSION}</small>
      </div>
    </ToolbarStack>
  );
}
