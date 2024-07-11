import React from 'react';
import { Modal, Divider } from 'antd';
import { BaseModule, BaseObject, Variable, EditorInstance } from '../../types';
import { Logger } from '../../utils';
import { Store } from '../../hooks';

interface InfoOfVariable {
  label: Variable['label'];
  name: Variable['name'];
  uid?: string;
}

interface InfoOfObject {
  name: BaseObject['name'];
  label: BaseObject['label'];
  variables: InfoOfVariable[];
}

interface InfoOfModule {
  id: BaseModule['id'];
  label: BaseModule['label'];
  objects: InfoOfObject[];
}

const warn = (variables: Array<InfoOfVariable & Partial<Variable>>) => {
  if (variables.length) {
    Modal.error({
      width: 600,
      title: '协议中存在尚未填写的信息，请将下列信息填写完整后再次签署',
      content: (
        <>
          <ol>
            {variables.map((variable) => (
              <li key={variable.uid}>
                【<span style={{ borderBottom: 'solid 1px #666', backgroundColor: '#fff5f0' }}>{variable.label}</span>】
              </li>
            ))}
          </ol>
          <Divider dashed />
          <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 500 }}>如何填写或修改信息？</div>
            <div style={{ color: '#7F7F7F' }}>
              1、关闭弹窗后，点击文档中【<span style={{ color: '#000', borderBottom: 'solid 1px #666', backgroundColor: '#fff5f0' }}>xxxxxx</span>
              】区域，待弹出窗口后进行填写或修改信息。
            </div>
            <div style={{ color: '#7F7F7F' }}>
              2、小技巧：可以通过contrl+f，快速定位关键词。
            </div>
          </div>
        </>
      ),
    });
  }
};

export default (usedModulesRecord: Record<string, BaseModule>, datasStore: Store, editor: EditorInstance) => (validater: any) => {
  const modules = Object.values(usedModulesRecord);

  const mr: Record<BaseObject['name'], Set<Variable['name']>> = {};

  (function inner(o: any) {
    o.children.forEach((item: any) => {
      if (item.dataModel && item.type === 'variable') {
        const { names } = item;
        const [objectName, variableName]: [string, string] = names;

        if (!mr[objectName]) {
          mr[objectName] = new Set();
        }

        mr[objectName].add(variableName);
      }

      if (item.children) {
        inner(item);
      }
    });
  })(editor.getSlateEditor());

  const datas: Record<string, any> = {};
  const objectNames = datasStore.getAll().data;
  objectNames.forEach((objectName) => (datas[objectName] = datasStore.get(objectName).data));
  Logger.info('datas', datas);

  if (validater) {
    return validater(datas, modules, warn);
  }

  const ret: InfoOfModule[] = [];
  modules.forEach((module) => {
    Logger.info(`module: ${module.label}`, module);

    const moduleInfo: InfoOfModule = { id: module.id, label: module.label, objects: [] };
    // if (Boolean(module.formName && module.formVersion && module.formUrl)) {
    module.objects.forEach((object: BaseObject) => {
      let _objectDatas = datas[object.name] ?? [];

      if (object.dataType !== 'array') {
        _objectDatas = [_objectDatas];
      }

      Logger.info(object.name, _objectDatas);

      const objectInfo: InfoOfObject = { name: object.name, label: object.label, variables: [] };

      object.variables.forEach((variable) => {
        let required = variable.required;
        if (module.pickable && !mr[object.name].has(variable.name)) {
          required = false;
        }

        /* 必填变量，需要验证 */
        if (required) {
          const { label: variableLabel, name: variableName } = variable;
          const passed = _objectDatas.every(function (data: Record<Variable['name'], any>) {
            Logger.info(`${module.label} ${object.label} ${variableLabel} (${variableName}) is required, and its value is `, data[variableName]);
            return data[variableName] !== undefined && data[variableName] !== '';
          });

          /* 记录未填写的必填变量 */
          if (!passed) {
            objectInfo.variables.push({
              name: variableName,
              label: variableLabel,
            });
          }
        }
      });

      /* 记录有必填变量未填写的对象 */
      if (objectInfo.variables.length) {
        moduleInfo.objects.push(objectInfo);
      }
    });
    // }

    /* 记录有必填变量未填写的对象的组件 */
    if (moduleInfo.objects.length) {
      ret.push(moduleInfo);
    }
  });

  const variables: InfoOfVariable[] = [];

  ret.forEach((module) => {
    module.objects.forEach((object) => {
      object.variables.forEach((variable) => {
        variables.push({ ...variable, uid: `${module.id}-${object.name}-${variable.name}`});
      });
    });
  });

  warn(variables);

  /* 验证结果 */
  return variables.length === 0;
};
