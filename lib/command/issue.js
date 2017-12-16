const issue = require('./../task/issue');

const commands = (yargs) => {
  return yargs
    .command('issue-ls <project>', 'List open tickets assigned to you.', (yargs) => {
      yargs.positional('project', {
        describe: 'Project key',
        type: 'string'
      }).option('others', {
        describe: 'Set to show issues assigned to other people.',
        alias: 'o',
        type: 'boolean'
      }).demandOption(['project']);
    }, () => {
      issue.list().catch((e) => {
        console.error(e.toString());
        process.exit(1);
      })
    });
};

module.exports = commands;
