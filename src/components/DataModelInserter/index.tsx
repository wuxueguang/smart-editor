import React, { useState, useMemo, useContext, useRef, useCallback, useEffect } from 'react';
import { Space, AutoComplete } from 'antd';
import { BaseModule } from '../../types';
import { modulesTrasfer } from '../../utils/transfers';
import Module from './Module';
import { BaseEditorContext } from '..';

import classNames from 'classnames';
import './styles.less';

const DataModelInserter: React.FC = () => {
  const { modules: allOriginModules } = useContext(BaseEditorContext);
  const allModules = useMemo(() => modulesTrasfer(allOriginModules), [allOriginModules]);
  const stRecorder = useRef(-1);

  const [{ targets, others }, setSorted] = useState({ targets: [] as BaseModule[], others: [...allModules] });

  const son = useRef(document.createElement('div'));

  const sortModules = useCallback(
    (sortKey: string) => {
      sortKey = sortKey?.trim() ?? '';

      if (sortKey.length === 0) {
        return {
          targets: [],
          others: [...allModules],
        };
      }

      const targets: BaseModule[] = [];
      const others: BaseModule[] = [];
      const rest: BaseModule[] = [];

      allModules.forEach((module) => {
        if (module.label.includes(sortKey)) {
          targets.push(module);
        } else {
          rest.push(module);
        }
      });

      rest.forEach((module) => {
        if (module.objects.some(({ variables }) => variables?.some(({
          label,
          hidden,
          enabled,
        }) => !hidden && enabled && label?.includes(sortKey)))) {
          targets.push(module);
        } else {
          others.push(module);
        }
      });
      return { targets, others };
    },
    [allModules],
  );

  const [autoCompleteOpts, setAutoCompleteOpts] = useState(allModules.map(({ label }) => ({ value: label })));

  useEffect(() => setSorted(sortModules('')), [allModules, sortModules]);

  return (
    <div className={classNames('smart-editor-inserter-container')}>
      <div>
        <div className={classNames('title-bar')}>组件</div>
        <div className={classNames('filter-container')}>
          <AutoComplete
            options={autoCompleteOpts}
            style={{ width: 256 }}
            onSelect={(keyword: string) => {
              // console.log('on select');
              // setSorted(sortModules(keyword));
              // son.current.scrollTo(0, 0);
            }}
            onSearch={(keyword: string) => {
              // console.log('on search');
              // setSorted(sortModules(keyword));
              // son.current.scrollTo(0, 0);
            }}
            placeholder="请输入组件关键字"
            onChange={(keyword: string) => {
              const sorted = sortModules(keyword.trim());
              if (keyword.trim().length) {
                setAutoCompleteOpts(sorted.targets.map(({ label }) => ({ value: label })));
              } else {
                setAutoCompleteOpts(sorted.others.map(({ label }) => ({ value: label })));
              }

              clearTimeout(stRecorder.current);
              setTimeout(() => {
                setSorted(sorted);
                son.current.scrollTo(0, 0);
              }, 500);
            }}
          />
        </div>
      </div>
      {/* <div className={cx('tags-container')}>{tags}</div> */}
      <div style={{ height: 'calc(100vh - 96px' }} className={classNames('module-list-container')}>
        <Space style={{ width: '100%' }} direction="vertical" size={[16, 16]}>
          {targets.map((module) => (
            <Module key={module.id} module={module} highlight />
          ))}
          {others.map((module) => (
            <Module key={module.id} module={module} />
          ))}
        </Space>
      </div>
    </div>
  );
};

export default DataModelInserter;

export { DataModelInserter };
