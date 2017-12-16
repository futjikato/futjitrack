const jira = require('./../jira');

module.exports = {
  list: async (projectKey, assignedToSelf = true) => {
    return jira.loadIssues(projectKey, assignedToSelf).then((issues) => {
      console.log(issues.reduce((str, issue) => {
        return str + `${issue.key}\t${issue.fields.summary}\n\r`;
      }, `${issues.total} issue(s)\n\r`));
    });
  }
};
