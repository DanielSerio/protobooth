/**
 * View component for the "In Review" workflow state
 */
export function InReviewView() {
  return (
    <div className='workflow-state' data-testid='workflow-in-review'>
      <h2 data-testid='workflow-state-title'>In Review</h2>
      <p>Waiting for client feedback on staging server.</p>
    </div>
  );
}
