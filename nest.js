import path from 'path';
import fs from 'fs';
import { execa } from 'execa';

class MyNest {
  async setupNest(projectDir, database) {
    console.log('Setting up NestJS...');

    // Generate Nest project
    await execa(
      'npx',
      [
        '@nestjs/cli',
        'new',
        path.basename(projectDir),
        '--package-manager',
        'npm',
        '--skip-git'
      ],
      {
        cwd: path.dirname(projectDir),
        stdio: 'inherit'
      }
    );

    // Add database dependencies
    if (database === 'MongoDB') {
      await execa(
        'npm',
        ['install', '@nestjs/mongoose', 'mongoose'],
        { cwd: projectDir }
      );

      fs.writeFileSync(
        path.join(projectDir, '.env'),
        `
PORT=3000
MONGO_URI=mongodb://localhost:27017/mydb
`.trim()
      );
    }

    if (database === 'MySql') {
      await execa(
        'npm',
        [
          'install',
          '@nestjs/typeorm',
          'typeorm',
          'mysql2'
        ],
        { cwd: projectDir }
      );

      fs.writeFileSync(
        path.join(projectDir, '.env'),
        `
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=mydb
`.trim()
      );
    }

    // Install dotenv
    await execa(
      'npm',
      ['install', '@nestjs/config'],
      { cwd: projectDir }
    );

    console.log(
      `NestJS + ${database} project created successfully in "${projectDir}"`
    );
  }
}

export default MyNest;