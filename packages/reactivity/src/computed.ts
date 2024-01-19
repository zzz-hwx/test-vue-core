import { NOOP, hasChanged, isFunction } from '@vue/shared';
import { Dep } from './dep';
import { ReactiveEffect } from './effect';
import { trackRefValue, triggerRefValue } from './ref';
import { DirtyLevels, ReactiveFlags } from './constants';
import { toRaw } from './reactive';

export type ComputedGetter<T> = (oldValue?: T) => T;
export type ComputedSetter<T> = (newValue: T) => void;

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined;

  private _value!: T;
  public readonly effect: ReactiveEffect<T>;

  public readonly __v_isRef = true;
  public readonly [ReactiveFlags.IS_READONLY]: boolean = false;

  public _cacheable: boolean;

  constructor(
    getter: ComputedGetter<T>,
    private readonly _setter: ComputedSetter<T>,
    isReadonly: boolean,
    isSSR: boolean,
  ) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),  // () => { return getter(this._value); }
      () => triggerRefValue(this, DirtyLevels.ComputedValueMaybeDirty),
    );
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this[ReactiveFlags.IS_READONLY] = isReadonly;
  }
  get value() {
    console.log('--- computed get value --->');
    // computed ref 可能会被其他代理封装 例如 readonly()
    const self = toRaw(this);
    trackRefValue(self);
    if (!self._cacheable || self.effect.dirty) {
      const oldValue = self._value;
      console.log('--- computed effect run --->');
      self._value = self.effect.run()!; // ??? ! 啥意思?
      if (hasChanged(oldValue, self._value)) {
        triggerRefValue(self, DirtyLevels.ComputedValueDirty);
      }
    }
    return self._value;
  }
  set value(newVal: T) {
    this._setter(newVal);
  }
}

export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
  isSSR = false,
) {
  let getter: ComputedGetter<T>;
  let setter: ComputedSetter<T>;

  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(
    getter,
    setter,
    onlyGetter || !setter,
    isSSR,
  );
  return cRef as any;
}
