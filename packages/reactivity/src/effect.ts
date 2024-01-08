// 单例
export let activeEffect: ReactiveEffect | undefined;

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
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

export function trackEffect() {
  // 
}

export function triggerEffects() {
  //
}
