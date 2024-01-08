import { type Target } from './reactive';
import { track, trigger } from './reactiveEffect';
import { TrackOpTypes, TriggerOpTypes } from './constants';
import { hasOwn } from '@vue/shared';

class BaseReactiveHandler implements ProxyHandler<Target> {
  constructor() {}
  get(target: Target, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver);
    track(target, TrackOpTypes.GET, key); // 收集依赖
    return res;
  }
}

class MutableReactiveHandler extends BaseReactiveHandler {
  constructor() {
    super();
  }
  set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object,
  ): boolean {
    let oldValue = (target as any)[key];
    const result = Reflect.set(target, key, value, receiver);
    const hadKey = hasOwn(target, key);
    if (hadKey) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue); // 触发依赖
    } else {
      trigger(target, TriggerOpTypes.ADD, key, value); // 触发依赖
    }
    return result;
  }
}

export const mutableHandlers: ProxyHandler<object> =
  new MutableReactiveHandler();
