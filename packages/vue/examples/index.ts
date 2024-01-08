import { reactive } from '@vue/reactivity';

const obj = reactive({ name: '邢牧', content: '浅浅测试下' });

console.log(obj.name);

obj.name = 'xxx';

console.log(obj.name);
