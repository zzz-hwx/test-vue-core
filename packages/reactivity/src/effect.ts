import { NOOP } from '@vue/shared';
import { DirtyLevels } from './constants';
import { Dep } from './dep';
import { ComputedRefImpl } from './computed';

export type EffectScheduler = (...args: any[]) => any;

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
  active = true;
  deps: Dep[] = [];

  /**
   * 创建后可以附加
   * @internal
   */
  computed?: ComputedRefImpl<T>;
  /**
   * @internal
   */
  allowRecurse?: boolean;

  /**
   * @internal
   */
  _dirtyLevel = DirtyLevels.Dirty;
  /**
   * 当前成员只供内部使用, 下划线开头的成员默认是内部成员
   * @internal
   */
  _trackId = 0;
  /**
   * @internal
   */
  _runnings = 0;
  /**
   * @internal
   */
  _queryings = 0;
  /**
   * @internal
   */
  _depsLength = 0;
  constructor(
    public fn: () => T,
    public trigger: () => void,
    public scheduler?: EffectScheduler,
  ) {}

  public get dirty() {
    if (this._dirtyLevel === DirtyLevels.ComputedValueMaybeDirty) {
      this._dirtyLevel = DirtyLevels.NotDirty;
      this._queryings++;
      pauseTracking();
      for (const dep of this.deps) {
        if (dep.computed) {
          triggerComputed(dep.computed);
          if (this._dirtyLevel >= DirtyLevels.ComputedValueDirty) {
            break;
          }
        }
      }
      resetTracking();
      this._queryings--;
    }
    return this._dirtyLevel >= DirtyLevels.ComputedValueDirty;
  }
  public set dirty(v) {
    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NotDirty;
  }

  run() {
    this._dirtyLevel = DirtyLevels.NotDirty;
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
}

function triggerComputed(computed: ComputedRefImpl<any>) {
  return computed.value;
}

function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === undefined ? true : last;
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
  const _effect = new ReactiveEffect(fn, NOOP, () => {
    if (_effect.dirty) {
      _effect.run();
    }
  });
  _effect.run();
}

function cleanupDepEffect(dep: Dep, effect: ReactiveEffect) {
  const trackId = dep.get(effect);
  if (trackId !== undefined && effect._trackId !== trackId) {
    dep.delete(effect);
    if (dep.size === 0) {
      dep.cleanup();
    }
  }
}

export let shouldTrack = true;
export let pauseScheduleStack = 0;

const trackStack: boolean[] = [];

/**
 * 暂停track
 */
export function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}

export function pauseScheduling() {
  pauseScheduleStack++;
}

export function resetScheduling() {
  pauseScheduleStack--;
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()!(); // ??? ! 是什么意思?
  }
}

export function trackEffect(effect: ReactiveEffect, dep: Dep) {
  if (dep.get(effect) === effect._trackId) return;
  dep.set(effect, effect._trackId);
  const oldDep = effect.deps[effect._depsLength];
  if (oldDep !== dep) {
    if (oldDep) {
      cleanupDepEffect(oldDep, effect);
    }
    effect.deps[effect._depsLength] = dep;
  }
  effect._depsLength++;
}

const queueEffectSchedulers: (() => void)[] = [];

export function triggerEffects(dep: Dep, dirtyLevel: DirtyLevels) {
  console.log('--- triggerEffects --->', dep);
  pauseScheduling();
  for (const effect of dep.keys()) {
    if (!effect.allowRecurse && effect._runnings) continue;
    if (
      effect._dirtyLevel < dirtyLevel &&
      (!effect._runnings || dirtyLevel !== DirtyLevels.ComputedValueDirty)
    ) {
      const lastDirtyLevel = effect._dirtyLevel;
      effect._dirtyLevel = dirtyLevel;
      if (
        lastDirtyLevel === DirtyLevels.NotDirty &&
        (!effect._queryings || dirtyLevel !== DirtyLevels.ComputedValueDirty)
      ) {
        effect.trigger();
        if (effect.scheduler) {
          queueEffectSchedulers.push(effect.scheduler);
        }
      }
    }
    // effect.run();  // ???
    resetScheduling();
  }
}
