/* eslint-disable complexity */
import { v4 as uuid } from 'uuid';
import { BaseRange, Editor, Point, Element as SlateElement, Transforms } from 'slate';
import { CustomizedEditor, DATA_MODEL_CONTAINER, DATA_MODEL_HEAD, DATA_MODEL_TAIL } from '../../customized-slate';

export const LIST_TYPES = ['numbered-list', 'bulleted-list'];
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

export const toggleBlock = (editor: Editor, format: string) => {
  const disabled = fragmentHasDataModel(editor as CustomizedEditor);

  if (disabled) {
    return;
  }

  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes((n as any).type) && !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;

  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    } as any;
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    } as any;

    (newProperties as any).uid = uuid();
  }

  // 选择多个行时，不止一个node，造成多个node使用相同的uid，造成error
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (editor: Editor, format: string) => {
  const disabled = fragmentHasDataModel(editor as CustomizedEditor);

  if (disabled) {
    return;
  }

  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const fragmentHasDataModel = (editor: CustomizedEditor): boolean => {
  const { selection } = editor;
  if (!selection) {
    return false;
  }

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection as BaseRange),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && [
        DATA_MODEL_CONTAINER,
        DATA_MODEL_HEAD,
        DATA_MODEL_TAIL,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ].includes((n as any).type),
    }),
  );

  return !!match;
};

export const isBlockActive = (editor: Editor, format: any, blockType = 'type'): boolean => {
  const { selection } = editor;
  if (!selection) {
    return false;
  }

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any)[blockType] === format,
    }),
  );

  return !!match;
};

export const isHeading = (editor: Editor): boolean => {
  const { selection } = editor;
  if (!selection) {
    return false;
  }

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        const flag = !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type?.startsWith?.('heading-');
        return flag;
      },
    }),
  );

  return !!match;
};

export const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? (marks as any)[format] === true : false;
};
