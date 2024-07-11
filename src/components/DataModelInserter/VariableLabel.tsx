import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';

import classNames, { Binding } from 'classnames/bind';
// @ts-ignore
import styles from './styles.less';
const cx = classNames.bind(styles as Binding);

const VariableLabel: React.FC<{
  description: string;
  label: string;
}> = (props) => {
  const { description } = props;

  const [label, setLabel] = useState('test');
  const [signal, setNeedTooltip] = useState<1 | 0 | -1>(0);

  const parent = useRef(document.createElement('div'));
  const son = useRef(document.createElement('span'));

  // useEffect(() => {
  //   Logger.info('son', son.current);
  //   const { width: parentWidth } = parent.current.getBoundingClientRect();
  //   // Logger.info(parentWidth);

  //   const observer = new ResizeObserver((targets) => {
  //     Logger.info(parentWidth);
  //     Logger.info('---------', targets[0].target.getBoundingClientRect());
  //   });

  //   observer.observe(son.current);
  // }, []);

  useEffect(() => {
    setTimeout(() => {
      setLabel('是的发生的发大水发大飒飒大发范德萨发士大夫撒');
    }, 3000);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {signal === 1 && (
        <Tooltip title={description}>
          <div style={{ position: 'absolute', top: 0, left: 0 }} className={cx('variable-label', 'omit')}>
            <span>{label}</span>
          </div>
        </Tooltip>
      )}
      {signal === -1 && (
        <div style={{ position: 'absolute', top: 0, left: 0 }} className={cx('variable-label', 'omit')}>
          <Tooltip title={description}>
            <span>{label}</span>
          </Tooltip>
        </div>
      )}
      <div className={cx('variable-label')} ref={parent}>
        <span ref={son}>{label}</span>
      </div>
    </div>
  );
};

export default VariableLabel;
