import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

function parseArgumentsIntoOptions(rawArgs) {
  
  const args = arg(
    // spec
    {
      // Types
      '--git': Boolean,
      '--yes': Boolean,
      '--install': Boolean,
      // Aliases
      '-g': '--git',
      '-y': '--yes',
      '-i': '--install',
    },
    //options   
    {
      permissive: true, // 'true' value will ignore ungerognized arg thus prevent UnhandledPromiseRejectionWarning: Unhandled promise rejection
      argv: rawArgs.slice(2), // e.g. process.argv.slice(2)
    }
  );
  return {
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    template: args._[0],
    runInstall: args['--install'] || false,
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = 'JavaScript';
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }

  const questions = [];
  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose which project template to use',
      choices: ['JavaScript', 'TypeScript'],
      default: defaultTemplate,
    });
  }

  if (!options.git) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: 'Initialize a git repository?',
      default: false,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git,
  };
}

export async function cli(args) {
  console.log("0");
  let options = parseArgumentsIntoOptions(args);
  console.log("1");
  options = await promptForMissingOptions(options);
  console.log("end 1");
  console.log(options);
  await createProject(options)
    .catch((error) => console.log(error));    //! this `catch` is to handle error thowen within this async mehtod
  // else there will be 'UnhandledPromiseRejectionWarning: Unhandled promise rejection'
}