import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index
});

function Index() {
  return (
    <div>
      <h1>Welcome to Protobooth Demo</h1>
      <p>This is a Vite + TanStack Router demo application for testing protobooth screenshot functionality.</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Features:</h2>
        <ul>
          <li>Static routes (/, /about, /products)</li>
          <li>Dynamic routes (/user/$userId, /product/$slug)</li>
          <li>Protected routes (/dashboard - requires auth)</li>
          <li>Mock authentication state</li>
          <li>Multiple viewports for responsive testing</li>
        </ul>
      </div>
    </div>
  );
}