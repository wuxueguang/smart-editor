/* eslint-disable complexity */
import { CustomizedEditor } from '.';
import type { Range } from 'slate';
import { Point } from 'slate';
import { Logger } from '../../utils';

export default (editor: CustomizedEditor) => {

  const { anchor, focus } = editor.selection as unknown as Range;

  /* 从前向后选中 */
  if (anchor.path[0] - focus.path[0] === -1) {
    const anchorTailPoint = editor.getBlockElementTailPoint([anchor.path[0]]);
    const focusHeadPoint = editor.getBlockElementHeadPoint([focus.path[0]]);
    if (
      anchorTailPoint && Point.equals(anchor, anchorTailPoint) &&
      focusHeadPoint && Point.equals(focus, focusHeadPoint)
    ) {
      Logger.info('slate bug 将被触发，阻止删除操作');
      return true;
    }
  }

  /* 从后向前选中 */
  if (anchor.path[0] - focus.path[0] === 1) {
    const anchorHeadPoint = editor.getBlockElementHeadPoint([anchor.path[0]]);
    const focusTailPoint = editor.getBlockElementTailPoint([focus.path[0]]);
    if (
      anchorHeadPoint && Point.equals(anchor, anchorHeadPoint) &&
      focusTailPoint && Point.equals(focus, focusTailPoint)
    ) {
      Logger.info('slate bug 将被触发，阻止删除操作');
      return true;
    }
  }

  return false;
};
