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
    <div className={clsx('protobooth-deployment-instructions', className)} data-testid={testId}>
      <div className="protobooth-deployment-instructions__summary">
        <h3>Screenshots Captured Successfully!</h3>
        <p>
          <strong>{screenshotCount} screenshots</strong> captured and saved to:
        </p>

        <div className="protobooth-deployment-instructions__path">
          <code>{outputPath}</code>
          <button
            onClick={handleCopyPath}
            className="protobooth-deployment-instructions__copy-button"
            title="Copy path to clipboard"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      <div className="protobooth-deployment-instructions__steps">
        <h4>Next Steps:</h4>
        <ol className="protobooth-deployment-instructions__list">
          {instructions.map((instruction, index) => (
            <li key={index} className="protobooth-deployment-instructions__step">
              {instruction}
            </li>
          ))}
        </ol>
      </div>

      <div className="protobooth-deployment-instructions__tips">
        <h4>Deployment Tips:</h4>
        <ul className="protobooth-deployment-instructions__tips-list">
          <li>Upload all files in the output directory to your staging server</li>
          <li>Ensure the annotation interface is accessible at <code>/protobooth/annotate</code></li>
          <li>Share the staging URL with your clients for review</li>
          <li>Return here to download annotations when clients click "Publish"</li>
        </ul>
      </div>
    </div>
  );
}