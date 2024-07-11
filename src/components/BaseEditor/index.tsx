import React, { useEffect, useMemo, useContext } from 'react';
import ContentEditor from '../ContentEditor';
import DataModelInserter from '../DataModelInserter';
import { ReactEditor, Slate } from 'slate-react';
import { createSlateEditor } from '../../customized-slate';
import { BaseEditor, BaseEditorProps, WorkMode } from '../../types';
import { BaseEditorContext, WrappedEditorContext } from '..';
import { useDatasManageDrawer } from '../DatasManagerDrawer';
import { useEditor, useEditorInstance } from './hooks';
import Toolbar from '../ToolBar';
import { Affix } from 'antd';
import { moduleTrasfer } from '../../utils';

import classNames from 'classnames';
import './styles.less';

const Editor: React.FC<BaseEditorProps> = (props) => {
  const { editor, workMode, topBar = null, style = {}, placeholder } = props;
  const outerContextValue = useContext(WrappedEditorContext);
  const { slateEditorChildren, usedModulesRecord, usedObjectsRecord } = outerContextValue;

  const slateEditor = useMemo(() => editor?.getSlateEditor!() ?? createSlateEditor(), [editor?.getSlateEditor]);

  slateEditor.workMode = workMode;

  const [Drawer, showDatasManageDrawer, _] = useDatasManageDrawer();

  useEffect(() => {
    if (editor) {
      editor.addUsedModule = (module) => {
        const m = moduleTrasfer(module);
        usedModulesRecord[m.id] = m;
        m.objects.forEach((o) => {
          usedObjectsRecord[o.name] = o;
        });
      };

      editor.getUsedModulesRecord = () => {
        void 0;
        return usedModulesRecord;
      };
    }
  }, [editor, usedModulesRecord, usedObjectsRecord]);

  useEffect(() => {
    slateEditor.usedModules = usedModulesRecord ?? slateEditor.usedModules;
  }, [slateEditor, usedModulesRecord]);

  useEffect(() => {
    if ((['edit-struct', 'edit-richText-only'] as WorkMode[]).includes(workMode)) {
      editor?.focus();
    }
  }, [editor, workMode]);

  return (
    <BaseEditorContext.Provider
      value={{
        workMode,
        placeholder,
        showDatasManageDrawer,
        ...outerContextValue,
      }}
    >
      <Slate editor={slateEditor as ReactEditor} initialValue={slateEditorChildren}>
        <div
          style={style}
          className={classNames({
            'smart-editor-container': true,
            'row-flex': ['edit-struct'].includes(workMode),
          })}
        >
          {/* left side */}
          {['edit-struct'].includes(workMode) && (
            <Affix>
              <DataModelInserter />
            </Affix>
          )}

          {/* right side */}
          <div
            className={classNames({
              'bg-white': true,
              'column-flex': true,
              'right-content-container': ['edit-struct'].includes(workMode),
            })}
          >
            {((children) => ['edit-struct', 'edit-richText-only'].includes(workMode) ? (
              <Affix>{children}</Affix>
            ) : children)(
              <div onClick={(e) => e.stopPropagation()}>
                <div className={classNames('topbar-container', 'bg-white')}>
                  {typeof topBar === 'function' ? topBar() : topBar}
                </div>
                {[
                  'edit',
                  'edit-struct',
                  'edit-richText-only',
                ].includes(workMode) ? <Toolbar /> : null}
              </div>
            )}
            <ContentEditor editor={editor!} />
          </div>
        </div>
        <Drawer />
      </Slate>
    </BaseEditorContext.Provider>
  );
};

(Editor as BaseEditor).useEditor = useEditor;
(Editor as BaseEditor).useEditorInstance = useEditorInstance;

export default Editor as unknown as BaseEditor;
