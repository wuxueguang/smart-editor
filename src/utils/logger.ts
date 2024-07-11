/* eslint-disable no-console */

import { typeOf } from '.';

const debugMode = () => new URLSearchParams(location.search).get('console') === 'yes';

export const info = (...args: any[]) => {
  if (debugMode()) {
    const strs: string[] = [];
    const rest: any[] = [];

    args.forEach((v) => {
      if (rest.length === 0 && ['string', 'number'].includes(typeOf(v))) {
        strs.push(String(v));
      } else {
        rest.push(v);
      }
    });

    if (strs.length) {
      console.log.apply(null, [`%c${strs.join(' ')}`, 'background-color: black;color: chartreuse;font-size: 14px; line-height: 1.6;padding: 0 4px;', ...rest]);
    } else {
      console.log.apply(null, rest);
    }
  }
};

export const warn = (...args: any[]) => {
  if (debugMode()) {
    const strs: string[] = [];
    const rest: any[] = [];

    args.forEach((v) => {
      if (rest.length === 0 && ['string', 'number'].includes(typeOf(v))) {
        strs.push(String(v));
      } else {
        rest.push(v);
      }
    });

    if (strs.length) {
      console.log.apply(null, [`%c${strs.join(' ')}`, 'background-color: #faad14;color: #fff;font-size: 14px; line-height: 1.6;padding: 0 4px;', ...rest]);
    } else {
      console.log.apply(null, rest);
    }
  }
};

export const error = (err: any) => {
  if (debugMode()) {
    console.error(err);
  }
};

export const table = (...args: Parameters<Console['table']>) => {
  if (debugMode()) {
    // eslint-disable-next-line no-console
    console.table(...args);
  }
};
