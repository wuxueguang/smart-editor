import { BaseModule, BaseObject, Variable } from '../types';

type Flag = '0' | '1';

const fixFlag = (flag: Flag, def: Flag) => Number(/^[01]$/.test(String(flag)) ? flag : def) as 0 | 1;

export const variableTransfer = (function () {
  const KR: Record<string, keyof Variable> = {
    variableName: 'name',
    variableLabel: 'label',

    editFlag: 'editable',
    hiddenFlag: 'hidden',
    enabledFlag: 'enabled',
    requiredFlag: 'required',

    variableDescription: 'description',
  };

  const KT: Record<string, (...args: any[]) => any> = {

    enabledFlag: (origin: Flag) => fixFlag(origin, '0' /* 不可使用，作用？？ */) === 1,

    hiddenFlag: (origin: Flag) => fixFlag(origin, '0' /* 不隐藏 */) === 1,

    requiredFlag: (origin: Flag) => fixFlag(origin, '0' /* 非必填 */) === 1,

    editFlag: (origin: Flag) => fixFlag(origin, '1' /* 可编辑 */) === 1,

  };

  return (origin: Record<string, any>): Variable => {
    const variable = { ...origin };

    Object.entries(KR).forEach(([originKey, key]) => {
      variable[key] = KT[originKey] ? KT[originKey](origin[originKey]) : origin[originKey];
    });

    return variable as Variable;
  };
})();

export function variablesTransfer(origins: Array<Record<string, any>> = []): Variable[] {
  return origins.map((origin) => variableTransfer(origin));
}

export const objectTransfer = (function () {
  const KR: Record<string, keyof BaseObject> = {
    objectName: 'name',
    objectLabel: 'label',
    variableConfigBoList: 'variables',
  };
  const KT: Record<string, (...args: any[]) => any> = {
    variableConfigBoList: (origins: Array<Record<string, any>> = []) => variablesTransfer(origins),
  };

  return (origin: Record<string, any>): BaseObject => {
    const object = { ...origin };

    Object.entries(KR).forEach(([originKey, key]) => {
      object[key] = KT[originKey] ? KT[originKey](origin[originKey]) : origin[originKey];
    });

    return object as BaseObject;
  };
})();

export function objectsTransfer(origins: Array<Record<string, any>> = []): BaseObject[] {
  return origins.map((origin) => objectTransfer(origin));
}

export const moduleTrasfer = (function () {
  const KR: Record<string, keyof BaseModule> = {
    componentId: 'id',
    componentName: 'label',
    singleAddFlag: 'pickable',
    displayLayout: 'displayType',
    pdfRenderTemplate: 'template',
    componentDescription: 'description',
    componentObjectConfigBoList: 'objects',
  };
  const KT: Record<string, (...args: any[]) => any> = {
    singleAddFlag: (origin: '0' | '1' = '0') => Number(origin) === 1,
    componentObjectConfigBoList: (origins: Array<Record<string, any>> = []) => objectsTransfer(origins),
  };

  return (origin: Record<string, any>): BaseModule => {
    const module = { ...origin };

    Object.entries(KR).forEach(([originKey, key]) => {
      module[key] = KT[originKey] ? KT[originKey](origin[originKey]) : origin[originKey];
    });

    return module as BaseModule;
  };
})();

export function modulesTrasfer(origins: Array<Record<string, any>> = []): BaseModule[] {
  return origins.map((origin) => moduleTrasfer(origin));
}
