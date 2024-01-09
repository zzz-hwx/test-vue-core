import { effect, reactive } from '@vue/reactivity';

const obj = reactive({ name: '邢牧', content: '浅浅测试下' });

effect(() => {
  (document.getElementById('app') as HTMLElement).innerText = obj.name;
});

effect(() => {
  (document.getElementById('app2') as HTMLElement).innerText = obj.content;
});

setTimeout(() => {
  obj.name = '修改数据';
  obj.content = '数据变化';
}, 2000);
