import { CustomizedEditor } from '.';
import { BaseEditor } from 'slate';
import Utils from '../utils';
import { Logger } from '../../utils';
import { MULTI_ROWS_BLOCK } from '../elements/MultiRowsBlock/consts';
import slateBugWillEmit from './slateBugWillEmit';

export default (deleteFragment: BaseEditor['deleteFragment'], editor: CustomizedEditor) => {

  const newDeleteFragment: CustomizedEditor['deleteFragment'] = (fragment) => {
    editor.tellMethod('deleteFragment');

    if (
      editor.canNotEdit() ||
      Utils.uneditable(editor) ||
      Utils.undeletable(editor)
    ) {
      return;
    }

    const framentHasMultiRowsBlock = editor.fragmentHas((node) => [MULTI_ROWS_BLOCK].includes(node.type ?? ''));
    if (framentHasMultiRowsBlock) {
      Logger.info('MultiRowsBlock 只能单独删除');
      return;
    }

    if (slateBugWillEmit(editor)) {
      return;
    }

    /* edit-richtText-only 模式下，不能删除组件节点 */
    if (['edit-richText-only'].includes(editor.workMode) && editor.fragmentHasDataModel()) {
      Logger.info('edit-richtText-only 模式下，不能删除组件节点');
      return;
    }

    Logger.info('deleteFragment', editor.getFragment());
    deleteFragment(fragment);
  };

  return newDeleteFragment;
};
