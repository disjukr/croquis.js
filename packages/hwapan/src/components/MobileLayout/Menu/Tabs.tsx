import React, { useState } from 'react';

import BrushTab from './tabs/brush';
import LayersTab from './tabs/layers';

type Tab = keyof typeof tabs;
const tabOrder: Tab[] = ['brush', 'layers'];
const tabs = {
  brush: BrushTab,
  layers: LayersTab,
};
const tabLabels = {
  brush: '브러시',
  layers: '레이어',
};

const Tabs: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('brush');
  const TabComponent = tabs[currentTab];
  return <div className='tabs'>
    <div>
      {tabOrder.map(tab => {
        const selected = tab === currentTab;
        return <button key={tab} style={{
          fontWeight: selected ? 'bold' : 'normal',
        }}>
          {tabLabels[tab]}
        </button>;
      })}
    </div>
    <div>
      <TabComponent/>
    </div>
    <style jsx>{`
      .tabs {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    `}</style>
  </div>;
};

export default Tabs;
