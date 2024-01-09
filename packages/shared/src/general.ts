export const isObject = (val: unknown): boolean =>
  val !== null && typeof val === 'object';

export const isArray = Array.isArray;

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const hasOwn = (val: object, key: string | symbol): boolean =>
  hasOwnProperty.call(val, key);

export const isSymbol = (val: unknown): val is symbol =>
  typeof val === 'symbol';

export const objectToString = Object.prototype.toString;

export const toTypeString = (value: unknown): string =>
  objectToString.call(value);

export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]';

export const isString = (val: unknown): val is string =>
  typeof val === 'string';

export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key;
