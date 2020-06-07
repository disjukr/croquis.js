import React from 'react';

import { HwapanProvider } from '../hwapan';
import MobileLayout from '../components/MobileLayout';

const Page: React.FC = () => {
  return <HwapanProvider>
    <MobileLayout/>
    <style jsx global>{`
      html, body {
        margin: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background-color: #f0f0f0;
      }
    `}</style>
  </HwapanProvider>;
};

export default Page;
