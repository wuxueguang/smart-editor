import React from 'react';

import classNames from 'classnames';
// @ts-ignore
import './styles.less';
import { useSlate } from 'slate-react';
import { CustomizedEditor } from '../../../customized-slate';

// eslint-disable-next-line complexity
const Element: React.FC = (props: any) => {
  const { attributes, children, element } = props;

  const slateEditor = useSlate() as CustomizedEditor;

  const style = { textAlign: element.align };

  switch (element.type) {
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'heading-three':
      setTimeout(() => {
        const h2 = document.getElementById(element.uid as string) as HTMLHeadElement;

        if (h2) {
          slateEditor.intersectionObserver.observe(h2);
        }
      });
      return (
        <h3 id={element.uid} style={style} {...attributes}>
          {children}
        </h3>
      );
    case 'heading-four':
      return (
        <h4 style={style} {...attributes}>
          {children}
        </h4>
      );
    case 'heading-five':
      return (
        <h5 style={style} {...attributes}>
          {children}
        </h5>
      );
    case 'heading-six':
      return (
        <h6 style={style} {...attributes}>
          {children}
        </h6>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    case 'paragraph':
      return (
        <div className={classNames('paragraph')} style={style} {...attributes}>
          {children}
        </div>
      );
    default:
      return null;
  }
};

export default Element;
