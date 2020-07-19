import React, { useState } from 'react';

import { HwapanProvider, Hwapan } from '../hwapan';
import MobileLayout from '../components/MobileLayout';

const Page: React.FC = () => {
  const [hwapan, setHwapan] = useState<Hwapan | null>(null);
  return <>
    {!hwapan ? (
      <div>
        ##  새 화판 만들기 <br/>
        가로크기 : (인풋) <br/>
        세로크기 : (인풋) <br/>
        [생성]
      </div>
    ) : (
      <HwapanProvider initialHwapan={hwapan}>
        <MobileLayout/>
      </HwapanProvider>
    )}
    <style jsx global>{`
      html, body {
        margin: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background-color: #f0f0f0;
      }
    `}</style>
  </>;
};

export default Page;
