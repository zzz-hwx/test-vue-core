import { reactive } from '@vue/reactivity';

console.log('--- index.ts --->');

const obj = reactive({ name: '邢牧', content: '浅浅测试下' });

console.log(obj);
