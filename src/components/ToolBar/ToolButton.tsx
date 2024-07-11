import React, { useState, useMemo, PropsWithChildren, useCallback, useEffect } from 'react';
import { Tooltip } from 'antd';
import { useSlate } from 'slate-react';

import { toggleBlock, toggleMark, isBlockActive, isMarkActive } from './functions';

import classNames from 'classnames';
// @ts-ignore
import './styles.less';

const ToolButton: React.FC<
  PropsWithChildren<{
    style?: React.CSSProperties;
    type: 'block' | 'mark';
    description?: string;
    format: string;
  }>
> = (props) => {
  const { type, format, description, children, style = {} } = props;
  const slateEditor = useSlate();

  const clickHanle = useCallback(() => {
    if (type === 'block') {
      toggleBlock(slateEditor, format);
    }
    if (type === 'mark') {
      toggleMark(slateEditor, format);
    }
  }, [format, slateEditor, type]);

  const active = type === 'block' ? isBlockActive(slateEditor, format) : isMarkActive(slateEditor, format);

  return description ? (
    <Tooltip title={description}>
      <a onMouseDown={clickHanle} className={classNames('tool-button', { active })}>
        {children}
      </a>
    </Tooltip>
  ) : (
    <a style={style} onMouseDown={clickHanle} className={classNames('tool-button', { active })}>
      {children}
    </a>
  );
};

export default ToolButton;
