import path from 'path';
module.exports = {
  verbose: true,
  rootDir: path.join(__dirname, '.'),
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest', // vue 文件用 vue-jest 转换
    '^.+\\.ts$': 'ts-jest', // ts 文件用 ts-jest 转换
    '^.+\\js$': 'babel-jest'
  },
  // 为了修复 Consider using the "jsdom" test environment. 问题
  testEnvironment: 'jsdom',
  // 匹配 __tests__ 目录下的 .js/.ts 文件 或其他目录下的 xx.test.js/ts xx.spec.js/ts
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts)$',
  moduleDirectories: ['node_modules'],
  /** 全局alias */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
