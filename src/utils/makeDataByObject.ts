import { BaseObject, ObjectData } from '../types';

export default (object: BaseObject): ObjectData | ObjectData[] => {
  const { dataType } = object;

  switch (dataType) {
    case 'array':
      return [] as ObjectData[];
    case 'object':
    default:
      return {} as ObjectData;
  }
};
