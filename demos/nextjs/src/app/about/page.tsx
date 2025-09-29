export default function AboutPage() {
  return (
    <div>
      <h1>About This Next.js Demo</h1>
      <p>This demo showcases how protobooth works with Next.js applications using both App Router and Pages Router patterns.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
          <h3>App Router (Modern)</h3>
          <ul>
            <li>Server Components by default</li>
            <li>Nested layouts</li>
            <li>File-system based routing</li>
            <li>Built-in loading and error states</li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
          <h3>Pages Router (Legacy)</h3>
          <ul>
            <li>Traditional React components</li>
            <li>pages/ directory structure</li>
            <li>getServerSideProps/getStaticProps</li>
            <li>API routes in pages/api/</li>
          </ul>
        </div>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Authentication State (App Router)</h3>
        <p><strong>User:</strong> Next.js Demo User (Admin)</p>
        <p><strong>Permissions:</strong> read, write, admin</p>
        <p><strong>Status:</strong> Authenticated ✅</p>
      </div>
    </div>
  );
}