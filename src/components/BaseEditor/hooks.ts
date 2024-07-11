import { useMemo } from 'react';
import { ReactEditor } from 'slate-react';

import { EditorInstance } from '../../types';
import { gatherUsedModulesInfo } from '..';
import { createSlateEditor } from '../../customized-slate';
import { Transforms } from 'slate';

export const useEditorInstance = (): EditorInstance => {
  const instance = useMemo(() => {
    const slateEditor = createSlateEditor();
    const editorInstance: EditorInstance = {
      getDetail() {
        return {
          moduleIds: Object.keys(gatherUsedModulesInfo(slateEditor)),
          content: slateEditor.children,
        };
      },
      onDetailChange(handle) {
        this.getSlateEditor().bind({
          eventName: 'onDetailChange',
          handle,
        });
      },
      onFormSubmit(handle) {
        this.getSlateEditor().bind({
          eventName: 'onFormSubmit',
          handle,
        });
      },
      onSelectionConfirm(handle) {
        this.getSlateEditor().bind({
          eventName: 'onSelectionConfirm',
          handle,
        });
      },
      getSlateEditor() {
        return slateEditor;
      },
      focus() {
        ReactEditor.deselect(slateEditor);
        const tailPoint = slateEditor.getBlockElementTailPoint([slateEditor.children.length - 1]);
        Transforms.select(slateEditor as ReactEditor, tailPoint!);
        ReactEditor.focus(slateEditor);
      },
      isFocused() {
        return ReactEditor.isFocused(slateEditor);
      },
      validate_() {
        console.warn('在 smart editor 实例化之前调用了 validate_ 方法，会始终返回 true ');
        return true;
      },
      getDatas() {
        return {};
      },
      getUsedModulesRecord() {
        return {};
      },
      addObjectData(objectName, data) {
        void objectName ?? data;
        console.warn('请在 smart editor 实例化之后调用');
      },
      addUsedModule(module) {
        void module;
        console.warn('请在 smart editor 实例化之后调用');
      },
    };

    slateEditor.editorInstance = editorInstance;

    return editorInstance;
  }, []);
  return instance as unknown as EditorInstance;
};

export const useEditor = (): [EditorInstance] => [useEditorInstance()];
