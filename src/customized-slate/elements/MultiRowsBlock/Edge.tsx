import React from 'react';
import './styles.less';

const Edge: React.FC<React.PropsWithChildren> = ({ children }) => {
  void 0;

  return (
    <div ref={(div) => {
      const handle = () => {
        if (div) {
          const { height } = div.getBoundingClientRect();
          div.style.setProperty('font-size', `${height}px`);
          div.style.setProperty('line-height', `${height}px`);
        }
      };
      div?.addEventListener('resize', handle);
      handle();
    }} style={{ width: 1, padding: '0 4px', overflow: 'hidden', height: '100%' }}
    >
      {children}
    </div>
  );
};

export default Edge;
