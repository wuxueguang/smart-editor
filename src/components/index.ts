import { createContext } from 'react';
import { Store } from '../hooks';
import { BaseObject, BaseModule, NamePath, WorkMode, Variable } from '../types';
import { CustomizedEditor } from '../customized-slate';
import { Editor } from 'slate';

export interface BaseEditorContextValue {

  /** 当前模板类型下的所有组件 */
  modules: BaseModule[];

  /** 富文本结构 */
  slateEditorChildren: Editor['children'];

  /** 使用到的组件 */
  usedModulesRecord: Record<BaseModule['id'], BaseModule>;

  /** 使用到的对象 */
  usedObjectsRecord: Record<BaseObject['name'], BaseObject>;

  /** 对象数据 */
  datasStore: Store;

  workMode: WorkMode;

  showDatasManageDrawer: (params: { moduleId: BaseModule['id']; names?: [BaseObject['name'], Variable['name']] }) => void;

  placeholder?: string;
}

export const WrappedEditorContext = createContext<Omit<BaseEditorContextValue, 'workMode' | 'showDatasManageDrawer' | 'isFullScreen'>>({} as BaseEditorContextValue);

export const BaseEditorContext = createContext<BaseEditorContextValue>({} as BaseEditorContextValue);

/** 收集插入使用到的对象信息 */
export function gatherUsedModulesInfo(editor: CustomizedEditor) {
  const ret: Record<
    BaseModule['id'],
    {
      allUsed?: boolean;
      namePaths?: Set<NamePath>;
    }
  > = {};

  (function inner(o: any) {
    o.children.forEach((item: any) => {
      if (item.dataModel) {
        const { moduleId } = item;
        ret[moduleId] = {};
      }

      if (item.children) {
        inner(item);
      }
    });
  })(editor);

  return ret;
}
