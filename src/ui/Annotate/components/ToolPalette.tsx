type DrawingTool = 'draw' | 'text' | 'arrow' | null;

interface ToolPaletteProps {
  activeTool: DrawingTool;
  onToolClick: (tool: DrawingTool) => void;
  onClearCanvas: () => void;
}

export function ToolPalette({ activeTool, onToolClick, onClearCanvas }: ToolPaletteProps) {
  return (
    <div className="protobooth-tool-palette" data-testid="tool-palette">
      <button
        data-testid="tool-draw"
        data-active={activeTool === 'draw'}
        onClick={() => onToolClick('draw')}
      >
        Draw
      </button>
      <button
        data-testid="tool-text"
        data-active={activeTool === 'text'}
        onClick={() => onToolClick('text')}
      >
        Text
      </button>
      <button
        data-testid="tool-arrow"
        data-active={activeTool === 'arrow'}
        onClick={() => onToolClick('arrow')}
      >
        Arrow
      </button>
      <button data-testid="clear-canvas-button" onClick={onClearCanvas}>
        Clear
      </button>
    </div>
  );
}
