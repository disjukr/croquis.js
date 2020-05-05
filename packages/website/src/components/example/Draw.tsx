import React from 'react';
import useLang from '../../misc/useLang';

interface DrawProps {
  drawing: boolean;
}
const Draw: React.FC<DrawProps> = ({ drawing }) => {
  const lang = useLang();
  return (
    <h1
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        margin: 0,
        width: '100%',
        textAlign: 'center',
        fontSize: '50px',
        transform: 'translate(-50%, -50%)',
        opacity: drawing ? 0 : 1,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
      {lang.startsWith('ko') ? '그려보세요' : 'draw'}
    </h1>
  );
};

export default Draw;
