import chalk from 'chalk';          // for colored output
import fs from 'fs';
import ncp from 'ncp';              // recursive copying of the files 
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';
import execa from 'execa';
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

// copy the files into the target directory using ncp
async function copyTemplateFiles(options) {
  return await copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
  });
}

// execute git init command from target directory
async function initGit(options) {
  const result = await execa('git', ['init'], {
    cwd: options.targetDirectory,
  });
  if (result.failed) {
    return Promise.reject(new Error('Failed to initialize git'));
  }
  return;
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  };

  const currentFileUrl = __dirname; // as 'import.meta.url' has extra 'C:\' at beginning
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    '../templates',
    options.template.toLowerCase()
  );
  options.templateDirectory = templateDir;

  // 1) checking read access
  console.log(`%s Checking read acces path=${templateDir}`, chalk.cyan('INFO'));
  await access(templateDir, fs.constants.R_OK);

  console.log(`%s Copy project files from=${options.templateDirectory} to=${options.targetDirectory}`, chalk.cyan('INFO'));

  // `listr` which let's us specify a list of tasks and gives the user a neat progress overview
  const tasks = new Listr([
    {
      title: 'Copy project files',
      task: () => copyTemplateFiles(options),
    },
    {
      title: 'Initialize git',
      task: () => initGit(options),
      enabled: () => options.git,
    },
    {
      title: 'Install dependencies',
      task: () => projectInstall({
          cwd: options.targetDirectory,
        }),
      skip: () =>
        !options.runInstall
          ? 'Pass --install to automatically install dependencies'
          : undefined,
    },
  ]);

  await tasks.run();

  console.log('%s Project ready', chalk.green.bold('DONE'));
  return true;
}