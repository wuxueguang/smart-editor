import React from 'react';
import classNames from 'classnames';
import './styles.less';

export const DataModelEdge: React.FC<React.PropsWithChildren<{
  position: 'head' | 'tail';
}>> = ({ position, children }) => {
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
    }} className={classNames('data-model-edge', position)} style={{ width: 1, padding: '0 4px', overflow: 'hidden', height: '100%' }}>
      {children}
    </div>
  );
};
