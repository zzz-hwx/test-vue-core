import { DirtyLevels } from './constants';
import { Dep } from './dep';

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
  deps: Dep[] = [];
  /**
   * 当前成员只供内部使用, 下划线开头的成员默认是内部成员
   * @internal
   */
  _trackId = 0;
  /**
   * @internal
   */
  _depsLength = 0;
  constructor(public fn: () => T) {}
  run() {
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
}

// 单例
export let activeEffect: ReactiveEffect | undefined;

/**
 * 副作用函数
 * 立即执行fn 收集依赖track
 * 数据变化 触发依赖trigger 重新执行函数fn
 * @param fn 回调函数
 */
export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}

export let shouldTrack = true;

export function trackEffect(effect: ReactiveEffect, dep: Dep) {
  if (dep.get(effect) === effect._trackId) return;
  dep.set(effect, effect._trackId);
  const oldDep = effect.deps[effect._depsLength];
  if (oldDep !== dep) {
    effect.deps[effect._depsLength] = dep;
  }
  effect._depsLength++;
}

export function triggerEffects(dep: Dep, dirtyLevel: DirtyLevels) {
  console.log('--- triggerEffects --->', dep);
  for (const effect of dep.keys()) {
    effect.run();
    // TODO:
  }
}
