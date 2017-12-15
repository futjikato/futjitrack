#!/usr/bin/env node

const yargs = require('yargs')
const motd = require('fs').readFileSync('motd.txt').toString();
const tasks = require('./tasks');

const argv = yargs.usage(motd)
  .command('auth set <jira> <user> <pass>', 'Set and save authentication', (yargs) => {
    yargs.positional('jira', {
      describe: 'Jira cloud instance name',
      type: 'string'
    }).positional('user', {
      describe: 'Username ( not eMail! )',
      type: 'string'
    }).positional('pass', {
      describe: 'Password ( stored in plaintext on disk! )',
      type: 'string'
    }).demandOption(['jira', 'user', 'pass']);
  }, tasks.auth.set)
  .command('auth status', 'Print authentication details', (yargs) => {}, tasks.auth.status)
  .command('project ls', 'List available projects', (yargs) => {}, tasks.project.ls)
  .command('ticket ls <project>', 'List open tickets assigned to you.', (yargs) => {
    yargs.positional('project', {
      describe: 'Project key',
      type: 'string'
    }).positional('others', {
      describe: 'Set to show issues assigned to other people.',
      alias: 'o',
      type: 'boolean'
    }).demandOption(['project']);
  }, tasks.ticket.ls)
  .command('track ls', 'List currently running trackings', (yargs) => {}, tasks.track.ls)
  .command('track start', 'Start a new tracking', (yargs) => {
    yargs.positional('issue', {
      alias: 'i',
      describe: 'Issue key',
      type: 'string'
    }).positional('comment', {
      alias: 'c',
      describe: 'Comment about what you are working on',
      type: 'string'
    })
  }, tasks.track.start)
  .command('track stop <index>', 'Stop running tracking. Save work log in jira.', (yargs) => {
    yargs.positional('index', {
      describe: 'Index of the tracking to stop',
      type: 'string'
    }).positional('issue', {
      alias: 'i',
      describe: 'Issue key',
      type: 'string'
    }).positional('comment', {
      alias: 'c',
      describe: 'Comment about what you are working on',
      type: 'string'
    }).option('f', {
      alias: 'force',
      describe: 'Force stopping the tracking. Worklog will not be send to jira.',
      type: 'boolean'
    }).demandOption(['index']);
  }, tasks.track.stop)
  .command('time ls', 'List work logs saved in jira', (yargs) => {}, tasks.time.ls)
  .command('time log <issue> <comment> <time>', 'Log time in jira', (yargs) => {
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
  }, tasks.time.log)
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;
