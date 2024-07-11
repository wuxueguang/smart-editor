/* eslint-disable complexity */
import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef, useEffect, useContext } from 'react';
import { Drawer, Button, Space } from 'antd';
import { useSlate } from 'slate-react';
import DatasManager from './DatasManager';
import { BaseModule, BaseObject, Variable } from '../../types';
import { CustomizedEditor } from '../../customized-slate';
import { BaseEditorContext } from '..';
import { Logger } from '../../utils';

interface RefCurrent {
  show: (params: { moduleId: BaseModule['id']; names?: [BaseObject['name'], Variable['name']] }) => void;
  hide: () => void;
}

const DatasManageDrawer = forwardRef<RefCurrent>((_, ref) => {
  const { usedModulesRecord } = useContext(BaseEditorContext);
  const [moduleId, setModuleName] = useState<BaseModule['id']>();
  const [names, setNames] = useState<[BaseObject['name'], Variable['name']]>();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const slateEditor = useSlate() as CustomizedEditor;

  useImperativeHandle(ref, () => ({
    show(params) {
      const { moduleId, names } = params;
      const module = usedModulesRecord[moduleId] ?? {};
      const { formName, formUrl, formVersion, objects } = module;

      names && Logger.info('变量', names);
      let editable = true;
      if (names) {
        const [objectName, variableName] = names;
        const targetObject = objects.find((obj) => obj.name === objectName);
        Logger.info('target object', targetObject);
        const targetVariable = (targetObject?.variables ?? []).find((_var) => _var.name === variableName);
        Logger.info('target variable', targetVariable);
        editable = targetVariable?.editable ?? editable;
      }

      Logger.info('组件配置信息', module);
      Logger.info(`formName ${formName}, formVersion ${formVersion}, formUrl ${formUrl}`);
      if (editable && formName && formUrl && formVersion) {
        setModuleName(moduleId);
        setNames(names);
        setOpen(true);
      }
    },
    hide() {
      setOpen(false);
    },
  }));

  useEffect(() => {
    const onSubmitStart = () => setLoading(true);
    const onSubmitSuccessed = () => {
      setLoading(false);
      setOpen(false);
    };
    const onSubmitFailed = () => setLoading(false);

    slateEditor.ET.addEventListener('onSubmitStart', onSubmitStart);
    slateEditor.ET.addEventListener('onSubmitSuccessed', onSubmitSuccessed);
    slateEditor.ET.addEventListener('onSubmitFailed', onSubmitFailed);

    return () => {
      slateEditor.ET.removeEventListener('onSubmitStart', onSubmitStart);
      slateEditor.ET.removeEventListener('onSubmitSuccessed', onSubmitSuccessed);
      slateEditor.ET.removeEventListener('onSubmitFailed', onSubmitFailed);
    };
  }, [slateEditor.ET]);

  return (
    <Drawer
      open={open}
      visible={open}
      destroyOnClose
      onClose={() => setOpen(false)}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              slateEditor.ET.dispatchEvent(new CustomEvent('onSubmit'));
            }}
          >
            提交
          </Button>
        </Space>
      }
    >
      <DatasManager moduleId={moduleId!} names={names} />
    </Drawer>
  );
});

const useDatasManageDrawer = () => {
  const ref = useRef<any>();
  const Drawer: React.FC = useCallback(() => <DatasManageDrawer ref={ref} />, []);
  const show = useCallback((...args: any[]) => ref.current?.show?.(...args), []);
  const hide = useCallback(() => ref.current?.hide?.(), []);

  return [Drawer, show, hide] as [React.FC, (params: { moduleId: BaseModule['id']; names?: [BaseObject['name'], Variable['name']] }) => void, () => void];
};

export { useDatasManageDrawer };

export default DatasManageDrawer;
