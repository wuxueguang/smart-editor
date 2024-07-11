import React, { useContext } from 'react';
import { BaseEditorContext } from '../../../components';
import { DataModelEdge } from './DataModelEdge';
import { DATA_MODEL_CONTAINER, DATA_MODEL_HEAD, DATA_MODEL_TAIL } from '../../consts';

import classNames from 'classnames';
import './styles.less';

const Element: React.FC<Record<string, any>> = (props) => {
  const { workMode } = useContext(BaseEditorContext);
  const { attributes, children, element } = props;

  const canHaveEdges = ['edit', 'select', 'edit-struct', 'edit-richText-only'].includes(workMode);

  switch (element.type) {
    case DATA_MODEL_CONTAINER:
      return (
        <div
          {...attributes}
          className={classNames('paragraph', DATA_MODEL_CONTAINER, workMode)}
        >
          {children}
        </div>
      );
    case DATA_MODEL_HEAD:
      return canHaveEdges ? (
        <div
          style={{
            position: 'absolute',
            height: '100%',
            zIndex: 9,
            left: 0,
            top: 0,
          }}
          {...attributes}
        >
          <DataModelEdge position="head">{children}</DataModelEdge>
        </div>
      ) : null;
    case DATA_MODEL_TAIL:
      return canHaveEdges ? (
        <div
          style={{
            position: 'absolute',
            height: '100%',
            zIndex: 9,
            right: 0,
            top: 0,
          }}
          {...attributes}
        >
          <DataModelEdge position="tail">{children}</DataModelEdge>
        </div>
      ) : null;
    default:
      return null;
  }
};

export default Element;
