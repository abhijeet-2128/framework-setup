#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import MyExpress from './express.js'

async function setupFramework() {
  const { framework, projectName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Choose a framework to set up:',
      choices: ['Express', 'Koa', 'Hapi', 'Nest'],
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'Provide a name for the project:'
    },
    {
      type: 'list',
      name: 'database',
      message: 'Choose a database to set up:',
      choices: ['MongoDB', 'MySql'],
    },
  ]);

  const project = projectName ? `${projectName.toLowerCase()}` : `${framework.toLowerCase()}-project`;
  const projectDir = path.join(process.cwd(), project);

  if (fs.existsSync(projectDir)) {
    console.log(`Directory "${projectName}" already exists. Exiting.`);
    return;
  }

  fs.mkdirSync(projectDir, { recursive: true });

  switch (framework) {
    case 'Express':
      await new MyExpress().setupExpress(projectDir);
      break;
    case 'Koa':
      await setupKoa(projectDir);
      break;
    case 'Hapi':
      await setupHapi(projectDir);
      break;
    case 'Nest':
      await setupNest(projectDir);
      break;
    default:
      console.log('Invalid framework selection.');
      return;
  }


  console.log(`\nProject setup for ${framework} is complete!`);
  console.log(`Navigate to the "${projectName}" directory to get started.`);
}

setupFramework().catch((err) => {
  console.error('Error during setup:', err.message);
});
