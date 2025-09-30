import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ marginRight: '10px' }}>Home</Link>
        <Link href="/blog/getting-started" style={{ marginRight: '10px' }}>Blog</Link>
        <Link href="/user/1" style={{ marginRight: '10px' }}>User</Link>
        <Link href="/protobooth/resolve" style={{ marginRight: '10px' }}>Protobooth Resolve</Link>
        <Link href="/protobooth/annotate" style={{ marginRight: '10px' }}>Protobooth Annotate</Link>
      </nav>
      <hr />

      <h1>Next.js App Router Demo</h1>
      <p>This demo uses the modern App Router (recommended for new Next.js projects).</p>

      <div style={{ marginTop: '20px' }}>
        <h2>App Router Features:</h2>
        <ul>
          <li><strong>Server Components:</strong> React Server Components by default</li>
          <li><strong>Layouts:</strong> Shared UI across routes with layout.tsx</li>
          <li><strong>Dynamic Routes:</strong> [id] folder-based structure</li>
          <li><strong>Modern Data Fetching:</strong> async/await in Server Components</li>
        </ul>
      </div>

      <div style={{ backgroundColor: '#74b9ff', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Mock Global State</h3>
        <p><strong>Theme:</strong> Light Mode</p>
        <p><strong>Language:</strong> English</p>
        <p><strong>Feature Flags:</strong> App Router ✅, Server Components ✅</p>
      </div>
    </div>
  );
}