import { useState, useEffect, useCallback } from 'react';
import produce from 'immer';

/* consts */
const ORIGIN_DATA = Symbol('origin data');
const HOST = Symbol('host');
const CHANGE = 'change';

/* EventEmitter */
const RECORDER = Symbol('recorder of events');
const ADD_EVENT_LISTENER = Symbol('add event listener');

type Handle = Function;

interface AddInfo {
  eventName: string;
  handle: Handle;
}

class SyncEventEmitter {
  private [RECORDER] = new Map<string, Set<Handle>>();

  private [ADD_EVENT_LISTENER]({ eventName, handle }: AddInfo): void {
    if (!this[RECORDER].get(eventName)) {
      this[RECORDER].set(eventName, new Set<Handle>());
    }
    this[RECORDER].get(eventName)?.add(handle);
  }

  emit(eventName: string, ...handlePrams: any[]): void {
    const handles = this[RECORDER].get(eventName);

    handles?.forEach((handle) => {
      handle.apply(this, handlePrams);
    });
  }

  on(eventName: string, handle: Handle): void {
    this[ADD_EVENT_LISTENER]({ eventName, handle });
  }

  off(eventName: string, handle: Handle): void {
    this[RECORDER].get(eventName)?.delete(handle);
  }
}

/* Host */
class Host {
  private ET: SyncEventEmitter = new SyncEventEmitter();

  emitChange() {
    this.ET.emit(CHANGE);
  }

  onChange(callback: () => void) {
    this.ET.on(CHANGE, callback);
  }

  offChange(callback: () => void) {
    this.ET.off(CHANGE, callback);
  }
}

export class Observed<T = undefined> {
  private [HOST]: Host = new Host();
  private [ORIGIN_DATA]: T;

  constructor(data?: T) {
    this[ORIGIN_DATA] = data as T;
  }

  update = (updater: ((old: T) => T) | T) => {
    const newData = updater instanceof Function ? updater(this[ORIGIN_DATA]) : updater;
    if (newData !== this[ORIGIN_DATA]) {
      this[ORIGIN_DATA] = newData;
      this[HOST].emitChange();
    }
  };

  updateWithImmer = (updater: (draft: T) => void) => {
    const newData = produce(this[ORIGIN_DATA], updater);

    this[ORIGIN_DATA] = newData;
    this[HOST].emitChange();
  };

  onChange = (handle: () => void) => {
    this[HOST].onChange(handle);
  };

  get data() {
    return this[ORIGIN_DATA];
  }
}

export const observe = <T = undefined>(data?: T) => new Observed<T>(data as T);

export const useObserved = <T = undefined>(maybeObserved?: T | Observed<T>): [T, Observed<T>['update']] => {
  const [data, setData] = useState(maybeObserved instanceof Observed ? maybeObserved.data : maybeObserved);
  const update = useCallback((updater: ((old: T) => T) | T) => setData((old) => (updater instanceof Function ? updater(old as T) : updater)), []);

  useEffect(() => {
    if (maybeObserved instanceof Observed) {
      const handle = () => {
        setData(maybeObserved.data);
      };

      maybeObserved[HOST].onChange(handle);

      return () => maybeObserved[HOST].offChange(handle);
    }
    return () => void 0;
  }, [maybeObserved]);

  return [data as T, maybeObserved instanceof Observed ? maybeObserved.update : update];
};

export const useObservedWithImmer = <T = undefined>(maybeObserved?: T | Observed<T>): [T, Observed<T>['updateWithImmer']] => {
  const [data, setData] = useState(maybeObserved instanceof Observed ? maybeObserved.data : maybeObserved);
  const updateWithImmer = useCallback((updater: (draft: T) => void) => setData((old) => produce(old, updater)), []);

  useEffect(() => {
    if (maybeObserved instanceof Observed) {
      const handle = () => {
        setData(maybeObserved.data);
      };

      maybeObserved[HOST].onChange(handle);

      return () => maybeObserved[HOST].offChange(handle);
    }
    return () => void 0;
  }, [maybeObserved]);

  return [data as T, maybeObserved instanceof Observed ? maybeObserved.updateWithImmer : updateWithImmer];
};
