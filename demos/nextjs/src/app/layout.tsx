import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ padding: '20px' }}>
          <nav style={{ marginBottom: '20px' }}>
            <Link href="/" style={{ marginRight: '10px' }}>App Home</Link>
            <Link href="/about" style={{ marginRight: '10px' }}>About</Link>
            <Link href="/products" style={{ marginRight: '10px' }}>Products</Link>
            <Link href="/user/1" style={{ marginRight: '10px' }}>User</Link>
            <Link href="/dashboard" style={{ marginRight: '10px' }}>Dashboard</Link>
            <Link href="/pages-demo" style={{ marginRight: '10px' }}>Pages Router</Link>
          </nav>
          <hr />
          {children}
        </div>
      </body>
    </html>
  );
}