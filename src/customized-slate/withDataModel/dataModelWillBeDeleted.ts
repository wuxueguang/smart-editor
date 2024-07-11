/* eslint-disable complexity */
import { DataModelElement, SlateElement } from 'slate';
import { CustomizedEditor } from '.';
import { Logger } from '../../utils';

export default (editor: CustomizedEditor) => {

  const fragment = editor.getFragment();
  let isDataModel = false;

  try {
    const { dataModel } = (fragment[0] as SlateElement).children[0] as DataModelElement;

    isDataModel = Boolean(dataModel);
  } catch (err) {
    isDataModel = false;
  }

  if (isDataModel) {
    Logger.info('组件节点必须整体删除', fragment);
  }

  return isDataModel;
};
