import { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import type { Screenshot } from '@/types/screenshot';

type DrawingTool = 'draw' | 'text' | 'arrow' | null;

interface UseCanvasToolsProps {
  screenshots: Screenshot[];
  onScreenshotLoadError: () => void;
}

export function useCanvasTools({ screenshots, onScreenshotLoadError }: UseCanvasToolsProps) {
  const [activeTool, setActiveTool] = useState<DrawingTool>(null);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const fabricRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (fabricRef.current && !canvasRef.current) {
      canvasRef.current = new fabric.Canvas(fabricRef.current);
    }
  }, []);

  useEffect(() => {
    if (screenshots.length === 0) {
      return;
    }

    const screenshot = screenshots[0];
    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        const fabricImg = new fabric.Image(img);
        canvasRef.current.setBackgroundImage(
          fabricImg,
          canvasRef.current.renderAll.bind(canvasRef.current)
        );
      }
    };
    img.onerror = () => {
      onScreenshotLoadError();
    };
    img.src = screenshot.filePath;
  }, [screenshots, onScreenshotLoadError]);

  const handleToolClick = (tool: DrawingTool) => {
    setActiveTool(tool);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  return {
    activeTool,
    selectedColor,
    fabricRef,
    handleToolClick,
    handleColorChange,
    handleClearCanvas,
  };
}
