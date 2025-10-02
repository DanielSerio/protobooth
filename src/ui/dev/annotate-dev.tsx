import React from 'react';
import ReactDOM from 'react-dom/client';
import { AnnotateApp } from '../Annotate/components/AnnotateApp';
import type { Screenshot } from '@/types/screenshot';
import type { Annotation } from '@/types/annotations';
import '../../ui/styles/annotate-ui/index.scss';

// Create a simple placeholder image as a data URI (800x600 light gray rectangle with text)
const createPlaceholderImage = (route: string, viewport: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = viewport === 'mobile' ? 375 : 1440;
  canvas.height = viewport === 'mobile' ? 667 : 900;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Text
    ctx.fillStyle = '#666';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Screenshot: ${route}`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Viewport: ${viewport}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#999';
    ctx.fillText('(Staging Simulation - Placeholder Image)', canvas.width / 2, canvas.height / 2 + 60);
  }

  return canvas.toDataURL('image/png');
};

// Mock screenshots for development (simulating staging environment)
const mockScreenshots: Screenshot[] = [
  {
    route: '/dashboard',
    viewport: 'desktop',
    filePath: createPlaceholderImage('/dashboard', 'desktop'),
    dimensions: { width: 1440, height: 900 },
    timestamp: new Date()
  },
  {
    route: '/dashboard',
    viewport: 'mobile',
    filePath: createPlaceholderImage('/dashboard', 'mobile'),
    dimensions: { width: 375, height: 667 },
    timestamp: new Date()
  },
  {
    route: '/user/123',
    viewport: 'desktop',
    filePath: createPlaceholderImage('/user/123', 'desktop'),
    dimensions: { width: 1440, height: 900 },
    timestamp: new Date()
  }
];

// Mock annotation save handler
const handleSaveAnnotation = async (annotation: Annotation): Promise<void> => {
  console.log('[Staging Simulation] Saving annotation:', annotation);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate occasional errors for testing error handling
  if (Math.random() < 0.1) {
    throw new Error('Simulated save error - retry to succeed');
  }
};

// Mock publish handler
const handlePublish = async (): Promise<void> => {
  console.log('[Staging Simulation] Publishing annotations');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  alert('✅ Annotations published successfully!\n\nIn production, this would:\n1. Save all annotations to staging server\n2. Notify developers\n3. Mark review as complete');
};

// Initialize the app
const root = document.getElementById('protobooth-root');
if (!root) {
  throw new Error('Root element #protobooth-root not found');
}

const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(
  <React.StrictMode>
    <AnnotateApp
      onSaveAnnotation={handleSaveAnnotation}
      onPublish={handlePublish}
      screenshots={mockScreenshots}
    />
  </React.StrictMode>
);

console.log('🎨 Staging Simulation Active');
console.log('📸 Loaded screenshots:', mockScreenshots.length);
console.log('💡 Use the annotation tools to mark up screenshots');
console.log('✏️  Click on the canvas to add annotations');
console.log('🎨 Use the toolbar to select drawing tools');
console.log('📤 Click "Publish" when done to simulate publishing');
