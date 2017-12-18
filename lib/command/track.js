const conf = require('./../conf');
const jira = require('./../jira');
const moment = require('moment');

const command = (yargs) => {
  yargs.command('track-ls', 'List currently running trackings', (yargs) => {}, () => {
    conf.getTrackers().then((trackings) => {
      console.log(trackings.reduce((str, track) => {
        let diff = moment().diff(moment(track.started), 'minutes');
        return str + `${track.issue}\t${diff} min\t${track.comment}\n\r`;
      }, ''));
    }).catch((e) => {
      console.error(e);
      process.exit(1);
    })
  }).command('track-start', 'Start a new tracking', (yargs) => {
    yargs.option('issue', {
      alias: 'i',
      describe: 'Issue key',
      type: 'string'
    }).option('comment', {
      alias: 'c',
      describe: 'Comment about what you are working on',
      type: 'string'
    });
  }, (argv) => {
    let data = {
      started: moment().format(),
      issue: argv.issue,
      comment: argv.comment
    };
    conf.addTracker(data).then((newIndex) => {
      console.log(`Tracker #${newIndex} added`);
    }).catch((e) => {
      console.error(e);
      process.exit(1);
    })
  }).command('track-stop <index>', 'Stop running tracking. Save work log in jira.', (yargs) => {
    yargs.positional('index', {
      describe: 'Index of the tracking to stop',
      type: 'number'
    }).option('issue', {
      alias: 'i',
      describe: 'Issue key',
      type: 'string'
    }).option('comment', {
      alias: 'c',
      describe: 'Comment about what you are working on',
      type: 'string'
    }).option('force', {
      alias: 'f',
      describe: 'Force stopping the tracking. Worklog will not be send to jira.',
      type: 'boolean'
    }).demandOption(['index']);
  }, (argv) => {
    conf.getOneTracker(argv.index).then((track) => {
      if (argv.issue) {
        track.issue = argv.issue;
      }
      if (argv.comment) {
        track.comment = argv.comment;
      }

      return track;
    }).then((track) => {
      if (!argv.force) {
        return conf.getAuth().then((auth) => {
          let workTimeSec = moment().diff(moment(track.started), 'seconds');
          return {
            comment: track.comment,
            issue: {
              key: track.issue,
              remainingEstimateSeconds: 0
            },
            author: {
              name: `${auth.user}`
            },
            dateStarted: moment(track.started).format('YYYY-MM-DDThh:mm:ss.SSS'),
            timeSpentSeconds: workTimeSec,
            billedSeconds: workTimeSec
          };
        }).then((worklog) => {
          return jira.saveWorklog(worklog).then(() => {
            console.log('Saved worklog.');
          });
        });
      }
    }).then(() => {
      return conf.removeTracker(argv.index);
    }).then(() => {
      console.log('Stopped tracker');
    }).catch((e) => {
      console.error(e.toString());
      if (e.response) {
        console.error(e.response.body);
      }
      process.exit(1);
    });
  }).command('track-set <index>', 'Set information for a tracker', (yargs) => {
    yargs.positional('index', {
      describe: 'Index of the tracking to stop',
      type: 'number'
    }).option('issue', {
      alias: 'i',
      describe: 'Issue key',
      type: 'string'
    }).option('comment', {
      alias: 'c',
      describe: 'Comment about what you are working on',
      type: 'string'
    }).demandOption(['index']);
  }, (argv) => {
    conf.getOneTracker(argv.index).then((track) => {
      if (argv.issue) {
        track.issue = argv.issue;
      }
      if (argv.comment) {
        track.comment = argv.comment;
      }

      return track;
    }).then((track) => {
      return conf.setTracker(argv.index, track);
    }).then(() => {
      console.log('Updated tracker');
    }).catch((e) => {
      console.error(e);
      process.exit(1);
    })
  }).command('track-toggle <index>', 'Pause/Unpause the tracker with the given index', (yargs) => {
    yargs.positional('index', {
      describe: 'Index of the tracking to stop',
      type: 'number'
    }).demandOption(['index']);
  }, (argv) => {
    conf.getOneTracker(argv.index).then((data) => {
      if (data.inactive) {
        data.inactive = false;
        data.stopTimes.push(moment().format());
      } else {
        data.inactive = true;
        data.startTimes.push(moment().format());
      }

      return data;
    }).then((data) => {
      return conf.setTracker(argv.index, data);
    }).then(() => {
      console.log(`Tracker #${argv.index} paused`);
    })
  });
};

module.exports = command;
