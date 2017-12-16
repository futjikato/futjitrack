#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const motd = require('fs').readFileSync(path.join(__dirname, 'motd.txt')).toString();
const projectCmd = require('./lib/command/project');
const issueCmd = require('./lib/command/issue');
const authCmd = require('./lib/command/auth');
const trackCmd = require('./lib/command/track');
const worklogCmd = require('./lib/command/worklog');

const inst = yargs.usage(motd)
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    describe: 'Print extra information'
  })
  .global('verbose');

authCmd(inst);
projectCmd(inst);
issueCmd(inst);
trackCmd(inst);
worklogCmd(inst);

const argv = inst.demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;
