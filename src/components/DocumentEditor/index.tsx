import React, { useEffect } from 'react';
import BaseEditor from '../../components/BaseEditor';
import { useDatasStore, useDetail } from '../../hooks';
import type { BaseModule, DocumentEditor, DocumentEditorProps } from '../../types';
import { WrappedEditorContext } from '..';
import createValidate from './validate';

const NO_MODULES: BaseModule[] = [];
const NO_DATAS: DocumentEditorProps['datas'] = {};

const Editor: React.FC<DocumentEditorProps> = (props) => {
  const { editor, detail: { content = '', modules: usedModules = NO_MODULES } = {}, datas = NO_DATAS, modules = NO_MODULES } = props;

  const datasStore = useDatasStore(usedModules, datas);
  const { slateEditorChildren, usedModulesRecord, usedObjectsRecord } = useDetail(usedModules, content);

  useEffect(() => {
    if (editor) {
      editor.validate_ = createValidate(usedModulesRecord, datasStore, editor).bind(editor);
      editor.getDatas = () => {
        const datas: Record<string, any> = {};
        const objectNames = datasStore.getAll().data;
        objectNames.forEach((objectName) => (datas[objectName] = datasStore.get(objectName)?.data));
        return datas;
      };
      editor.addObjectData = (objectName, data) => {
        datasStore.add(objectName, data);
      };
    }
  }, [datasStore, editor, usedModules, usedModulesRecord]);

  return (
    <WrappedEditorContext.Provider
      value={{
        usedModulesRecord,
        usedObjectsRecord,
        slateEditorChildren,
        datasStore,
        modules,
      }}
    >
      <BaseEditor {...props} editor={props.editor} editorType="document" />
    </WrappedEditorContext.Provider>
  );
};

(Editor as DocumentEditor).useEditor = BaseEditor.useEditor;
(Editor as DocumentEditor).useEditorInstance = BaseEditor.useEditorInstance;

export default Editor as DocumentEditor;
