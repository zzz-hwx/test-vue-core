import { isArray, isIntegerKey, isMap, isSymbol } from '@vue/shared';
import { DirtyLevels, TrackOpTypes, TriggerOpTypes } from './constants';
import { Dep, createDep } from './dep';
import { activeEffect, trackEffect, triggerEffects } from './effect';

type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<object, KeyToDepMap>();

/**
 * 收集依赖
 * 记录dep
 * @param target 对象
 * @param type get的访问类型
 * @param key 访问对象的属性
 */
export function track(target: object, type: TrackOpTypes, key: unknown) {
  console.log('--- track --->', target, type, key);
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = createDep(() => depsMap!.delete(key));
    depsMap.set(key, dep);
  }
  trackEffect(activeEffect, dep);
}

export const ITERATE_KEY = Symbol('iterate');
export const MAP_KEY_ITERATE_KEY = Symbol('Map key iterate');

/**
 * 触发依赖
 * 查找与target相关的所有dep, 并触发相应函数
 * @param target 对象
 * @param type set的操作类型
 * @param key 属性名
 * @param newValue
 * @param oldValue
 * @param oldTarget
 */
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>,
) {
  console.log('--- trigger --->', target, type, key, newValue, oldValue, oldTarget);
  const depsMap = targetMap.get(target);
  if (!depsMap) return; // 未被跟踪
  let deps: (Dep | undefined)[] = [];
  if (type === TriggerOpTypes.CLEAR) {
    // 清除
    deps = [...depsMap.values()];
  } else if (key === 'length' && isArray(target)) {
    // 数组 长度
    const newLength = Number(newValue);
    depsMap.forEach((dep, key) => {
      if (key === 'length' || (!isSymbol(key) && key >= newLength)) {
        deps.push(dep);
      }
    });
  } else {
    // SET | ADD | DELETE
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          // 添加到数组的新索引 -> 长度更改
          deps.push(depsMap.get('length'));
        }
        break;
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case TriggerOpTypes.SET:
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  for (const dep of deps) {
    if (!dep) continue;
    triggerEffects(dep, DirtyLevels.Dirty);
  }
}
