// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

import {
  create,
  NLoadingBarProvider,
  NSpace,
  NSpin,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutFooter,
  NH2,
  NButton,
  NCard,
  NPopover,
  NInput,
  NBreadcrumb,
  NBreadcrumbItem
} from 'naive-ui';

const components = [
  NLoadingBarProvider,
  NSpace,
  NSpin,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutFooter,
  NH2,
  NButton,
  NCard,
  NPopover,
  NInput,
  NBreadcrumb,
  NBreadcrumbItem
];
const naive = create({
  components
});

export default naive;
