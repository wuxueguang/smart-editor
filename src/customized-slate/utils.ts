import { Editor, Path, Text, Descendant, BaseElement, SlateElement } from 'slate';
import { CustomizedEditor } from './withDataModel';
import { Logger } from '../utils';
import { MULTI_ROWS_BLOCK } from './elements/MultiRowsBlock/consts';
import { DATA_MODEL_CONTAINER } from './consts';

const Utils = {
  isDataModel: (element: any) => Boolean(element.dataModel),

  isVariable: (element: any) => Utils.isDataModel(element) && element.type === 'variable',

  xable(editor: Editor, abilityName: string): boolean {
    const fragment = editor.getFragment();
    const inner = (nodes: any[] = []): boolean => nodes.some((node) => node[abilityName] || inner(node.children as any[]));
    const xable = inner(fragment);
    return xable;
  },

  uneditable(editor: Editor): boolean {
    if (this.xable(editor, 'uneditable')) {
      Logger.info('不可编辑的节点');
      return true;
    }
    return false;
  },

  undeletable(editor: CustomizedEditor) {
    if (this.xable(editor, 'undeletable')) {
      Logger.info('不可删除的节点');
      return true;
    }
    return false;
  },

  getDescendant(editor: Editor, path: Path): Descendant {
    const [first, ...restPath] = path;
    let descendant: Descendant = editor.children[first];

    restPath.forEach((idx) => {
      descendant = (descendant as BaseElement).children[idx];
    });

    return descendant;
  },

  hasDataModel(editor: Editor) {
    const fragment = editor.getFragment();
    const inner = (nodes: any[] = []): boolean => nodes.some((node) => node.type === 'data-model' || inner(node.children as any[]));
    const xable = inner(fragment);
    return xable;
  },

  isEmptyBlockElement(element: SlateElement) {
    try {
      const { children } = element;
      return children.length === 1 && Text.isText(children[0]) && children[0].text.length === 0;
    } catch (err) {
      return false;
    }
  },

  isSpecialBlockElement(element: SlateElement) {
    return [
      'data-model',
      MULTI_ROWS_BLOCK,
      DATA_MODEL_CONTAINER,
    ].includes(element.type!);
  },
};

export default Utils;

export { Utils };
