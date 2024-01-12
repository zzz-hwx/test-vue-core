import { effect, ref } from '@vue/reactivity';

const strRef = ref('一行文字呀');
const objRef = ref({ name: '邢牧', content: '浅浅测试下' });

effect(() => {
  (document.getElementById('app') as HTMLElement).innerText = strRef.value as string;
});

effect(() => {
  (document.getElementById('app2') as HTMLElement).innerText = objRef.value.content;
});

setTimeout(() => {
  console.log('--- setTimeout --->');
  strRef.value = '修改数据';

  objRef.value.content = '数据变化';
}, 2 * 1000);
