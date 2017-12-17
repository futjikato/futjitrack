const conf = require('../conf');

const command = (yargs) => {
  return yargs.command('auth-set <jira> <user> <pass>', 'Set and save authentication', (yargs) => {
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
  }, (argv) => {
    conf.setAuth(argv.jira, argv.user, argv.pass).then(() => {
      console.log('Authentication saved.');
    }).catch((e) => {
      console.error(e.toString);
      process.exit(1);
    })
  })
  .command('auth-status', 'Print authentication details', (yargs) => {}, () => {
    conf.getAuth().then((auth) => {
      console.log(`Authentication details:\n\rJira: ${auth.host}\n\rUser: ${auth.user}`);
    })
  })
};

module.exports = command;
