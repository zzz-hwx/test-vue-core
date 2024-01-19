import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandlers';
import { ReactiveFlags } from './constants';

export interface Target {
  [ReactiveFlags.SKIP]?: boolean;
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
  [ReactiveFlags.IS_SHALLOW]?: boolean;
  [ReactiveFlags.RAW]?: any;
}

export const reactiveMap = new WeakMap<Target, any>();

export function reactive(target: object) {
  return createReactiveObject(target, false, mutableHandlers, reactiveMap);
}

export declare const ShallowReactiveMarker: unique symbol;

/**
 * 创建reactive对象
 * @param target 代理对象
 * @param baseHandlers 处理对象
 * @param proxyMap WeakMap
 */
function createReactiveObject(
  target: object,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`);
    return target;
  }
  if (target[ReactiveFlags.RAW] && !(isReadonly && target[ReactiveFlags.IS_REACTIVE])) {
    // target 已经是Proxy
    return target;
  }
  // target已存在
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // TODO:
  const proxy = new Proxy(target, baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}

export function toReactive<T extends unknown>(value: T): T {
  return isObject(value) ? reactive(value) : value;
}

export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW];
  return raw ? toRaw(raw) : observed;
}

export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_SHALLOW]);
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY]);
}
