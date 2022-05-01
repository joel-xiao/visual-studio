module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能（feature）
        'fix', // 修补bug
        'docs', // 文档（documentation）
        'style', // 格式（不影响代码运行的变动）
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'perf', // 优化相关，比如提升性能、体验
        'test', // 增加测试
        'build', // 改变了build工具 如 grunt换成了 npm
        'chore', // 其他改动
        'config', // 构建过程或辅助工具的变动
        'revert', // 回滚
        'merge', // 代码合并
        'sync' // 同步主线或分支的Bug
      ]
    ],
    'type-empty': [2, 'never'], // 提交不符合规范时,也可以提交, ////但是会有警告
    'subject-empty': [2, 'never'], // 提交不符合规范时,也可以提交,////但是会有警告
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never']
  }
};
