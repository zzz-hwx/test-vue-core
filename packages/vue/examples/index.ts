import { computed, effect, reactive, ref } from '@vue/reactivity';

const obj = reactive({ name: '张三' });

const nameRef = computed(() => {
  return `姓名: ${obj.name}`;
});

effect(() => {
  console.log('--- effect --->');
  (document.getElementById('app') as HTMLElement).innerText = nameRef.value;
});

setTimeout(() => {
  console.log('--- setTimeout --->');
  // reactive get track 记录computed ?
  // reactive set trigger 修改 computed dirty
  // effect 重新执行 ?
  obj.name = '李四';
}, 2 * 1000);
