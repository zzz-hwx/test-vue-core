import { isArray } from '@vue/shared';

export function reactive(target: object): object {
  console.log('--- isArray --->', isArray(target));
  return target;
}
