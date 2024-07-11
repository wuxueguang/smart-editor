import React, { useState, useCallback, PropsWithChildren } from 'react';
import { Popover, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useSlate } from 'slate-react';

import { toggleBlock, toggleMark, isBlockActive, isMarkActive } from './functions';
import ToolButton from './ToolButton';

import classNames from 'classnames';
// @ts-ignore
import './styles.less';

const ToolList: React.FC<{
  type: 'block' | 'mark';
  defaultFormat: string;
  width: number | string;
  items: Array<{ label: string; format: string; content: React.ReactElement }>;
}> = (props) => {
  const { type, defaultFormat, items, width } = props;
  const slateEditor = useSlate();

  const activeItem =
    items.find(({ format }) => {
      let flag = false;
      if (type === 'block') {
        flag = isBlockActive(slateEditor, format);
      }
      if (type === 'mark') {
        return isMarkActive(slateEditor, format);
      }
      return flag;
    }) ?? items.find(({ format }) => defaultFormat === format);

  return (
    <Popover
      trigger="hover"
      className={classNames('tool-list-popover')}
      placement="bottomLeft"
      content={items.map(({ format, content }) => (
        <div key={format}>
          <ToolButton
            style={{
              display: 'inline-block',
              borderBottom: 'solid 1px #fff',
              width: '100%',
              textAlign: 'left',
            }}
            type={type}
            format={format}
          >
            {content}
          </ToolButton>
        </div>
      ))}
    >
      <a style={{ width }} className={classNames('tool-list-container')}>
        <span className={classNames('inline-block')}>{activeItem?.label}</span>
        <span>
          <DownOutlined />
        </span>
      </a>
    </Popover>
  );
};

export default ToolList;
