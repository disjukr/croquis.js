import React from 'react';
import { SketchPicker } from 'react-color';

const LayersTab: React.FC = () => {
  return <>
    <SketchPicker
      disableAlpha
      color='#000'
    />
  </>;
};

export default LayersTab;
