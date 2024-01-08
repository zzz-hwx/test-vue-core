import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandlers';

export interface Target {}

export const reactiveMap = new WeakMap<Target, any>();

export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap);
}

/**
 * 创建reactive对象
 * @param target 代理对象
 * @param baseHandlers 处理对象
 * @param proxyMap WeakMap
 */
function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`);
    return target;
  }
  if (proxyMap.has(target)) {
    return proxyMap.get(target);
  }
  const proxy = new Proxy(target, baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
