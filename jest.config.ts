import path from 'path';
module.exports = {
  verbose: true,
  rootDir: path.join(__dirname, '.'),
  moduleFileExtensions: ['vue', 'js', 'ts'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': 'vue-jest', // vue 文件用 vue-jest 转换
    '^.+\\.ts$': 'ts-jest' // ts 文件用 ts-jest 转换
  },
  // 匹配 __tests__ 目录下的 .js/.ts 文件 或其他目录下的 xx.test.js/ts xx.spec.js/ts
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts)$',
  moduleDirectories: ['node_modules']
  // moduleNameMapper: {
  //   '@/(.*)$': '<rootDir>/src/$1',
  //   '@v/(.*)$': '<rootDir>/src/views/$1'
  // }
};
