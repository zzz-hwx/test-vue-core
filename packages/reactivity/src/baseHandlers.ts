import { toRaw, type Target, isReadonly, isShallow } from './reactive';
import { track, trigger } from './reactiveEffect';
import { ReactiveFlags, TrackOpTypes, TriggerOpTypes } from './constants';
import {
  hasChanged,
  hasOwn,
  isArray,
  isIntegerKey,
  isObject,
} from '@vue/shared';
import { isRef } from './ref';

function hasOwnProperty(this: object, key: string) {
  const obj = toRaw(this);
  track(obj, TrackOpTypes.HAS, key); // 收集依赖
  return obj.hasOwnProperty(key);
}

class BaseReactiveHandler implements ProxyHandler<Target> {
  constructor(
    protected readonly _isReadonly = false,
    protected readonly _shallow = false,
  ) {}
  get(target: Target, key: string | symbol, receiver: object) {
    const isReadonly = this._isReadonly,
      shallow = this._shallow;
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return shallow;
    } else if (key === ReactiveFlags.RAW) {
      // TODO:
      // if (receiver === (isReadonly ? shallow ? shallowread)) return target;
      return;
    }

    const targetIsArray = isArray(target);

    if (!isReadonly) {
      // TODO:
      if (key === 'hasOwnProperty') {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(target, key, receiver);
    // TODO:

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key); // 收集依赖
    }
    if (shallow) {
      return res;
    }

    if (isRef(res)) {
      // ref展开: 跳过数组 + 整数键
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject(res)) {
      // TODO:
    }
    return res;
  }
}

class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(shallow = false) {
    super(false, shallow);
  }
  set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object,
  ): boolean {
    let oldValue = (target as any)[key];
    if (!this._shallow) {
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        const isOldValueReadonly = isReadonly(oldValue);
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    // 如果target在原始原型链中 不触发
    // TODO:
    // if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value); // 触发依赖
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue); // 触发依赖
      }
    // }
    return result;
  }
}

export const mutableHandlers: ProxyHandler<object> =
  new MutableReactiveHandler();
