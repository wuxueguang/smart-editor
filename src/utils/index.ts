import { message } from 'antd';
// @ts-ignore
import { request as _request } from 'umi';

import { BaseObject, Variable } from '../types';

export * as Logger from './logger';

export * from './transfers';

export * from './lota';

export { default as makeDataByObject } from './makeDataByObject';

import { useDetail } from '../hooks';

export const typeOf = (v: any) =>
  Reflect.toString
    .call(v)
    .replace(/^\[object (.*)\]$/, '$1')
    .toLowerCase();

export const request = async <T = any>(path: string, params = {}, requestType: 'json' | 'form' = 'form'): Promise<T> => {
  const [promise, resolve, reject] = createPromise();

  const searchParams = new URLSearchParams(window.location.search);
  const enterpriseId = searchParams.get('eid') || 1;

  const _params = {
    entId: enterpriseId,
    eid: enterpriseId,
    enterpriseId,
    ...params,
  };

  try {
    // eslint-disable-next-line dot-notation
    const response = await _request(path, {
      method: 'POST',
      data: _params,
      requestType,
    });
    const { success, data, message: msg } = response;

    if (success) {
      resolve(data);
    } else {
      message.error(msg as string);
      reject(response);
    }
  } catch (error: any) {
    reject(error?.data);
  }

  return promise;
};

type ResolveFunc = (anyValue?: any) => void;
type RejectFunc = (anyValue?: any) => void;

export const createPromise = <T = any>(): [Promise<T>, ResolveFunc, RejectFunc] => {
  let resolve: ResolveFunc = () => void 0;
  let reject: RejectFunc = () => void 0;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return [promise, resolve, reject];
};

export const getVariable = (usedObjectRecord: ReturnType<typeof useDetail>['usedObjectsRecord'], names: [BaseObject['name'], Variable['name']]) => {
  const [objectName, variableName] = names;
  return usedObjectRecord[objectName]?.variables?.find((item) => item.name === variableName);
};
