import chalk from 'chalk';          // for colored output
import fs from 'fs';
import ncp from 'ncp';              // recursive copying of the files 
import path from 'path';
import { promisify } from 'util';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
 return copy(options.templateDirectory, options.targetDirectory, {
   clobber: false,
 });
}

export async function createProject(options) {
 options = {
   ...options,
   targetDirectory: options.targetDirectory || process.cwd(),
 };

 const currentFileUrl = import.meta.url;
 const templateDir = path.resolve(
   new URL(currentFileUrl).pathname,
   '../../templates',
   options.template.toLowerCase()
 ); 
 options.templateDirectory = templateDir;

 // 1) checking read access
 try {
   await access(templateDir, fs.constants.R_OK);    
 } catch (err) {
     // somehow the templateDir has extra 'C:\' at beginning
   console.error(`%s Invalid template name => path=${templateDir}`, chalk.red.bold('ERROR'));
   process.exit(1);
 }

 // 2) then copy the files into the target directory using ncp
 console.log('Copy project files');
 await copyTemplateFiles(options);

 console.log('%s Project ready', chalk.green.bold('DONE'));
 return true;
}