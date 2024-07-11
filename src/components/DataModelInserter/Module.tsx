/* eslint-disable complexity */
import React, { useContext, useState } from 'react';
// @ts-ignore
import { Tooltip } from 'antd';
import { PlusCircleOutlined, PlusOutlined, ExclamationOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { BaseModule, BaseObject, Variable } from '../../types';
import { BaseEditorContext } from '..';
import makeDataByObject from '../../utils/makeDataByObject';
import { Transforms, Node as SlateNode, Point as SlatePoint, ModuleElement, VariableElement } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import * as Logger from '../../utils/logger';
import classNames from 'classnames';
// @ts-ignore
import './styles.less';
import { CustomizedEditor } from 'src/customized-slate';
import { DATA_MODEL_CONTAINER, DATA_MODEL_HEAD, DATA_MODEL_TAIL } from '../../customized-slate';

interface ModuleInsertParams {
  isVariable: false;
}

interface VariableInsertParams {
  isVariable: true;
  names: [BaseObject['name'], Variable['name']];
  objectName: BaseObject['name'];
  // _namePath: NamePath;
  variableLabel: Variable['label'];
}

const Module: React.FC<{
  highlight?: boolean;
  module: BaseModule;
}> = (props) => {
  const { datasStore, usedObjectsRecord, usedModulesRecord } = useContext(BaseEditorContext);
  const { module, highlight = false } = props;
  const { id: moduleId, label: moduleLabel, pickable, displayType, objects } = module;
  const slateEditor = useSlate();
  const [showVariables, setShowVariables] = useState(false);

  const onFinish = (params: ModuleInsertParams | VariableInsertParams) => {
    const { selection } = slateEditor;
    if (!selection) {
      return;
    }

    const { isInMultiRowsBlockHead, isInMultiRowsBlockTail } = slateEditor as CustomizedEditor;

    if (isInMultiRowsBlockHead() || isInMultiRowsBlockTail()) {
      Transforms.select(slateEditor, selection);
      ReactEditor.focus(slateEditor as ReactEditor);
      return;
    }

    if (SlatePoint.equals(selection.anchor, selection.focus)) {
      const inner = (nodes: any[] = []): boolean =>
        nodes.some((node) => (node?.type && [DATA_MODEL_CONTAINER, 'variable', 'module'].includes(node.type as string)) || inner(node.children as any[]));

      if (inner(slateEditor.getFragment())) {
        return;
      }
    }

    const newElement = { dataModel: true, children: [{ text: '' }] };

    if (params.isVariable) {
      const { variableLabel, names, objectName } = params;
      const variableElement: VariableElement = {
        ...(newElement as any),
        type: 'variable',
        moduleId,
        names,
      };

      datasStore.add(objectName, makeDataByObject(usedObjectsRecord[objectName]));

      // slateEditor.insertNode({ text: `${variableLabel}：` });
      // @ts-ignore
      // slateEditor.insertNode([variableElement, { text: '    ' }]);
      Transforms.insertNodes(slateEditor, [{ text: `${variableLabel}：` }]);
      Transforms.insertNodes(slateEditor, [variableElement, { text: '    ' }]);
    }

    if (!params.isVariable) {
      const moduleElement: ModuleElement = {
        ...(newElement as any),
        type: 'module',
        moduleId,
      };

      Logger.info(module.label, module);

      objects.forEach((object) => {
        Logger.info(object.name, object);
        datasStore.add(object.name, makeDataByObject(object));
      });

      if (displayType === 'inline') {
        // @ts-ignore
        // slateEditor.insertNode([moduleElement, { text: ' ' }]);
        Transforms.insertNodes(slateEditor, [moduleElement, { text: '    ' }]);
      }

      // block module insert
      if (displayType === 'block') {
        const node = {
          type: DATA_MODEL_CONTAINER,
          children: [
            {
              type: DATA_MODEL_HEAD,
              children: [{ text: '' }],
            },
            moduleElement,
            {
              type: DATA_MODEL_TAIL,
              children: [{ text: '' }],
            },
          ],
        } as SlateNode;

        const {
          isInDataModelHead,
          isInDataModelTail,
          // isInMultiRowsBlockHead,
          // isInMultiRowsBlockTail,
          isEmptyBlock,
        } = slateEditor as CustomizedEditor;
        if (
          !isInDataModelHead() &&
          !isInDataModelTail() /* &&
          !isInMultiRowsBlockHead() &&
          !isInMultiRowsBlockTail() */
        ) {
          const path = selection.anchor.path;
          if (isEmptyBlock() && selection.anchor.path[0] !== 0) {
            Promise.resolve().then(() => {
              Transforms.removeNodes(slateEditor, { at: [path[0]] });
            });
          }
          // slateEditor.insertNode(node);
          Transforms.insertNodes(slateEditor, node);
        }
        slateEditor.insertBreak();
      }
    }

    ReactEditor.focus(slateEditor as ReactEditor);
    (slateEditor as CustomizedEditor).justInserted = true;
  };

  /** 第一层，组件列表 */
  return (
    <div className={classNames('module-container', { highlight, 'variables-showed': showVariables })}>
      <div className={classNames('module-label-container', 'row-flex', { pickable })}>
        <span onClick={() => setShowVariables(!showVariables)} className={classNames('module-label')}>
          <span className={classNames({ arrow: true, down: showVariables })}>
            {showVariables ? <DownOutlined /> : <RightOutlined />}
          </span>
          {moduleLabel}
        </span>
        {!pickable && (
          <a
            className={classNames('add-button')}
            onClick={() => {
              if (slateEditor.selection) {
                usedModulesRecord[moduleId] = module;
                objects.forEach((object) => {
                  usedObjectsRecord[object.name] = object;
                  datasStore.add(object.name, makeDataByObject(object));
                });

                onFinish({ isVariable: false });
              }
            }}
          >
            <PlusCircleOutlined />
          </a>
        )}
      </div>
      {showVariables && (
        <>
          {pickable || (
            <div className={classNames('unpickable-warning')}>
              <i className={classNames('warning-icon')}>
                <ExclamationOutlined />
              </i>
              <span className={classNames('tip')}>系统预设不可单独添加</span>
            </div>
          )}
          {/* 第二层，pickable 的变量列表 */}
          {objects.map((object) => {
            const { name: objectName, variables } = object;

            return variables
              .filter(({ enabled, hidden }) => enabled && !hidden)
              .map(({ enabled, hidden, description, name: variableName, label: variableLabel }) => {
                const variableCanInsert = pickable && enabled && !hidden;
                return (
                  <div key={`${objectName}-${variableName}`} className={classNames('variable-container', 'row-flex')}>
                    <Tooltip title={description}>
                      <div className={classNames('variable-label', 'omit')}>
                        <span style={{ wordBreak: 'break-all' }}>{variableLabel}</span>
                      </div>
                    </Tooltip>

                    {variableCanInsert && (
                      <a
                        className={classNames('add-button')}
                        onClick={() => {
                          if (slateEditor.selection) {
                            usedModulesRecord[moduleId] = module;
                            usedObjectsRecord[objectName] = object;
                            datasStore.add(objectName, makeDataByObject(object));

                            onFinish({
                              objectName,
                              variableLabel,
                              isVariable: true,
                              names: [objectName, variableName],
                            });
                          }
                        }}
                      >
                        <PlusOutlined />
                      </a>
                    )}
                  </div>
                );
              });
          })}
        </>
      )}
    </div>
  );
};

export default Module;
