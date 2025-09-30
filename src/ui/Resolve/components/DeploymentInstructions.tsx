import React from 'react';
import { clsx } from 'clsx';

interface DeploymentInstructionsProps {
  screenshotCount: number;
  outputPath: string;
  instructions: string[];
  className?: string;
  'data-testid'?: string;
}

export function DeploymentInstructions({
  screenshotCount,
  outputPath,
  instructions,
  className,
  'data-testid': testId
}: DeploymentInstructionsProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(outputPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy path:', error);
    }
  };

  return (
    <div className={clsx('deployment-card', className)} data-testid={testId}>
      <div className="summary">
        <h3>Screenshots Captured Successfully!</h3>
        <p>
          <strong>{screenshotCount} screenshots</strong> captured and saved to:
        </p>

        <div className="path-display">
          <code>{outputPath}</code>
          <button
            onClick={handleCopyPath}
            className="btn-copy"
            title="Copy path to clipboard"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      <div className="steps-section">
        <h4>Next Steps:</h4>
        <ol className="list-ordered">
          {instructions.map((instruction, index) => (
            <li key={index} className="list-item">
              {instruction}
            </li>
          ))}
        </ol>
      </div>

      <div className="tips-section">
        <h4>Deployment Tips:</h4>
        <ul className="list-unstyled">
          <li>Upload all files in the output directory to your staging server</li>
          <li>Ensure the annotation interface is accessible at <code>/protobooth/annotate</code></li>
          <li>Share the staging URL with your clients for review</li>
          <li>Return here to download annotations when clients click "Publish"</li>
        </ul>
      </div>
    </div>
  );
}