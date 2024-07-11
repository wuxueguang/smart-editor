import React, { useContext, useEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import { VariableElement as TypeVariableElement } from 'slate';
import { useSlate } from 'slate-react';
import get from 'lodash/get';

import { CustomizedEditor } from '../..';
import { BaseEditorContext } from '../../../components';
import { useObserved, getVariable } from '../../../utils';
import { BaseModule, WorkMode } from '../../../types';
import * as Logger from '../../../utils/logger';

import classNames from 'classnames';
import './styles.less';

// eslint-disable-next-line complexity
const VariableElement: React.FC<Record<string, any>> = (props) => {
  const { workMode, usedModulesRecord, usedObjectsRecord, datasStore, showDatasManageDrawer } = useContext(BaseEditorContext);
  const { attributes, children, element } = props;

  const isEditStruct = workMode === 'edit-struct';

  const { moduleId, names, modelData } = element as TypeVariableElement;

  const slateEditor = useSlate() as CustomizedEditor;

  const [objectData] = useObserved(datasStore.get(names[0]));

  const counter = useRef(0);
  const boxRef = useRef<HTMLDivElement | HTMLSpanElement>();
  useEffect(() => {
    if (isEditStruct && boxRef.current && slateEditor.justInserted && counter.current === 0) {
      const { top } = boxRef.current.getBoundingClientRect();

      if (top > window.innerHeight) {
        boxRef.current.scrollIntoView({ block: 'center' });
      }

      counter.current += 1;
      slateEditor.justInserted = false;
    }
  }, [isEditStruct, slateEditor, slateEditor.justInserted]);

  const { label: moduleLabel, formUrl, formName, formVersion } = get(usedModulesRecord, moduleId, {} as BaseModule);
  const hasRemoteFormJS = Boolean(formName && formVersion && formUrl);

  const { label: variableLabel, editable } = getVariable(usedObjectsRecord, names) ?? {};
  const dataNamePath = names.map((name: string, idx: number) => (idx === 0 ? '' : `['${name}']`)).join('');

  const highlight = false ||
    modelData === undefined && ['edit-struct', 'edit-richText-only'].includes(workMode) ||
    modelData === undefined && ['edit', 'edit-content'].includes(workMode) && Boolean(editable) && hasRemoteFormJS;
  const canEdit = modelData === undefined && Boolean(editable) && hasRemoteFormJS && ['edit', 'edit-content'].includes(workMode);

  return (
    <span
      {...attributes}
      contentEditable={false}
      className={classNames('data-model', 'inline', { highlight, 'can-edit': canEdit })}
      onClick={() => {
        if (canEdit) {
          showDatasManageDrawer({ moduleId, names });
          Logger.info('show form');
        }
      }}
    >
      {highlight ? (
        <Tooltip title={moduleLabel}>
          <span
            ref={boxRef as any}
            className={classNames({
              'can-edit': editable && hasRemoteFormJS,
              'without-underline': editable && hasRemoteFormJS,
              'with-underline': ['edit-content'].includes(workMode) && !(editable && hasRemoteFormJS),
            })}
          >
            {get(objectData, dataNamePath) || <span style={{ color: '#bbb' }}>{variableLabel ?? '变量Label'}</span>}
          </span>
        </Tooltip>
      ) : (
        <span
          ref={boxRef as any}
          className='with-underline'
        >
          {(modelData ?? get(objectData, dataNamePath)) || <span style={{ color: '#bbb' }}>{variableLabel}</span>}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

export default VariableElement;
