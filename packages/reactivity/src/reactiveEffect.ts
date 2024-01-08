import { TrackOpTypes, TriggerOpTypes } from './constants';

/**
 * 收集依赖
 * 记录dep
 * @param target 对象
 * @param type get的访问类型
 * @param key 访问对象的属性
 */
export function track(target: object, type: TrackOpTypes, key: unknown) {
  console.log('--- track --->', target, type, key);
}

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
  key?: string | symbol,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: object,
) {
  console.log('--- trigger --->', target, type, key, newValue, oldValue, oldTarget);  
}
