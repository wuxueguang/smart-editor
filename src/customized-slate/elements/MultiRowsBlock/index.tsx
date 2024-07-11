import React, { useContext } from 'react';
import { BaseEditorContext } from '../../../components';

import classNames from 'classnames';
import './styles.less';
import { CONTENT_CONTAINER_OF_MULTI_ROWS_BLOCK, EDGE_OF_MULTI_ROWS_BLOCK, HEAD_EDGE_OF_MULTI_ROWS_BLOCK, MULTI_ROWS_BLOCK, TAIL_EDGE_OF_MULTI_ROWS_BLOCK } from './consts';
import Edge from './Edge';
import { DeleteOutlined } from '@ant-design/icons';
import { CustomizedEditor } from '../../../customized-slate/withDataModel';
import { useSlate } from 'slate-react';
import { SlateElement, Transforms } from 'slate';

export const MultiRowsBlock: React.FC<Record<string, any>> = (props) => {
  const { workMode } = useContext(BaseEditorContext);
  const { attributes, children, element } = props;
  const slateEditor = useSlate() as CustomizedEditor;

  const highlight = ['edit'].includes(workMode);
  const hasToolbar = ['edit'].includes(workMode);
  const canHaveEdges = ['edit'].includes(workMode);

  switch (element.type) {
    case MULTI_ROWS_BLOCK:
      return (
        <div
          {...attributes}
          className={classNames('block', MULTI_ROWS_BLOCK, {
            'has-toolbar': hasToolbar,
            highlight,
          })}
        >
          {hasToolbar ? (
            <a
              contentEditable={false}
              className={classNames('toolbar-container')}
              onClick={() => {
                const idx = slateEditor.children.findIndex((item) => (item as SlateElement).uid === element.uid);
                Transforms.removeNodes(slateEditor, { at: [idx] });
              }}
            >
              <span>删除&nbsp;</span>
              <DeleteOutlined />
            </a>
          ) : null}
          {children}
        </div>
      );
    case CONTENT_CONTAINER_OF_MULTI_ROWS_BLOCK:
      return (
        <div
          contentEditable={false}
          className={classNames(CONTENT_CONTAINER_OF_MULTI_ROWS_BLOCK)}
        >{children}</div>
      );
    case HEAD_EDGE_OF_MULTI_ROWS_BLOCK:
      return canHaveEdges ? (
        <div
          {...attributes}
          className={classNames(EDGE_OF_MULTI_ROWS_BLOCK, 'head')}
        ><Edge {...props} /></div>
      ) : null;
    case TAIL_EDGE_OF_MULTI_ROWS_BLOCK:
      return canHaveEdges ? (
        <div
          {...attributes}
          className={classNames(EDGE_OF_MULTI_ROWS_BLOCK, 'tail')}
        ><Edge {...props} /></div>
      ) : null;
    default:
      return null;
  }
};
