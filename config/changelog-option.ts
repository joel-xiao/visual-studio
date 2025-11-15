import compareFunc from 'compare-func';

interface CommitNote {
  title: string;
  [key: string]: unknown;
}

interface CommitReference {
  issue: string;
  [key: string]: unknown;
}

interface Commit {
  type: string;
  scope?: string;
  subject?: string;
  hash?: string | number;
  notes?: CommitNote[];
  references?: CommitReference[];
  revert?: boolean;
  [key: string]: unknown;
}

interface Context {
  repository?: string;
  host?: string;
  owner?: string;
  repoUrl?: string;
}

module.exports = {
  writerOpts: {
    transform: (commit: Commit, context: Context) => {
      const issues: string[] = [];

      let newNotes = commit.notes;
      if (commit.notes && commit.notes.length > 0) {
        newNotes = commit.notes.map(note => ({
          ...note,
          title: 'BREAKING CHANGES'
        }));
      }

      let newType = commit.type;
      if (commit.type === 'feat') {
        newType = '✨ Features | 新功能';
      } else if (commit.type === 'fix') {
        newType = '🐛 Bug Fixes | Bug 修复';
      } else if (commit.type === 'perf') {
        newType = '⚡ Performance Improvements | 性能优化';
      } else if (commit.type === 'revert' || commit.revert) {
        newType = '⏪ Reverts | 回退';
      } else if (commit.type === 'docs') {
        newType = '📝 Documentation | 文档';
      } else if (commit.type === 'style') {
        newType = '💄 Styles | 风格';
      } else if (commit.type === 'refactor') {
        newType = '♻ Code Refactoring | 代码重构';
      } else if (commit.type === 'test') {
        newType = '✅ Tests | 测试';
      } else if (commit.type === 'build') {
        newType = '👷‍ Build System | 构建';
      } else if (commit.type === 'ci') {
        newType = '🔧 Continuous Integration | CI 配置';
      } else if (commit.type === 'chore') {
        newType = '🎫 Chores | 其他更新';
      } else {
        newType = '💩 others | 未命名';
      }

      const newScope = commit.scope === '*' ? '' : commit.scope;

      const newHash =
        typeof commit.hash === 'string' ? commit.hash.substring(0, 7) : commit.hash;

      let newSubject = commit.subject;
      if (typeof commit.subject === 'string') {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;
        if (url) {
          url = `${url}/issues/`;
          newSubject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue);
            return `[#${issue}](${url}${issue})`;
          });
        }
        if (context.host) {
          newSubject = newSubject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
            (_, username) => {
              if (username.includes('/')) {
                return `@${username}`;
              }

              return `[@${username}](${context.host}/${username})`;
            }
          );
        }
      }

      const newReferences = commit.references
        ? commit.references.filter(reference => {
            return issues.indexOf(reference.issue) === -1;
          })
        : [];

      return {
        ...commit,
        type: newType,
        scope: newScope,
        hash: newHash,
        subject: newSubject,
        references: newReferences,
        notes: newNotes
      };
    },
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
    notesSort: compareFunc()
  }
};
