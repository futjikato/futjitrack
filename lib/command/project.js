const project = require('./../task/project');

const commands = (yargs) => {
  return yargs
    .command('project-ls', 'List available projects', (yargs) => {}, () => {
      project.list().catch((e) => {
        console.error(e.toString());
        process.exit(1);
      })
    });
};

module.exports = commands;
