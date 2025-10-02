import { ToolbarStack } from '@/ui/Core/components';
import { ToolPalette } from './ToolPalette';
import { ColorPicker } from './ColorPicker';

type DrawingTool = 'draw' | 'text' | 'arrow' | null;

interface AnnotateFooterProps {
  activeTool: DrawingTool;
  selectedColor: string;
  onToolClick: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onClearCanvas: () => void;
  onPublish: () => void;
  publishDisabled: boolean;
}

export function AnnotateFooter({
  activeTool,
  selectedColor,
  onToolClick,
  onColorChange,
  onClearCanvas,
  onPublish,
  publishDisabled,
}: AnnotateFooterProps) {
  return (
    <ToolbarStack>
      <ToolbarStack.Area data-testid="toolbar-tools">
        <ToolPalette
          activeTool={activeTool}
          onToolClick={onToolClick}
          onClearCanvas={onClearCanvas}
        />
      </ToolbarStack.Area>

      <ToolbarStack.Area data-testid="toolbar-colors">
        <ColorPicker selectedColor={selectedColor} onColorChange={onColorChange} />
      </ToolbarStack.Area>

      <ToolbarStack.Area data-testid="toolbar-actions">
        <button
          className="protobooth-publish-button"
          data-testid="publish-button"
          onClick={onPublish}
          disabled={publishDisabled}
        >
          Publish
        </button>
      </ToolbarStack.Area>
    </ToolbarStack>
  );
}
