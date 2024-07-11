import React, { useEffect, useContext } from 'react';
import { SlateElement } from 'slate';
import { Editable, useSlate } from 'slate-react';
import { BaseEditorContext } from '..';
import * as Logger from '../../utils/logger';

import classNames from 'classnames';
// @ts-ignore
import './styles.less';
import { CustomizedEditor, renderElement, renderLeaf } from '../../customized-slate';
import { EditorInstance, WorkMode } from '../../types';
import HoveringToolbar from './HoveringToolbar';
import dataModelWillBeDeleted from '../../customized-slate/withDataModel/dataModelWillBeDeleted';

const ContentEditor: React.FC<{ editor: EditorInstance; }> = (props) => {
  const { editor } = props;
  const slateEditor = useSlate() as CustomizedEditor;
  const { workMode, placeholder = '从此处开始输入...' } = useContext(BaseEditorContext);

  const isEditStruct = workMode === 'edit-struct';
  const previewMode = workMode === 'preview';

  useEffect(() => {

    slateEditor.catalogLocationRecord = {};

    slateEditor.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((item) => {
        slateEditor.catalogLocationRecord[item.target.id] = item.intersectionRatio > 0;
      });

      const actived = slateEditor.children
        .filter((item) => (item as SlateElement).type === 'heading-three')
        .filter((item) => slateEditor.catalogLocationRecord[(item as unknown as any).uid])
        .map((item) => (item as unknown as any).uid);

      if (actived.length) {
        slateEditor.ET.dispatchEvent(new CustomEvent('activedCatalogChanged', { detail: { activedCatalogId: actived[0] }}));
      }

      Logger.info('当前激活态目录uid', actived);
    });
  }, [slateEditor]);

  return (
    <div
      id="editable-container"
      onClick={() => {
        if ((['edit-struct', 'edit-richText-only'] as WorkMode[]).includes(workMode)) {
          editor.focus();
          slateEditor.ET.dispatchEvent(new CustomEvent('onSlateElementClick', { detail: '' }));
        }
      }}
      className={classNames({
        'smart-editor-editable-container': true,
        'edit-struct-mode': isEditStruct,
      })}
    >
      <div style={{ padding: '8px 16px' }} onClick={(e) => e.stopPropagation()}>
        {['select'].includes(workMode) && <HoveringToolbar editor={editor} />}
        <Editable
          autoFocus
          style={{
            boxSizing: 'border-box',
          }}
          readOnly={['preview', 'edit-content'].includes(workMode)}
          placeholder={previewMode ? '暂无内容' : placeholder}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            // 判断是否按下了 Ctrl（或 Command 在 macOS 上）
            const isCtrlPressed = event.ctrlKey || event.metaKey;

            // 判断按键是否为 "C"（复制）
            // if (isCtrlPressed && event.key === 'c') {
            //   console.log('用户按下了复制快捷键');
            // }

            // 判断按键是否为 "X"（剪切）
            if (
              isCtrlPressed &&
              event.key === 'x' &&
              dataModelWillBeDeleted(slateEditor)
            ) {
              event.preventDefault();
            }

            // 判断按键是否为 "V"（粘贴）
            // if (isCtrlPressed && event.key === 'v') {
            //   console.log('用户按下了粘贴快捷键');
            // }
            // console.log(event.key, event.altKey, event.keyCode);
            // for (const hotkey in HOTKEYS) {
            //   if (isHotkey(hotkey, event as any)) {
            //     event.preventDefault();
            //     const mark = HOTKEYS[hotkey];
            //   }
            // }
          }}
        />
      </div>
    </div>
  );
};

export default ContentEditor;
