import { useMemo } from 'react';
import { observe, Observed } from '../utils/lota';
import { ObjectData, BaseObject, BaseModule } from '../types';
import { gatherUsedModulesInfo } from '../components';
import { CustomizedEditor, DATA_MODEL_CONTAINER } from '../customized-slate';
import { modulesTrasfer } from '../utils/transfers';
import { typeOf, Logger } from '../utils';
import makeDataByObject from '../utils/makeDataByObject';
import { SlateElement } from 'slate';
import { v4 as uuid } from 'uuid';

interface UseDetailReturn {
  slateEditorChildren: CustomizedEditor['children'];
  usedModulesRecord: Record<BaseModule['id'], BaseModule>;
  usedObjectsRecord: Record<BaseObject['name'], BaseObject>;
}

export const useDetail = (usedModules: BaseModule[], content: string): UseDetailReturn => {
  const slateEditorChildren = useMemo(() => {

    try {
      Logger.info('新的 children(content)', JSON.parse(content));
    } catch (err) {
      Logger.info('无效的 content', (err as Error).message);
    }

    if (Boolean(content)) {
      try {
        const children = JSON.parse(content);
        if (Array.isArray(children)) {
          children.forEach((element: SlateElement) => {

            /* 处理标题有遗留相同uid问题 */
            if (element.type === 'heading-three') {
              element.uid = uuid();
            }

            if ([DATA_MODEL_CONTAINER, 'data-model'].includes(element.type ?? '')) {

              /* 修改遗留的错误type值 data-model 为 data-model-cotainer */
              element.type = DATA_MODEL_CONTAINER;

              /* 为块组件行删除按钮功能实现使用 */
              (element.children[1] as SlateElement).uid = uuid();
            }
          });

          return children;
        }
      } catch (err) {
        Logger.warn('无效的 content');
      }
    }

    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }, [content]);

  const gatheredInfo = useMemo(
    function () {
      return gatherUsedModulesInfo({ children: slateEditorChildren } as CustomizedEditor);
    },
    [slateEditorChildren],
  );

  const { usedModulesRecord, usedObjectsRecord } = useMemo(() => {
    const usedObjectsRecord: Record<BaseObject['name'], BaseObject> = {};
    const usedModulesRecord = modulesTrasfer(Array.isArray(usedModules) ? usedModules : []).reduce((record, module) => {
      record[module.id] = module;
      module.objects.forEach((object) => {
        usedObjectsRecord[object.name] = object;
      });
      return record;
    }, {} as Record<BaseModule['id'], BaseModule>);

    Logger.info('新的 usedModules', Object.values(usedModulesRecord));

    return { usedModulesRecord, usedObjectsRecord };
  }, [usedModules]);

  const idsNotExistedInUsedModules = Object.keys(gatheredInfo).filter((moduleId: string) => !Boolean(usedModulesRecord[moduleId]));

  if (idsNotExistedInUsedModules.length) {
    console.error(`%cTemplateEditor 或 DocumentEditor 的参数 'detail.modules' 中缺少组件信息，组件id为：${idsNotExistedInUsedModules.join('、')}`, 'font-size:24px;font-weight:800;');
  }

  return { slateEditorChildren, usedModulesRecord, usedObjectsRecord };
};

export interface Store {
  getAll: () => Observed<Array<BaseObject['name']>>;
  get: (objectName: BaseObject['name']) => Observed<ObjectData>;
  add: (objectName: BaseObject['name'], data: ObjectData) => boolean;
  delete: (objectName: BaseObject['name']) => void;
}
export type DatasRecord = Record<BaseObject['name'], Observed<ObjectData>>;

export const useDatasStore = (usedModules: BaseModule[] = [], datas?: Record<BaseObject['name'], any>): Store => {
  const observedObjectNames = useMemo<ReturnType<Store['getAll']>>(() => observe<Array<BaseObject['name']>>([]), []);

  modulesTrasfer(usedModules).forEach(({ objects }) => {
    objects.forEach((object) => {
      const { name: objectName } = object;
      if (datas) {
        datas[objectName] = ['object', 'array'].includes(typeOf(datas[objectName])) ? datas[objectName] : makeDataByObject(object);
      }
    });
  });

  const observedDatasRecord = useMemo<DatasRecord>(() => {
    Logger.info('新的 datas', datas);
    const recordDatasRecord = Object.entries(datas ?? {}).reduce((datasRecord, [objectName, data]) => {
      datasRecord[objectName] = observe(data as ObjectData);
      observedObjectNames.updateWithImmer((draft) => {
        draft.push(objectName);
      });
      return datasRecord;
    }, {} as any);
    return recordDatasRecord;
  }, [datas, observedObjectNames]);

  return {
    getAll() {
      return observedObjectNames;
    },
    get(objectName: BaseObject['name']) {
      return observedDatasRecord[objectName] as Observed<ObjectData>;
    },
    add(objectName, data) {
      const existed = observedObjectNames.data.includes(objectName);

      if (!existed) {
        observedObjectNames.updateWithImmer((draft) => {
          draft.push(objectName);
        });
        observedDatasRecord[objectName] = observe(data);
      }

      return !existed; // 是否添加成功；添加失败意味着，文档内已经存在该 Object 对应的 Data，无需重复添加 Object ，只需要更新对象数据
    },
    delete(objectName) {
      const idx = observedObjectNames.data.findIndex((_objectName) => objectName === _objectName);

      observedObjectNames.updateWithImmer((draft) => {
        draft.splice(idx, 1);
      });

      return delete observedDatasRecord[objectName];
    },
  };
};
