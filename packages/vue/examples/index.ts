import { computed, effect, reactive, ref } from '@vue/reactivity';

const obj = reactive({ lastName: '张', firstName: '三' });

const nameRef = computed(() => {
  console.log('--- computed --->');
  return `姓名: ${obj.lastName} ${obj.firstName}`;
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
  obj.lastName = '李';
  obj.firstName = '四';
}, 2 * 1000);

// computed => effect
// targetMap 记录
// reactive set trigger => 运行 computed
