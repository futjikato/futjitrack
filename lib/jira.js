const got = require('got');
const conf = require('./conf');
const moment = require('moment');

module.exports = {
  loadProjects: async () => {
    return conf.getAuth().then((auth) => {
      return got(`https://${auth.host}.atlassian.net/rest/api/2/project`, {
        auth: `${auth.user}:${auth.pass}`,
        json: true
      }).then((response) => {
        return response.body;
      });
    });
  },
  loadIssues: async (projectKey, assignedToSelf = true) => {
    return conf.getAuth().then((auth) => {
      let assigneeJql = '';
      if (assignedToSelf) {
        assigneeJql = ' AND assignee = currentUser()'
      }
      const jql = `project = ${projectKey} AND resolution = Unresolved${assigneeJql} ORDER BY updated DESC`;

      return got(`https://${auth.host}.atlassian.net/rest/api/2/search?jql=${jql}&fields=key,summary`, {
        auth: `${auth.user}:${auth.pass}`,
        json: true
      }).then((response) => {
        return response.body;
      });
    });
  },
  loadWorklogs: async (days = 1) => {
    return conf.getAuth().then((auth) => {
      return got(`https://${auth.host}.atlassian.net/rest/tempo-timesheets/3/worklogs`, {
        auth: `${auth.user}:${auth.pass}`,
        json: true,
        query: {
          dateFrom: moment().subtract(days, 'days').format('YYYY-MM-DD'),
          dateTo: moment().format('YYYY-MM-DD')
        }
      });
    }).then((response) => {
      return response.body;
    });
  },
  saveWorklog: async (worklog) => {
    return conf.getAuth().then((auth) => {
      return got(`https://${auth.host}.atlassian.net/rest/tempo-timesheets/3/worklogs`, {
        auth: `${auth.user}:${auth.pass}`,
        json: true,
        body: worklog
      });
    });
  }
};
