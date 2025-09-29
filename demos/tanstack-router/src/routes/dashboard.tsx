import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard
});

function Dashboard() {
  // This route should show authenticated state from fixtures
  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', padding: '15px', marginBottom: '20px' }}>
        <strong>🔐 Protected Route:</strong> This page requires authentication and will use fixture auth data for screenshots.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#007bff', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>1,234</p>
        </div>
        <div style={{ backgroundColor: '#28a745', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Active Projects</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>42</p>
        </div>
        <div style={{ backgroundColor: '#ffc107', color: 'black', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Pending Reviews</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>7</p>
        </div>
        <div style={{ backgroundColor: '#dc3545', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Issues</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>3</p>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Feature Flags Status</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <p>✅ <strong>New Dashboard:</strong> Enabled (you're seeing it now!)</p>
          <p>❌ <strong>Beta Features:</strong> Disabled</p>
        </div>
      </div>
    </div>
  );
}