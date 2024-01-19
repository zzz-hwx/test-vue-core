import { hasChanged } from '@vue/shared';
import {
  ShallowReactiveMarker,
  isReadonly,
  isShallow,
  toRaw,
  toReactive,
} from './reactive';
import { Dep, createDep } from './dep';
import { DirtyLevels } from './constants';
import {
  activeEffect,
  shouldTrack,
  trackEffect,
  triggerEffects,
} from './effect';
import { ComputedRefImpl } from './computed';

declare const RefSymbol: unique symbol;
export declare const RawSymbol: unique symbol;

export interface Ref<T = any> {
  value: T;
  [RefSymbol]: true;
}

/**
 * 判断是否为ref对象
 * @param r 要检查的值
 */
export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>;
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true);
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}

class RefImpl<T> {
  private _value: T;
  private _rawValue: T;

  public dep?: Dep = undefined;
  public readonly __v_isRef = true;

  constructor(
    value: T,
    public readonly __v_isShallow: boolean,
  ) {
    this._value = __v_isShallow ? value : toReactive(value);
    this._rawValue = __v_isShallow ? value : toRaw(value);
  }

  get value() {
    trackRefValue(this); // 收集依赖
    return this._value;
  }
  set value(newVal) {
    const useDirectValue =
      this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._value = useDirectValue ? newVal : toReactive(newVal);
      this._rawValue = newVal;
      triggerRefValue(this, DirtyLevels.Dirty, newVal); // 触发依赖
    }
  }
}

type RefBase<T> = {
  dep?: Dep;
  value: T;
};

/**
 * 收集依赖
 * @param ref
 * @returns
 */
export function trackRefValue(ref: RefBase<any>) {
  if (!shouldTrack || !activeEffect) return;
  ref = toRaw(ref);
  trackEffect(
    activeEffect,
    ref.dep ||
      (ref.dep = createDep(
        () => (ref.dep = undefined),
        ref instanceof ComputedRefImpl ? ref : undefined,
      )),
  );
}

/**
 * 触发依赖
 * @param ref
 * @param dirtyLevel
 * @param newVal
 * @returns
 */
export function triggerRefValue(
  ref: RefBase<any>,
  dirtyLevel: DirtyLevels = DirtyLevels.Dirty,
  newVal?: any,
) {
  ref = toRaw(ref);
  const dep = ref.dep;
  if (!dep) return;
  triggerEffects(dep, dirtyLevel);
}

declare const ShallowRefMarker: unique symbol;

export type ShallowRef<T = any> = Ref<T> & { [ShallowRefMarker]?: true };

export type UnwrapRef<T> = T extends ShallowRef<infer V>
  ? V
  : T extends Ref<infer V>
    ? UnwrapRefSimple<V>
    : UnwrapRefSimple<T>;

type BaseTypes = string | number | boolean;

export interface RefUnwrapBailTypes {}

export type UnwrapRefSimple<T> = T extends
  | Function
  | BaseTypes
  | Ref
  | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
  | { [RawSymbol]?: true }
  ? T
  : T extends Map<infer K, infer V>
    ? Map<K, UnwrapRefSimple<V>> & UnwrapRef<Omit<T, keyof Map<any, any>>>
    : T extends WeakMap<infer K, infer V>
      ? WeakMap<K, UnwrapRefSimple<V>> &
          UnwrapRef<Omit<T, keyof WeakMap<any, any>>>
      : T extends Set<infer V>
        ? Set<UnwrapRefSimple<V>> & UnwrapRef<Omit<T, keyof Set<any>>>
        : T extends WeakSet<infer V>
          ? WeakSet<UnwrapRefSimple<V>> & UnwrapRef<Omit<T, keyof WeakSet<any>>>
          : T extends ReadonlyArray<any>
            ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
            : T extends object & { [ShallowReactiveMarker]?: never }
              ? {
                  [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>;
                }
              : T;

/**
 * 接受一个内部值，返回一个响应式的、可更改的 ref 对象，此对象只有一个指向其内部值的属性 .value。
 * @param value 要包装在ref中的数据
 * @returns
 */
export function ref<T>(value: T): Ref<UnwrapRef<T>>; // 上面一堆的类型推导...
export function ref<T = any>(): Ref<T | undefined>;
export function ref(value?: unknown) {
  return createRef(value, false);
}

/**
 * ref()的浅层作用形式 {@link ref()}
 * @param value
 * @returns
 */
export function shallowRef(value?: unknown) {
  return createRef(value, true);
}
