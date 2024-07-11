/* eslint-disable complexity */

import { BaseModule, BaseObject, Variable, WorkMode } from '../../types';
import { Element, Path, Transforms, Point, Text, DataModelElement, TextUnit, SlateElement } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { v4 as uuid } from 'uuid';

import Utils from '../utils';
import { Logger } from '../../utils';
import { EditorInstance } from '../../types';
import { isHeading } from '../../components/ToolBar/functions';
import { DATA_MODEL_CONTAINER } from '../consts';
import { CONTENT_CONTAINER_OF_MULTI_ROWS_BLOCK, HEAD_EDGE_OF_MULTI_ROWS_BLOCK, MULTI_ROWS_BLOCK, TAIL_EDGE_OF_MULTI_ROWS_BLOCK } from '../elements/MultiRowsBlock/consts';
import { CAN_NOT_EDIT_IN_SELECT_MODE } from '../elements/tips';

import createDeleteBackward from './deleteBackward';
import createDeleteForward from './deleteForward';
import createDeleteFragment from './deleteFragment';

export type DetailChangeHandle = (params: ReturnType<EditorInstance['getDetail']>) => void;
export type FormSubmitHandle = (
  partialDatas: Record<BaseObject['name'], Record<Variable['name'], any>>,
  datas: Record<BaseObject['name'], Record<Variable['name'], any>>,
  module: BaseModule,
) => Promise<void>;
export type SelectionConfirmHandle = (fragment: SlateElement[]) => void;

export interface CustomizedEditor extends ReactEditor {
  ET: EventTarget;

  workMode: WorkMode;

  editorInstance: EditorInstance;

  /** 富文本结构中用到的组件，用以对element做判断 */
  usedModules: Record<BaseModule['id'], BaseModule>;

  justInserted: boolean;

  handles: {
    onDetailChange?: DetailChangeHandle;
    onFormSubmit?: FormSubmitHandle;
    onSelectionConfirm?: SelectionConfirmHandle;
  };

  intersectionObserver: IntersectionObserver;
  catalogLocationRecord: Record<string, boolean>;

  bind: (
    params:
      | {
          eventName: 'onDetailChange';
          handle: DetailChangeHandle;
        }
      | {
          eventName: 'onFormSubmit';
          handle: FormSubmitHandle;
        }
      | {
        eventName: 'onSelectionConfirm';
        handle: SelectionConfirmHandle;
      },
  ) => void;

  tellMethod: (methodName: string, ...rest: any[]) => void;

  canNotEdit: () => boolean;

  isInDataModel: () => boolean;
  isInDataModelHead: () => boolean;
  isInDataModelTail: () => boolean;

  isInMultiRowsBlock: () => boolean;
  isInMultiRowsBlockHead: () => boolean;
  isInMultiRowsBlockTail: () => boolean;

  getElement: (path: Path) => Element | undefined;

  isEmptyElement: (element: Element) => boolean;

  isEmptyBlock: () => boolean;
  isInEmptyBlock: CustomizedEditor['isEmptyBlock'];

  isInBlockElementHead: () => boolean;
  isInBlockElementTail: () => boolean;

  getPrevBlockElement: () => Element | undefined;
  getNextBlockElement: () => Element | undefined;

  getPrevSiblingElement: (path: Path) => Element | undefined;
  getNextSiblingElement: (path: Path) => Element | undefined;

  getBlockElementHeadPoint: (path: Path) => Point | undefined;
  getBlockElementTailPoint: (path: Path) => Point | undefined;

  fragmentHas: (filter: (node: SlateElement) => boolean) => boolean;
  fragmentHasDataModel: () => boolean;

  /* 光标模式下调用，判断当前所在行的前一行是否为空行 */
  isPrevBlockElementEmpty: () => boolean;

  /* 光标模式下调用，判断当前所在行的下一行是否为空行 */
  isNextBlockElementEmpty: () => boolean;
}

export const withDataModel = (editor: CustomizedEditor): CustomizedEditor => {
  const { insertText, deleteForward, deleteBackward, deleteFragment, insertBreak, insertFragment, insertNode, isInline, isBlock, isVoid, onChange } = withReact(editor);

  editor.ET = new EventTarget();

  editor.handles = {};

  editor.usedModules = {};

  editor.justInserted = false;

  editor.canNotEdit = () => {
    if (['select'].includes(editor.workMode)) {
      Logger.info(CAN_NOT_EDIT_IN_SELECT_MODE);
      return true;
    }
    return false;
  };

  editor.tellMethod = (methodName, ...rest) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Logger.info(`----------------> ${methodName} <----------------`, ...rest);
  };

  /* 从前往后删 */
  editor.deleteForward = createDeleteForward(deleteForward, editor);

  /* 从后往前删 */
  editor.deleteBackward = createDeleteBackward(deleteBackward, editor);

  /* 选中区域删除 */
  editor.deleteFragment = createDeleteFragment(deleteFragment, editor);

  editor.insertBreak = () => {
    editor.tellMethod('insertBreak');

    if (
      editor.canNotEdit() ||
      Utils.uneditable(editor)
    ) {
      return;
    }

    const range = JSON.parse(JSON.stringify(editor.selection));

    if (editor.isInDataModelHead() || editor.isInMultiRowsBlockHead()) {
      Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as Element, {
        at: [range.anchor.path[0]],
      });
      Transforms.select(editor, [range.anchor.path[0]]);

      return;
    }

    if (editor.isInDataModelTail() || editor.isInMultiRowsBlockTail()) {
      Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as Element, {
        at: [range.anchor.path[0] + 1],
      });
      Transforms.select(editor, [range.anchor.path[0] + 1]);

      return;
    }

    if (editor.canNotEdit()) {
      return;
    }

    insertBreak();
    if (isHeading(editor)) {
      Transforms.setNodes(editor, {
        type: 'paragraph',
        uid: undefined,
      } as unknown as Element);
    }
  };

  editor.insertSoftBreak = () => {
    editor.tellMethod('insertSoftBreak');

    if (editor.canNotEdit()) {
      return;
    }

    if (
      Utils.uneditable(editor) ||
      editor.isInDataModelHead() ||
      editor.isInDataModelTail() ||
      editor.isInMultiRowsBlockHead() ||
      editor.isInMultiRowsBlockTail()
    ) {
      Logger.info('insertSoftBreak denied');
      return;
    }
    Logger.info('insertSoftBreak');
    editor.insertText('\n');
  };

  editor.insertFragment = (fragment) => {
    editor.tellMethod('insertFragment', fragment);

    if (editor.canNotEdit() || Utils.uneditable(editor)) {
      return;
    }

    if (
      editor.isInDataModelHead() ||
      editor.isInDataModelTail() ||
      editor.isInMultiRowsBlock() ||
      editor. isInMultiRowsBlockHead() ||
      editor.isInMultiRowsBlockTail()
    ) {
      Logger.info('insertFragment', '不可编辑');
      return;
    }

    fragment?.forEach((item) => {
      if ((item as SlateElement).uid) {
        (item as SlateElement).uid = uuid();
      }
    });
    insertFragment(fragment);
  };

  editor.insertNode = (node) => {
    editor.tellMethod('insertNode');

    if (editor.canNotEdit() || Utils.uneditable(editor)) {
      return;
    }

    if (
      editor.isInDataModelHead() ||
      editor.isInDataModelTail() ||
      editor.isInMultiRowsBlockHead() ||
      editor.isInMultiRowsBlockTail()
    ) {
      return;
    }
    Logger.info('insertNode', node);
    insertNode(node);
  };

  editor.insertText = (text: string) => {
    editor.tellMethod('insertText');

    if (editor.canNotEdit() || Utils.uneditable(editor)) {
      Promise.resolve().then(() => {
        (editor as unknown as HistoryEditor).undo();
      });
    }

    // 很麻烦啊！直接输入，复制粘贴
    if (
      editor.isInDataModelHead() ||
      editor.isInDataModelTail() ||
      editor.isInMultiRowsBlockHead() ||
      editor.isInMultiRowsBlockTail()
    ) {
      Promise.resolve().then(() => {
        Logger.info('insertText', '不可编辑，撤销插入 Text');
        (editor as unknown as HistoryEditor).undo();
      });
    }

    Logger.info('insertText', text);
    insertText(text);
  };

  editor.isBlock = (element) => {
    if ([MULTI_ROWS_BLOCK].includes(element.type ?? '')) {
      return true;
    }

    if ([
      HEAD_EDGE_OF_MULTI_ROWS_BLOCK,
      TAIL_EDGE_OF_MULTI_ROWS_BLOCK,
      CONTENT_CONTAINER_OF_MULTI_ROWS_BLOCK,
    ].includes(element.type ?? '')) {
      return true;
    }

    return isBlock(element);
  };

  editor.isInline = (element) => {
    const { dataModel, moduleId } = element as DataModelElement;
    const module = editor.usedModules[moduleId];

    if (dataModel) {
      return module ? Utils.isVariable(element) || module.displayType === 'inline' : false;
    }

    return isInline(element);
  };

  editor.isVoid = (element) => {
    const dataModel: boolean = (element as DataModelElement).dataModel;
    return dataModel || isVoid(element);
  };

  editor.onChange = (...args) => {
    const detail = editor.editorInstance?.getDetail();
    editor.handles.onDetailChange?.(detail);
    editor.ET.dispatchEvent(new CustomEvent('onSlateEditorChange'));
    onChange(...args);
  };

  editor.bind = ({ eventName, handle }) => {
    switch (eventName) {
      case 'onDetailChange':
        editor.handles.onDetailChange = handle;
        break;
      case 'onFormSubmit':
        editor.handles.onFormSubmit = handle;
        break;
      case 'onSelectionConfirm':
        editor.handles.onSelectionConfirm = handle;
        break;
      default:
        return;
    }
  };

  editor.isInDataModel = () => {
    const { selection } = editor;
    if (selection && Point.equals(selection.anchor, selection.focus)) {
      const { path } = selection.anchor;
      const element = editor.getElement([path[0]]);
      if (element) {
        return [DATA_MODEL_CONTAINER].includes(element?.type ?? '');
      }
    }
    return false;
  };

  editor.isInDataModelHead = () => {
    const fragment = editor.getFragment();
    const inner = (nodes: any[] = []): boolean => nodes.some((node) => node.type === 'data-model-head' || inner(node.children as any[]));
    return inner(fragment);
  };

  editor.isInDataModelTail = () => {
    const fragment = editor.getFragment();
    const inner = (nodes: any[] = []): boolean => nodes.some((node) => node.type === 'data-model-tail' || inner(node.children as any[]));
    return inner(fragment);
  };

  editor.isInMultiRowsBlock = () => {
    const { selection } = editor;
    if (selection && Point.equals(selection.anchor, selection.focus)) {
      const { path } = selection.anchor;
      const element = editor.getElement([path[0]]);
      if (element) {
        return [MULTI_ROWS_BLOCK].includes(element?.type ?? '');
      }
    }
    return false;
  };

  editor.isInMultiRowsBlockHead = () => {
    const { selection } = editor;
    if (selection && Point.equals(selection.anchor, selection.focus)) {
      const { path } = selection.anchor;
      const element = editor.getElement([path[0], path[1]]);
      if (element) {
        return [HEAD_EDGE_OF_MULTI_ROWS_BLOCK].includes(element?.type ?? '');
      }
    }
    return false;
  };

  editor.isInMultiRowsBlockTail = () => {
    const { selection } = editor;
    if (selection && Point.equals(selection.anchor, selection.focus)) {
      const { path } = selection.anchor;
      const element = editor.getElement([path[0], path[1]]);
      if (element) {
        return [TAIL_EDGE_OF_MULTI_ROWS_BLOCK].includes(element?.type ?? '');
      }
    }
    return false;
  };

  editor.getElement = (path) => {
    if (path[0] < 0) {
      return undefined;
    }

    let current: Element = { children: editor.children };

    path.forEach((n) => {
      current = current.children[n] as Element;
    });

    return current;
  };

  editor.isEmptyElement = (element) => {
    if ((element as any)?.dataModel) {
      return false;
    }

    if (Text.isText(element)) {
      return element.text.length === 0;
    }

    const { children } = element;
    return children?.every((element) => editor.isEmptyElement(element as Element));
  };

  editor.isEmptyBlock = editor.isInEmptyBlock = () => {
    const { selection } = editor;

    if (selection) {
      const { anchor } = selection ;
      const { children } = editor.getElement([(anchor).path[0]] as Path) ?? {};
      return children?.length === 1 && Text.isText(children[0]) && children[0].text.length === 0;
    }
    return false;
  };

  editor.isInBlockElementHead = () => {
    const { selection } = editor;

    if (selection) {
      const { anchor, focus } = selection;
      if (Point.equals(anchor, focus)) {
        return anchor.path[1] === 0 && anchor.offset === 0;
      }
    }
    return false;
  };

  editor.isInBlockElementTail = () => {
    const { selection } = editor;

    if (selection) {
      const { anchor, focus } = selection;
      if (Point.equals(anchor, focus)) {
        const point = editor.getBlockElementTailPoint([(anchor).path[0]]);
        return Point.equals(anchor, point!);
      }
    }

    return false;
  };

  editor.getBlockElementHeadPoint = (path) => {
    const node = editor.getElement(path);
    const point: Point = {
      path: [...path],
      offset: 0,
    };
    function inner(node: any) {
      const length = node?.children?.length;
      if (length) {
        point.path.push(0);
        inner(node.children[0]);
      }
    }

    if (node) {
      inner(node);
      return point;
    }
    return undefined;
  };

  editor.getBlockElementTailPoint = (path) => {
    const node = editor.getElement(path);
    const point: Point = {
      path: [...path],
      offset: 0,
    };
    function inner(node: any) {
      const length = node?.children?.length;
      if (length) {
        point.path.push(length - 1);
        if (node.children[length - 1].text?.length) {
          point.offset = node.children[length - 1].text?.length;
        } else {
          inner(node.children[length - 1]);
        }
      }
    }

    if (node) {
      inner(node);
      return point;
    }
    return undefined;
  };

  /* 获取前一个块节点 */
  editor.getPrevBlockElement = () => {
    const { selection } = editor;
    if (selection) {
      const { anchor } = selection;
      const path = [anchor.path[0] - 1];
      if (path[0] > -1) {
        return editor.getElement(path);
      }
    }
    return undefined;
  };

  /* 获取后一个块节点 */
  editor.getNextBlockElement = () => {
    const { selection } = editor;
    if (selection) {
      const { anchor } = selection;
      const path = [anchor.path[0] + 1];
      if (editor.children.length > path[0]) {
        return editor.getElement(path as Path);
      }
    }
    return undefined;
  };

  /* 获取前一个兄弟节点 */
  editor.getPrevSiblingElement = (path: Path) => {
    if (path?.length) {
      const _path = [...path];
      const last = _path.pop() as number;
      const element = editor.getElement([..._path, last - 1]);

      return element;
    }
    return undefined;
  };

  /* 获取后一个兄弟节点 */
  editor.getNextSiblingElement = (path: Path) => {
    if (path?.length) {
      const _path = [...path];
      const last = _path?.pop() as number;
      const element = editor.getElement([..._path, last + 1]);

      return element;
    }

    return undefined;
  };

  editor.fragmentHas = (filter) => {
    const fragment = editor.getFragment();
    const inner = (nodes: any[] = []): boolean => nodes.some((node) => filter(node as unknown as SlateElement) || inner(node.children as any[]));
    return inner(fragment);
  };

  editor.fragmentHasDataModel = () => {
    void 0;
    return editor.fragmentHas((node) => node.dataModel ?? false);
  };

  /**
   * 光标模式下调用，判断当前所在行的前一行是否为空行
   * 使用前确保存在前一行：当前行非第一行
   * */
  editor.isPrevBlockElementEmpty = () => {
    const { selection } = editor;
    if (selection) {
      const prevBlockNode = editor.getElement([selection.anchor.path[0] - 1]);
      if (prevBlockNode) {
        return Utils.isEmptyBlockElement(prevBlockNode);
      }
    }
    return false;
  };

  /**
   * 光标模式下调用，判断当前所在行的下一行是否为空行
   * 使用前确保存在下一行：当前行非最后一行
   * */
  editor.isNextBlockElementEmpty = () => {
    const { selection } = editor;
    if (selection) {
      const prevBlockNode = editor.getElement([selection.anchor.path[0] + 1]);
      if (prevBlockNode) {
        return Utils.isEmptyBlockElement(prevBlockNode);
      }
    }
    return false;
  };

  return editor;
};
