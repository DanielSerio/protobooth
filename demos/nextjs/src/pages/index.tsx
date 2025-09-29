import Link from 'next/link';

export default function PagesHome() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ marginRight: '10px' }}>App Router</Link>
        <Link href="/pages-demo" style={{ marginRight: '10px' }}>Pages Home</Link>
        <Link href="/blog/getting-started" style={{ marginRight: '10px' }}>Blog</Link>
        <Link href="/user/1" style={{ marginRight: '10px' }}>User (Pages)</Link>
        <Link href="/category/electronics/laptops" style={{ marginRight: '10px' }}>Category</Link>
      </nav>
      <hr />

      <h1>Next.js Pages Router Demo</h1>
      <p>This section uses the traditional Pages Router for comparison with App Router functionality.</p>

      <div style={{ marginTop: '20px' }}>
        <h2>Pages Router Features:</h2>
        <ul>
          <li><strong>Traditional Routing:</strong> pages/ directory structure</li>
          <li><strong>Dynamic Routes:</strong> [id].tsx, [slug].tsx, [...path].tsx</li>
          <li><strong>API Routes:</strong> pages/api/ for backend endpoints</li>
          <li><strong>Data Fetching:</strong> getServerSideProps, getStaticProps</li>
        </ul>
      </div>

      <div style={{ backgroundColor: '#ffeaa7', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Mock Global State (Pages Router)</h3>
        <p><strong>Theme:</strong> Dark Mode</p>
        <p><strong>Language:</strong> English</p>
        <p><strong>Feature Flags:</strong> New Layout ✅, Experimental Features ✅</p>
      </div>
    </div>
  );
}