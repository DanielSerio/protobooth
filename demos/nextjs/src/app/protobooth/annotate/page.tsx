import Script from 'next/script';

export const metadata = {
  title: 'Protobooth - Annotate',
};

export default function ProtoboothAnnotate() {
  return (
    <>
      <link rel="stylesheet" href="/protobooth/assets/style.css" />
      <div id="protobooth-root">
        <h1>Protobooth Annotation UI</h1>
        <p>Next.js App Router route injection working! Mode: annotate</p>
      </div>
      <Script
        id="protobooth-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.__PROTOBOOTH_CONFIG__ = ${JSON.stringify({})};`,
        }}
      />
      <Script src="/protobooth/assets/app.js" strategy="afterInteractive" />
    </>
  );
}