import chalk from 'chalk';          // for colored output
import fs from 'fs';
import ncp from 'ncp';              // recursive copying of the files 
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
 return await copy(options.templateDirectory, options.targetDirectory, {
   clobber: false,
 });
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
await access(templateDir, fs.constants.R_OK)
  .catch ( error => {     
   console.error(`%s Invalid template name at ${templateDir}`, chalk.red.bold('ERROR'));
   process.exit(1);
  });

 // 2) then copy the files into the target directory using ncp
 console.log(`%s Copy project files from=${options.templateDirectory} to=${options.targetDirectory}`, chalk.cyan('INFO'));


//  await copyTemplateFiles(options)
//   .catch(error => { 
//     console.log(`%s ${error.message}`, chalk.red.bold('ERROR')); 
//     process.exit(1);
//   });

  
  const tasks = new Listr([
    {
      title: 'Copy project files',
      task: () => copyTemplateFiles(options),
    },
    // {
    //   title: 'Initialize git',
    //   task: () => initGit(options),
    //   enabled: () => options.git,
    // },
    // {
    //   title: 'Install dependencies',
    //   task: () =>
    //     projectInstall({
    //       cwd: options.targetDirectory,
    //     }),
    //   skip: () =>
    //     !options.runInstall
    //       ? 'Pass --install to automatically install dependencies'
    //       : undefined,
    // },
  ]);
 
  await tasks.run();

 console.log('%s Project ready', chalk.green.bold('DONE'));
 return true;
}