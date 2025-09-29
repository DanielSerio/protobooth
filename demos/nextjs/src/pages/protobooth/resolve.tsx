import { GetServerSideProps } from 'next';
import Head from 'next/head';

export default function ProtobothResolve() {
  return (
    <>
      <Head>
        <title>Protobooth - Development</title>
        <link rel="stylesheet" href="/protobooth/assets/style.css" />
      </Head>
      <div id="protobooth-root">
        <h1>Protobooth Development UI</h1>
        <p>Next.js route injection working! Mode: resolve</p>
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