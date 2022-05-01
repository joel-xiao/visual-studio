import Test from '@/views/Test.vue';
import { shallowMount } from '@vue/test-utils';

test('Test.vue', async () => {
  const wrapper = shallowMount(Test);
  expect(wrapper.html()).toContain('Unit Test Page');
  expect(wrapper.html()).toContain('count is: 0');
  await wrapper.find('button').trigger('click');
  expect(wrapper.html()).toContain('count is: 1');
});
