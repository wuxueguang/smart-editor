import React from 'react';
import BaseEditor from '../../components/BaseEditor';
import { BaseModule, EditorInstance, TemplateEditor, TemplateEditorProps } from '../../types';
import { useDatasStore, useDetail } from '../../hooks';
import { WrappedEditorContext } from '..';

const NO_MODULES: BaseModule[] = [];

const TEditor: React.FC<TemplateEditorProps> = (props) => {
  const { workMode, detail: { content = '', modules: usedModules = NO_MODULES } = {}, modules = NO_MODULES } = props;
  const { slateEditorChildren, usedModulesRecord, usedObjectsRecord } = useDetail(usedModules, content);
  const datasStore = useDatasStore(usedModules);

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
      <BaseEditor {...props} workMode={workMode} editor={props.editor as EditorInstance | undefined} editorType="template" />
    </WrappedEditorContext.Provider>
  );
};

(TEditor as TemplateEditor).useEditor = BaseEditor.useEditor;
(TEditor as TemplateEditor).useEditorInstance = BaseEditor.useEditorInstance;

export default TEditor as TemplateEditor;
