import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Template from '@yg-cube/pro-template';
import { Transforms, DataModelElement, SlateElement, ModuleElement } from 'slate';
import { useSlate } from 'slate-react';
import get from 'lodash/get';

import { CustomizedEditor, DATA_MODEL_CONTAINER, Utils } from '../../../customized-slate';
import { BaseEditorContext } from '../../../components';
import { BaseModule, BaseObject } from '../../../types';
import { FormSubmitValues } from '../../../components/DatasManagerDrawer/DatasManager';
import * as templateMethods from '../../../templateMethods';
import * as Logger from '../../../utils/logger';
import classNames from 'classnames';
import './styles.less';
import makeDataByObject from '../../../utils/makeDataByObject';
import { Space, Tooltip } from 'antd';

// eslint-disable-next-line complexity
const Element: React.FC<Record<string, any>> = (props) => {
  const { workMode, usedModulesRecord, usedObjectsRecord, datasStore, showDatasManageDrawer } = useContext(BaseEditorContext);
  const { attributes, children, element } = props;
  const { moduleId, modelData } = element as DataModelElement;

  const isEditStruct = workMode === 'edit-struct';

  const slateEditor = useSlate() as CustomizedEditor;

  const makeDatas = useCallback(() => {
    if (modelData) {
      return modelData;
    }

    const { objects = [] } = get(usedModulesRecord, moduleId, {} as BaseModule);
    const moduleDatas = objects.reduce((DR: FormSubmitValues, { name: objectName }: BaseObject) => {
      const observed = datasStore.get(objectName);
      DR[objectName] = observed?.data ?? makeDataByObject(usedObjectsRecord[objectName]);
      return DR;
    }, {} as FormSubmitValues);

    return moduleDatas;
  }, [datasStore, modelData, moduleId, usedModulesRecord, usedObjectsRecord]);

  const [moduleDatas, setModuleDatas] = useState(makeDatas());

  useEffect(() => {
    if (Utils.isDataModel(element) && !Utils.isVariable(element)) {
      const handle = () => setModuleDatas(makeDatas());
      slateEditor.ET.addEventListener('onDatasChange', handle);

      return () => slateEditor.ET.removeEventListener('onDatasChange', handle);
    }
    return () => void 0;
  }, [element, makeDatas, slateEditor]);

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

  const module = get(usedModulesRecord, moduleId, {} as BaseModule);
  if (!module) {
    Logger.warn('moduleId:', moduleId, 'module not found.');
  }
  const { label: moduleLabel, template, displayType, formUrl, formName, formVersion } = module;
  const hasRemoteFormJS = Boolean(formName && formVersion && formUrl);

  const tryShowDataManageDrawer = () => {
    if (canEdit) {
      showDatasManageDrawer({ moduleId });
    }
  };

  // 组件，使用 renderTemplate 做ui渲染
  // 行内组件
  if (displayType === 'inline') {
    const highlight = false ||
      modelData === undefined && ['edit-struct', 'edit-richText-only'].includes(workMode) ||
      modelData === undefined && ['edit', 'edit-content'].includes(workMode) && hasRemoteFormJS;

    const canEdit = modelData === undefined && hasRemoteFormJS && ['edit', 'edit-content'].includes(workMode);

    const content = (
      <span
        {...attributes}
        contentEditable={false}
        onClick={tryShowDataManageDrawer}
        className={classNames('inline', 'data-model', { highlight, 'can-edit': canEdit })}
      >
        <span ref={boxRef as any}>
          {
            <Template
              style={{}}
              imports={{ ...templateMethods }}
              wrapper="span"
              template={template?.trim() || '<span>渲染模板未提供</span>'}
              data={moduleDatas ?? {}}
            />
          }
          <span>{children}</span>
        </span>
      </span>
    );

    return highlight ? <Tooltip title={moduleLabel}>{content}</Tooltip> : content;
  }

  const highlight = false ||
    modelData === undefined && ['edit', 'edit-struct', 'edit-content', 'edit-richText-only'].includes(workMode);

  const canEdit = modelData === undefined && hasRemoteFormJS && ['edit', 'edit-content'].includes(workMode);
  const canDelete = modelData === undefined && ['edit', 'edit-struct'].includes(workMode);

  // 块组件
  return (
    <div
      {...attributes}
      contentEditable={false}
      className={classNames('block', 'data-model', workMode, {
        'can-edit': canEdit,
        highlight,
      })}
    >
      {highlight && (
        <div className={classNames('extra-container')}>
          <Space>

            <span className={classNames('module-label')}>{moduleLabel}</span>

            {canEdit && (
              <a onClick={() => {
                tryShowDataManageDrawer();
              }}
              >
                <span className={classNames('module-label')}>编辑&nbsp;</span>
                <EditOutlined
                  style={{ cursor: 'pointer' }}
                />
              </a>
            )}

            {canDelete && (
              <>
                <a
                  onClick={() => {
                    const idx = slateEditor.children.findIndex((item) => {
                      if ((item as SlateElement)?.type === DATA_MODEL_CONTAINER) {
                        return ((item as SlateElement).children[1] as ModuleElement).uid === element.uid;
                      }
                      return false;
                    });
                    Transforms.removeNodes(slateEditor, { at: [idx] });
                  }}
                >
                  <span>删除&nbsp;</span>
                  <DeleteOutlined
                    style={{ cursor: 'pointer' }}
                  />
                </a>
              </>
            )}

          </Space>
        </div>
      )}
      <div
        className="template-render-container"
        onClick={tryShowDataManageDrawer}
        ref={boxRef as any}
      >
        {
          <Template
            wrapper="div"
            imports={{ ...templateMethods }} // 全局设置
            style={{ whiteSpace: 'pre-line' }}
            template={template?.trim() || '<p>渲染模板未提供</p>'}
            data={moduleDatas ?? {}}
          />
        }
        <span>{children}</span>
      </div>
    </div>
  );
};

export default Element;
