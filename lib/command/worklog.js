const jira = require('./../jira');
const conf = require('./../conf');
const moment = require('moment');
require('moment-duration-format');

const command = (yargs) => {
  yargs.command('time-ls', 'List work logs saved in jira', (yargs) => {
    yargs.option('days', {
      alias: 'd',
      default: 1,
      describe: ''
    });
  }, (argv) => {
    jira.loadWorklogs(argv.days).then((logs) => {
      console.log(logs.reduce((str, log) => {
        return str + `${log.issue.key}\t${moment.duration(log.timeSpentSeconds, "seconds").format("hh:mm", {trim:false})}\t${log.comment}\n\r`;
      }, `Total logs: ${logs.length}\n\r`));
    }).catch((e) => {
      console.error(e.toString());
      process.exit(1);
    });
  }).command('time-log <issue> <comment> <time>', 'Log time in jira', (yargs) => {
    yargs.positional('issue', {
      describe: 'Issue key',
      type: 'string'
    }).positional('comment', {
      describe: 'Comment about what you are working on',
      type: 'string'
    }).positional('time', {
      describe: 'Minutes you want to log',
      type: 'number'
    }).option('format', {
      describe: 'Format of the work time provided',
      choices: ['minutes', 'hours'],
      default: 'minutes'
    }).demandOption(['issue', 'comment', 'time']);
  }, (argv) => {
    conf.getAuth().then((auth) => {
      const workTimeSec = parseInt(moment.duration(argv.time, argv.format).format("s"), 10);
      return {
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
      }
    }).then((worklog) => {
      return jira.saveWorklog(worklog)
    }).then(() => {
      console.log('Saved worklog.');
    }).catch((e) => {
      console.error(e.toString());
      process.exit(1);
    })
  })
};

module.exports = command;
