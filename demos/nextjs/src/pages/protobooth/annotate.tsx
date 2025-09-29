import { GetServerSideProps } from 'next';
import Head from 'next/head';

export default function ProtoboothAnnotate() {
  return (
    <>
      <Head>
        <title>Protobooth - Annotation</title>
        <link rel="stylesheet" href="/protobooth/assets/style.css" />
      </Head>
      <div id="protobooth-root">
        <h1>Protobooth Annotation UI</h1>
        <p>Next.js route injection working! Mode: annotate</p>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__PROTOBOOTH_CONFIG__ = ${JSON.stringify({})};`,
        }}
      />
      <script src="/protobooth/assets/app.js"></script>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};