const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const got = require('got');
const moment = require('moment');
require("moment-duration-format");

const confPath = path.join(os.homedir(), '.futjiTrack');
const authFilePath = path.join(confPath, 'auth.json');
const trackingFilePath = path.join(confPath, 'trackings.json');

let auth = {};
if (!fs.existsSync(confPath)) {
  fs.mkdirSync(confPath);
}
if (fs.existsSync(authFilePath)) {
  auth = JSON.parse(fs.readFileSync(authFilePath));
}

let tasks;
module.exports = tasks = {
  auth: {
    set: async (argv) => {
      auth.host = argv.jira;
      auth.user = argv.user;
      auth.pass = argv.pass;

      console.log(`Auth saved.\n\rHost: ${auth.host}\n\rUsername: ${auth.user}`);
      fs.writeFileSync(authFilePath, JSON.stringify(auth));

      return Promise.resolve();
    },
    status: () => {
      if (auth && auth.host) {
        console.log(`Authentication details:\n\rHost: ${auth.host}\n\rUsername: ${auth.user}`);
      } else {
        console.log('No authentication');
      }
    }
  },
  project: {
    ls: async () => {
      const resp = await got(`https://${auth.host}.atlassian.net/rest/api/2/project`, {
        auth: `${auth.user}:${auth.pass}`,
        json: true
      });

      console.log(resp.body.reduce((str, projectData) => {
        return str + `${projectData.key}\t\t${projectData.name}\n\r`;
      }, ''));
    }
  },
  ticket: {
    ls: async (argv) => {
      let assigneeJql = '';
      if (!argv.others) {
        assigneeJql = ' AND assignee = currentUser()'
      }
      const jql = `project = ${argv.project} AND resolution = Unresolved${assigneeJql} ORDER BY updated DESC`;
      const resp = await got(`https://${auth.host}.atlassian.net/rest/api/2/search?jql=${jql}&fields=key,summary`, {
        auth: `${auth.user}:${auth.pass}`,
        json: true
      });

      console.log(resp.body.issues.reduce((str, issueData) => {
        return str + `${issueData.key}\t${issueData.fields.summary}\n\r`;
      }, `${resp.body.total} issue(s)\n\r`));
    }
  },
  track: {
    ls: async () => {
      if (!fs.existsSync(trackingFilePath)) {
        console.log('No current trackings.');
        return;
      }

      return fs.readFile(trackingFilePath).then((data) => {
        return JSON.parse(data);
      }).then((data) => {
        console.log(data.reduce((str, tracking) => {
          let diff = moment().diff(moment(tracking.started), 'minutes');
          return str + `${tracking.issue}\t${diff} min\t${tracking.comment}\n\r`;
        }, ''));
      })
    },
    start: (argv) => {
      let trackings = [];
      if (fs.existsSync(trackingFilePath)) {
        trackings = JSON.parse(fs.readFileSync(trackingFilePath));
      }

      trackings.push({
        started: moment().format(),
        issue: argv.issue,
        comment: argv.comment
      });

      fs.writeFileSync(trackingFilePath, JSON.stringify(trackings));
    },
    stop: (argv) => {
      if (!fs.existsSync(trackingFilePath)) {
        console.log('No current trackings.');
        return;
      }

      return fs.readFile(trackingFilePath).then((data) => {
        return JSON.parse(data);
      }).then((data) => {
        if (!data[argv.index]) {
          console.log('Invalid index');
          return;
        }

        let elem = data[argv.index];
        if (argv.issue) {
          elem.issue = argv.issue;
        }
        if (argv.comment) {
          elem.comment = argv.comment;
        }

        if (!argv.f && (!elem.issue || !elem.comment)) {
          console.error('Issue and/or comment missing.');
          return;
        }

        if (!argv.f) {
          let diff = moment().diff(moment(elem.started), 'seconds');
          tasks.time.log(elem.issue, elem.comment, diff, 'seconds');
        }

        data.slice(index, 1);
        fs.writeFileSync(trackingFilePath, JSON.stringify(data));
      })
    }
  },
  time: {
    ls: async () => {
      console.log('Only trackings from yesterday and today will be shown.');
      const resp = await got(`https://${auth.host}.atlassian.net/rest/tempo-timesheets/3/worklogs`, {
        auth: `${auth.user}:${auth.pass}`,
        json: true,
        query: {
          dateFrom: moment().subtract(1, 'days').format('YYYY-MM-DD'),
          dateTo: moment().format('YYYY-MM-DD')
        }
      });

      console.log(resp.body.reduce((str, workLogData) => {
        return str + `${workLogData.issue.key}\t${moment.duration(workLogData.timeSpentSeconds, "seconds").format("hh:mm", {trim:false})}\t${workLogData.comment}\n\r`;
      }, ''));
    },
    log: async (argv) => {
      try {
        const workTimeSec = parseInt(moment.duration(argv.time, argv.format).format("s"), 10);
        const body = {
          comment: argv.comment,
          issue: {
            key: argv.issue,
            remainingEstimateSeconds: 0
          },
          author: {
            name: `${auth.user}`
          },
          dateStarted: moment().format('YYYY-MM-DDThh:mm:ss.SSS'),
          timeSpentSeconds: workTimeSec,
          billedSeconds: workTimeSec
        };
        await got(`https://${auth.host}.atlassian.net/rest/tempo-timesheets/3/worklogs`, {
          auth: `${auth.user}:${auth.pass}`,
          json: true,
          body: body
        });
        console.log('ok');
      } catch (e) {
        console.error(`Error ${e.statusCode} ${e.statusMessage}`);
      }
    }
  }
};
