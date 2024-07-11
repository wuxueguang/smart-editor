import React, { useMemo, useEffect, useContext, Suspense } from 'react';
// @ts-ignore
import { Form } from 'antd';
import RemoteComponent from '@ygyg/dynamic-component';
import { BaseEditorContext } from '..';
import { typeOf, getVariable, Logger } from '../../utils';
import { BaseObject, BaseModule, Variable } from '../../types';
import set from 'lodash/set';
import { FormEventItem as FormItem, useEventControl } from '@yg-cube/pro-field';
import { useSlate } from 'slate-react';
import { CustomizedEditor } from '../../customized-slate';

export type FormSubmitValues = Record<BaseObject['name'], Record<Variable['name'], any> | Record<number, Record<Variable['name'], any>>>;

const DatasManagePanel: React.FC<{
  moduleId: BaseModule['id'];
  names?: [BaseObject['name'], Variable['name']];
}> = (props) => {
  const { moduleId, names } = props;
  const { usedModulesRecord, usedObjectsRecord, datasStore } = useContext(BaseEditorContext);
  const slateEditor = useSlate() as CustomizedEditor;
  const [form] = Form.useForm();
  const module = usedModulesRecord[moduleId];

  const { event: eventCtrl } = useEventControl();
  const initialValues = useMemo(() => {
    const values: any = {};
    module.objects.forEach(({ name: objectName }) => {
      const observed = datasStore.get(objectName);
      if (observed) {
        values[objectName] = observed.data;
      }
    });
    return values;
  }, [datasStore, module.objects]);

  useEffect(() => {
    const { objects } = usedModulesRecord[moduleId];
    if (names) {
      // 单个变量插入
      objects.forEach(({ name: objectName, variables }) => {
        variables.forEach(({ name: variableName, enabled, required, editable, hidden = false }, idx: number) => {
          let config: Record<string, boolean> = {};
          if (getVariable(usedObjectsRecord, names)?.name !== variables[idx].name) {
            config = {
              disabled: !editable,
              unused: !enabled,
              required: false,
              hidden: true,
            };
          } else {
            config = {
              disabled: !editable,
              unused: !enabled,
              required,
              hidden,
            };
          }
          Logger.info(`[${objectName}, ${variableName}]`, config);
          eventCtrl?.setConfig([objectName, variableName], config);
        });
      });
    } else {
      objects.forEach(({ name: objectName, variables }) => {
        variables.forEach(({ name: variableName, hidden, enabled, required, editable }) => {
          const config = {
            disabled: !editable,
            unused: !enabled,
            required,
            hidden,
          };
          Logger.info(`[${objectName}, ${variableName}]`, config);
          eventCtrl?.setConfig([objectName, variableName], config);
        });
      });
    }
  }, [eventCtrl, moduleId, names, usedModulesRecord, usedObjectsRecord]);

  useEffect(() => {
    const handle = () => {
      const module = usedModulesRecord[moduleId];
      const { objects } = module;
      let objectName = '';
      let variableName = '';

      objects.forEach(({ name: _objectName, variables }) => {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < variables.length; i++) {
          const { name: _variableName } = variables[i];
          if (names && getVariable(usedObjectsRecord, names)?.name === _variableName) {
            objectName = _objectName;
            variableName = _variableName;
            break;
          }
        }
      });
      (names ? form.validateFields([[objectName, variableName]]) : form.validateFields()).then((patialValues: FormSubmitValues) => {
        const values: FormSubmitValues = form.getFieldsValue(true);
        slateEditor.ET.dispatchEvent(new CustomEvent('onSubmitStart'));
        Logger.info('表单提交数据', patialValues, values);
        Promise.resolve(slateEditor.handles.onFormSubmit?.(patialValues, values, module))
          .then(() => {
            slateEditor.ET.dispatchEvent(new CustomEvent('onSubmitSuccessed'));
            Object.keys(values).forEach((objectName: BaseObject['name']) => {
              const ret = generateKeysAndValues(values[objectName]);
              const observed = datasStore.get(objectName);

              observed.update((oldData) => {
                const newData = { ...oldData };
                // eslint-disable-next-line max-nested-callbacks
                ret.forEach(([key, value]) => {
                  set(newData, key, value);
                });
                return newData;
              });
            });
            slateEditor.ET.dispatchEvent(new CustomEvent('onDatasChange'));
          })
          .catch(() => {
            slateEditor.ET.dispatchEvent(new CustomEvent('onSubmitFailed'));
          });
      });
    };
    slateEditor.ET.addEventListener('onSubmit', handle);

    return () => slateEditor.ET.removeEventListener('onSubmit', handle);
  }, [datasStore, form, moduleId, names, slateEditor, usedModulesRecord, usedObjectsRecord]);

  const { formName, formUrl, formVersion } = module;
  const hasRemoteForm = formName && formVersion && formUrl;

  if (!hasRemoteForm) {
    console.warn('%c需要提供远程Form表单组件', 'font-size:24px;font-weight:800;');
  }

  Logger.table({ formName, formVersion, formUrl });

  return (
    <Suspense fallback={<></>}>
      <Form form={form} layout="vertical" scrollToFirstError initialValues={initialValues}>
        {hasRemoteForm && <RemoteComponent {...({ form, item: FormItem } as any)} name={formName} version={formVersion} file={formUrl} />}
      </Form>
    </Suspense>
  );
};

function generateKeysAndValues(data: Record<string, any>, keyPrev: string = '', ret: Array<[string, any]> = []): Array<[string, any]> {
  switch (typeOf(data)) {
    case 'array':
      data.forEach((value: Record<string, any>, idx: number) => {
        generateKeysAndValues(value, `${keyPrev}[${idx}]`, ret);
      });
      break;
    case 'object':
      Object.entries(data).forEach(([key, value]: [string, Record<string, any>]) => {
        generateKeysAndValues(value, `${keyPrev}['${key}']`, ret);
      });
      break;
    default:
      ret.push([keyPrev, data]);
  }

  return ret;
}

export default DatasManagePanel;
