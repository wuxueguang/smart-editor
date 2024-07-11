import React, { useState, useEffect, useCallback } from 'react';
import { DocumentEditor, EditorInstance, TemplateEditor } from '../../types';
import classNames from 'classnames';
import './styles.less';

const Catalog: React.FC<{
  editor: ReturnType<TemplateEditor['useEditorInstance'] | DocumentEditor['useEditorInstance']>;
  style?: React.CSSProperties;
}> = ({ editor, style = { maxHeight: 680 } }) => {
  const slateEditor = (editor as EditorInstance).getSlateEditor();
  const gatherHeadings = useCallback((): any[] => slateEditor.children.filter((item: any) => item.type === 'heading-three'), [slateEditor.children]);

  const [elements, setElement] = useState<any[]>(gatherHeadings());

  const [activeUid, setActiveUid] = useState<string>();

  useEffect(() => {
    const handle = () => {
      setElement(gatherHeadings());
    };

    slateEditor.ET.addEventListener('onSlateEditorChange', handle);

    return () => slateEditor.ET.removeEventListener('onSlateEditorChange', handle);
  }, [gatherHeadings, slateEditor.ET]);

  useEffect(() => {
    const handle = ({ detail: { activedCatalogId } }: any) => {
      setActiveUid(activedCatalogId as string);
    };
    slateEditor.ET.addEventListener('activedCatalogChanged', handle);

    return () => slateEditor.ET.removeEventListener('activedCatalogChanged', handle);
  }, [slateEditor.ET]);

  return (
    <div style={style} className={classNames('smart-editor-catalog-container')}>
      {elements.map(({ children, uid }) => (
        <div key={uid} className={classNames('heading-container')}>
          <a title={children[0].text} onClick={() => setActiveUid(uid as string)} href={`#${uid}`} className={classNames('inner-container', { active: activeUid === uid })}>
            <div className={classNames('heading', 'omit')}>
              <span title={children[0].text}>{children[0].text}</span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};

export default Catalog;
