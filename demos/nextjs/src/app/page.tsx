export default function HomePage() {
  return (
    <div>
      <h1>Next.js App Router Demo</h1>
      <p>This is a Next.js demo application using the App Router for testing protobooth screenshot functionality.</p>

      <div style={{ marginTop: '20px' }}>
        <h2>Features Demonstrated:</h2>
        <ul>
          <li><strong>App Router:</strong> Modern Next.js routing (this section)</li>
          <li><strong>Pages Router:</strong> Traditional Next.js routing (legacy)</li>
          <li><strong>Dynamic Routes:</strong> [id], [slug], [...path] patterns</li>
          <li><strong>Protected Routes:</strong> Authentication-required pages</li>
          <li><strong>Mock Data:</strong> Fixture-based content for consistent screenshots</li>
        </ul>
      </div>

      <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Mock Global State (App Router)</h3>
        <p><strong>Theme:</strong> Dark Mode</p>
        <p><strong>Language:</strong> English</p>
        <p><strong>Feature Flags:</strong> New Layout ✅, Experimental Features ✅</p>
      </div>
    </div>
  );
}