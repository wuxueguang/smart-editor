import React, { useContext } from 'react';
import { Space, Button } from 'antd';
import {
  BoldOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  ItalicOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import ToolButton from './ToolButton';
import ToolList from './ToolList';
import { useSlate } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import { BaseEditorContext } from '..';
import { Logger } from '../../utils';

import classNames from 'classnames';
// @ts-ignore
import './styles.less';

const headingItems = [
  {
    label: '24px 合同名称',
    format: 'heading-one',
    content: <h1 className={classNames('heading-one', 'inline-block')}>24px 合同名称</h1>,
  },
  {
    label: '18px 目录标题',
    format: 'heading-three',
    content: <h3 className={classNames('heading-two', 'inline-block')}>18px 目录标题</h3>,
  },
  {
    label: '16px 副标题',
    format: 'heading-four',
    content: <h4 className={classNames('heading-three', 'inline-block')}>16px 副标题</h4>,
  },
  {
    label: '14px 正文',
    format: 'paragraph',
    content: <span className={classNames('paragraph', 'inline-block')}>14px 正文</span>,
  },
];

const Toolbar: React.FC = () => {
  const { modules } = useContext(BaseEditorContext);
  const slateEditor = useSlate();

  return (
    <div className={classNames('smart-editor-toolbar-container', 'bg-white')}>
      <Space>
        <ToolList width={136} type="block" items={headingItems} defaultFormat="paragraph" />

        <ToolButton type="mark" format="bold">
          <BoldOutlined />
        </ToolButton>
        <ToolButton type="mark" format="italic">
          <ItalicOutlined />
        </ToolButton>

        <ToolButton type="block" format="numbered-list">
          <OrderedListOutlined />
        </ToolButton>
        <ToolButton type="block" format="bulleted-list">
          <UnorderedListOutlined />
        </ToolButton>

        <ToolButton type="block" format="left">
          <AlignLeftOutlined />
        </ToolButton>
        <ToolButton type="block" format="center">
          <AlignCenterOutlined />
        </ToolButton>
        <ToolButton type="block" format="right">
          <AlignRightOutlined />
        </ToolButton>

        <span>
          <a className={classNames('tool-button')} onClick={() => (slateEditor as HistoryEditor).undo()}>
            <UndoOutlined />
          </a>
          <a className={classNames('tool-button')} onClick={() => (slateEditor as HistoryEditor).redo()}>
            <RedoOutlined />
          </a>
        </span>

        {/* <a
          className={classNames('tool-button')}
          onClick={() => {
            (slateEditor as CustomizedEditor).ET.dispatchEvent(new CustomEvent(isFullScreen ? 'onExitFullScreen' : 'onEnterFullScreen'));
          }}
        >
          {isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </a> */}

        {new URLSearchParams(location.search).get('console') === 'yes' && (
          <Button
            onClick={() => {
              // Logger.info('tail point', slateEditor.selection?.anchor);
              Logger.info('selection', slateEditor.selection);
              Logger.info('fragment', slateEditor.getFragment());
              // Logger.info('selection', slateEditor.selection);
              Logger.info('children', slateEditor.children);
              Logger.info('modules', modules);
              // Logger.info('current block', (slateEditor as CustomizedEditor).isEmptyBlock());
              Logger.info('slateEditor', slateEditor);
            }}
          >
            CONSOLE
          </Button>
        )}
      </Space>
    </div>
  );
};

export default Toolbar;
