/* eslint-disable complexity */
import React, { useRef, useEffect, PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';
import { useSlate, useFocused } from 'slate-react';
import { Editor, Range } from 'slate';
import classNames from 'classnames';
import './styles.less';
import { EditorInstance } from 'src/types';

const Portal: React.FC<PropsWithChildren> = ({ children }) => {
  void 0;
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

const HoveringToolbar: React.FC<{ editor: EditorInstance }> = (props) => {
  const { editor } = props;
  const ref = useRef<HTMLDivElement>();
  const slateEditor = useSlate();
  const inFocus = useFocused();

  useEffect(() => {
    const el = ref.current;
    const { selection } = slateEditor;

    if (!el) {
      return;
    }

    const hasDatamodel = editor.getSlateEditor().fragmentHasDataModel();

    if (
      (window.getSelection()?.toString().length ?? 0 < 1) ||
      !hasDatamodel && (
        !selection ||
        !inFocus ||
        Range.isCollapsed(selection) ||
        Editor.string(slateEditor, selection) === ''
      )
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection!.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    el.style.opacity = '1';
    el.style.top = `${rect.top - 30}px`;
    el.style.left = `${rect.left}px`;
  });

  return (
    <Portal>
      <div
        ref={ref as any}
        className={classNames('hover-toolbar-container')}
      >
        <a
          onClick={() => {
            editor.getSlateEditor().handles?.onSelectionConfirm?.(slateEditor.getFragment());
          }}
        >添加到补充协议</a>
      </div>
    </Portal>
  );
};

export default HoveringToolbar;
