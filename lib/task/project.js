const jira = require('./../jira');

module.exports = {
  list: async () => {
    return jira.loadProjects().then((projects) => {
      console.log(projects.reduce((str, project) => {
        return str + `${project.key}\t\t${project.name}\n\r`;
      }, ''));
    });
  }
};
