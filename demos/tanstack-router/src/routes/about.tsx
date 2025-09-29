import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About
});

function About() {
  return (
    <div>
      <h1>About This Demo</h1>
      <p>This demo application showcases how protobooth can automatically discover routes and capture screenshots with fixture data.</p>

      <h2>Mock Data Features</h2>
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
        <h3>Authentication State</h3>
        <p><strong>User:</strong> Demo User (Admin)</p>
        <p><strong>Permissions:</strong> read, write, admin</p>
        <p><strong>Status:</strong> Authenticated</p>
      </div>

      <div style={{ backgroundColor: '#e8f4fd', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
        <h3>Global State</h3>
        <p><strong>Theme:</strong> Light</p>
        <p><strong>Language:</strong> English</p>
        <p><strong>Feature Flags:</strong> New Dashboard (enabled), Beta Features (disabled)</p>
      </div>
    </div>
  );
}