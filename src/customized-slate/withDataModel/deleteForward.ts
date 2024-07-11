/* eslint-disable complexity */
import { CustomizedEditor } from '.';
import { Transforms, Point, BaseEditor, SlateElement } from 'slate';

import { DATA_MODEL_CONTAINER } from '../consts';
import { MULTI_ROWS_BLOCK } from '../elements/MultiRowsBlock/consts';
import slateBugWillEmit from './slateBugWillEmit';
import dataModelWillBeDeleted from './dataModelWillBeDeleted';
import Utils from '../utils';
import { Logger } from '../../utils';

const emptyRow = JSON.stringify({ type: 'paragraph', children: [{ text: '' }] });

export default (originDeleteForward: BaseEditor['deleteForward'], editor: CustomizedEditor) => {

  const newDeleteForward: CustomizedEditor['deleteBackward'] = (unit) => {
    editor.tellMethod('deleteForward');

    const { selection } = editor;

    if (
      !selection ||
      editor.canNotEdit() ||
      Utils.uneditable(editor) ||
      Utils.undeletable(editor) ||
      slateBugWillEmit(editor) ||
      dataModelWillBeDeleted(editor)
    ) {
      return;
    }

    /* 光标模式 */
    if (Point.equals(selection.anchor, selection.focus)) {
      const nextSublingElement = editor.getNextSiblingElement(selection.anchor.path);
      if (
        nextSublingElement?.dataModel &&
        !['edit', 'edit-struct'].includes(editor.workMode) &&
        editor.selection?.anchor.offset === (editor.getElement(selection.anchor.path) as any)?.text?.length
      ) {
        return;
      }

      /**
       * 1、光标在 块组件行 行首，
       *    用空行替换当前 块组件行（执行删除当前 块组件行 操作）；
       *
       * 2、光标在 块组件行 行尾，
       *    下一行为普通行空行，删除次空行；
       *    否则，光标移动到下一行行首；
       *
       * 3、光标在 普通行 行尾，且 下一行 是 块组件行，
       *    光标移动到 下一行 行首；
       *
       * 4、其他；
       */

      /* 1、光标在 块组件行 行首 */
      if (editor.isInDataModelHead() || editor.isInMultiRowsBlockHead()) {
        Logger.info('光标在 块组件行 行首');
        if (['edit', 'edit-struct'].includes(editor.workMode)) {

          /* 删除当前 块组件行 */
          Transforms.removeNodes(editor, { at: [selection.anchor.path[0]] });

          /* 添加一个新的空行 */
          Transforms.insertNodes(editor, JSON.parse(emptyRow) as SlateElement, { at: [selection.anchor.path[0]] });

          /* 光标移动到新添加的空行行首 */
          Transforms.select(editor, [selection.anchor.path[0], 0]);
        }

        return;
      }

      const nextBlockNode = editor.getNextBlockElement();

      /* 2、光标在 块组件行 行尾 */
      if (
        editor.isInDataModelTail() ||
        editor.isInMultiRowsBlockTail() /* ||
        (editor.isInBlockElementTail() && editor.selection?.anchor.path[0] === 0) */
      ) {
        Logger.info('光标在 块组件行 行尾');

        /* 如果下一行是空行，直接删除下一行 */
        if (editor.isEmptyElement(editor.getElement([selection.anchor.path[0] + 1])!)) {
          Transforms.removeNodes(editor, { at: [selection.anchor.path[0] + 1] });
          return;
        }

        /* 光标移动到 下一行 行首 */
        const point = editor.getBlockElementHeadPoint([selection.anchor.path[0] + 1]);
        Transforms.select(editor, { anchor: point!, focus: point! });
        return;
      }

      /* 3、光标在 普通行 行尾，且下一行是 块组件行 */
      if (
        editor.isInBlockElementTail() &&
        [DATA_MODEL_CONTAINER, MULTI_ROWS_BLOCK].includes(nextBlockNode?.type as string)
      ) {
        Logger.info('光标在 普通行 行尾，且下一行是 块组件行');

        /* 当前行是空行，删除当前行 */
        if (editor.isInEmptyBlock()) {
          Logger.info('当前行是空行，删除当前行');
          Transforms.removeNodes(editor, { at: [selection.anchor.path[0]] });

          /* 光标移动到 块组件行 行首 */
          Transforms.select(editor, [selection.anchor.path[0], 0]);
          return;
        }

        /* 光标移动到 块组件行 行首 */
        Transforms.select(editor, [selection.anchor.path[0] + 1, 0]);
        return;
      }
    }

    /* 4、其他 */
    Logger.info('所有其他情况，执行默认的删除操作');
    originDeleteForward(unit);
  };

  return newDeleteForward;
};

