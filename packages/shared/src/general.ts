export const isObject = (val: unknown): boolean =>
  val !== null && typeof val === 'object';

export const isArray = Array.isArray;

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const hasOwn = (val: object, key: string | symbol): boolean =>
  hasOwnProperty.call(val, key);
