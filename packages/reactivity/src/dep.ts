import { ComputedRefImpl } from './computed';
import { ReactiveEffect } from './effect';

export type Dep = Map<ReactiveEffect, number> & {
  cleanup: () => void;
  computed?: ComputedRefImpl<any>;
};

export function createDep(
  cleanup: () => void,
  computed?: ComputedRefImpl<any>,
): Dep {
  const dep = new Map() as Dep;
  dep.cleanup = cleanup;
  dep.computed = computed;
  return dep;
}
