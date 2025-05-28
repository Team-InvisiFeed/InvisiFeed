// app/head.js

import Head from 'next/head';

export default function CustomHead() {
  return (
    <Head>
      <meta
        name="google-site-verification"
        content="zv5irB-R4RF0BMewa4wyOX7BpNnRglGG4x8IP3JHJP8"
      />
      <script
        src="https://checkout.razorpay.com/v1/checkout.js"
        async
      ></script>
    </Head>
  );
}
