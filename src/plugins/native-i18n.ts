import { createLocale, zhCN, dateZhCN } from 'naive-ui';

const customizedLocale = createLocale({}, zhCN);

export default {
  locale: customizedLocale,
  dateLocale: dateZhCN
};
