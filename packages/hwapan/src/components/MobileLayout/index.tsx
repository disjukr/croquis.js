import React, { useEffect } from 'react';
import Head from 'next/head';

import Menu from './Menu';

const MobileLayout: React.FC = () => {
  return <>
    <Head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width, user-scalable=no"/>
    </Head>
    <Menu/>
  </>;
};

export default MobileLayout;
