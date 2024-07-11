/* eslint-disable complexity */
import { CustomizedEditor } from '.';
import { Transforms, Point, BaseEditor, BasePoint, SlateElement } from 'slate';

import Utils from '../utils';
import { Logger } from '../../utils';
import { DATA_MODEL_CONTAINER } from '../consts';
import { MULTI_ROWS_BLOCK } from '../elements/MultiRowsBlock/consts';
import slateBugWillEmit from './slateBugWillEmit';
import dataModelWillBeDeleted from './dataModelWillBeDeleted';

const emptyRow = JSON.stringify({ type: 'paragraph', children: [{ text: '' }] });

export default (originDeleteBackward: BaseEditor['deleteBackward'], editor: CustomizedEditor) => {

  const newDeleteBackward: CustomizedEditor['deleteBackward'] = (unit) => {
    editor.tellMethod('deleteForward', unit);

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
      const prevSublingElement = editor.getPrevSiblingElement(selection.anchor.path);

      if (
        prevSublingElement?.dataModel &&
        !['edit', 'edit-struct'].includes(editor.workMode) &&
        editor.selection?.anchor.offset === 0
      ) {
        return;
      }

      /**
       * 1、光标在 块组件行 行尾，
       *    edit edit-struct 模式下，执行删除当前 块组件行 操作；
       *    其他模式下，阻止删除；
       *
       * 2、光标在 块组件行 行首，
       *    当前行为第一行，阻止删除；
       *    前一行为空行，删除前此空行；
       *    前一行非空，光标移动到 前一行 行尾；
       *
       * 3、光标在 普通行 行首，且 前一行 是 块组件行，
       *    光标移动到 前一行 行尾；
       * 4、其他；
       **/

      /* 1、光标处于 块组件行 行尾 */
      if (editor.isInDataModelTail() || editor.isInMultiRowsBlockTail()) {
        if (['edit', 'edit-struct'].includes(editor.workMode)) {

          /* 删除当前 块组件行 */
          Transforms.removeNodes(editor, { at: [selection.anchor.path[0]] });

          /* 添加一个新的空行 */
          Transforms.insertNodes(editor, JSON.parse(emptyRow) as SlateElement, { at: [selection.anchor.path[0]] });

          /* 光标移动到新添加的空行行首 */
          Transforms.select(editor, [selection.anchor.path[0], 0]);
        }

        /* 其他工作模式下，阻止删除操作 */
        return;
      }

      const prevBlockNode = editor.getPrevBlockElement();

      /* 2、 光标在 块组件行 行首 */
      if (editor.isInDataModelHead() || editor.isInMultiRowsBlockHead()) {
        Logger.info('光标在 块组件行 行首');

        /* 当前行为第一行 */
        if (!prevBlockNode) {return;}

        /* 前一行是 块组件行 */
        if ([
          MULTI_ROWS_BLOCK,
          DATA_MODEL_CONTAINER,
        ].includes(prevBlockNode?.type as string)) {
          Logger.info('前一行是 块组件行');

          /* 将光标移动到 块组件行 行尾 */
          Transforms.select(editor, [selection.anchor.path[0] - 1, 2, 0]);
          return;
        }

        /* 前一行是普通行 */
        const point = editor.getBlockElementTailPoint([selection.anchor.path[0] - 1]);

        /* 前一行是 普通行 空行，删除前一行 */
        if (editor.isPrevBlockElementEmpty()) {
          Logger.info('前一行是普通行 空行，删除前一行');
          Transforms.removeNodes(editor, { at: [selection.anchor.path[0] - 1] });
          return;
        }

        /* 前一行是 普通行 非空行，将光标移动到前一行行尾 */
        Logger.info('前一行是普通行 非空行，将光标移动到前一行行尾');
        Transforms.select(editor, { anchor: point, focus: point } as unknown as BasePoint);
        return;
      }

      /* 3、光标在 普通行 行首，且前一行是 块组件行 */
      Logger.info('光标在 普通行 行首，且 前一行是 块组件行 ');
      if (
        editor.isInBlockElementHead() &&
        [DATA_MODEL_CONTAINER, MULTI_ROWS_BLOCK].includes(prevBlockNode?.type as string)
      ) {

        /* 当前行为 普通行 空行，删除所在当前行 */
        if (editor.isInEmptyBlock()) {
          Logger.info('当前行为 普通行 空行，删除所在当前行');
          Transforms.removeNodes(editor, { at: [selection.anchor.path[0]] });
        }

        /* 将光标移动到前一 块组件行 行尾 */
        Logger.info('将光标移动到前一 块组件行 行尾');
        const point = editor.getBlockElementTailPoint([selection.anchor.path[0] - 1]);
        Transforms.select(editor, { anchor: point, focus: point } as unknown as BasePoint);
        return;
      }
    }

    /* 4、其他 */
    Logger.info('所有其他情况，执行默认的删除操作');
    originDeleteBackward(unit);
  };

  return newDeleteBackward;
};

