import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js App Router Demo - Protobooth',
  description: 'Demo application for testing Protobooth with Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}