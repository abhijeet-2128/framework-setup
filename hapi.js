import path from 'path';
import fs from 'fs';
import { execa } from 'execa';

class MyHapi {
  async setupHapi(projectDir, database) {
    console.log('Setting up Hapi...');

    // Initialize project
    await execa('npm', ['init', '-y'], {
      cwd: projectDir
    });

    // Install Hapi dependencies
    await execa(
      'npm',
      [
        'install',
        '@hapi/hapi',
        'dotenv'
      ],
      {
        cwd: projectDir
      }
    );

    // Install database dependency
    if (database === 'MongoDB') {
      await execa(
        'npm',
        ['install', 'mongoose'],
        { cwd: projectDir }
      );
    }

    if (database === 'MySql') {
      await execa(
        'npm',
        ['install', 'mysql2'],
        { cwd: projectDir }
      );
    }

    // Dev dependencies
    await execa(
      'npm',
      [
        'install',
        '-D',
        'typescript',
        'ts-node',
        '@types/node'
      ],
      {
        cwd: projectDir
      }
    );

    // package.json scripts
    const packageJsonPath = path.join(
      projectDir,
      'package.json'
    );

    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8')
    );

    packageJson.scripts = {
      dev: 'ts-node src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js'
    };

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );

    // tsconfig
    const tsConfig = {
      compilerOptions: {
        target: 'ES6',
        module: 'CommonJS',
        rootDir: './src',
        outDir: './dist',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules']
    };

    fs.writeFileSync(
      path.join(projectDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // .gitignore
    fs.writeFileSync(
      path.join(projectDir, '.gitignore'),
      `
node_modules
dist
.env
`.trim()
    );

    // .env
    let envContent = `PORT=3000`;

    if (database === 'MongoDB') {
      envContent += `

MONGO_URI=mongodb://localhost:27017/mydb`;
    }

    if (database === 'MySql') {
      envContent += `

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=mydb`;
    }

    fs.writeFileSync(
      path.join(projectDir, '.env'),
      envContent
    );

    // Folder structure
    const srcDir = path.join(projectDir, 'src');

    const folders = [
      'routes',
      'controllers',
      'services',
      'middlewares',
      'utils',
      'constants',
      'models',
      'database'
    ];

    fs.mkdirSync(srcDir, {
      recursive: true
    });

    folders.forEach(folder => {
      fs.mkdirSync(
        path.join(srcDir, folder),
        { recursive: true }
      );
    });

    // Database connection file
    let connectionContent = '';

    if (database === 'MongoDB') {
      connectionContent = `
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1);
  }
};
`;
    }

    if (database === 'MySql') {
      connectionContent = `
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();

    console.log('MySQL Connected Successfully');

    connection.release();
  } catch (error) {
    console.error('MySQL Connection Failed:', error);
    process.exit(1);
  }
};
`;
    }

    fs.writeFileSync(
      path.join(srcDir, 'database', 'connection.ts'),
      connectionContent.trim()
    );

    // index.ts
    fs.writeFileSync(
      path.join(srcDir, 'index.ts'),
      `
import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { connectDB } from './database/connection';

dotenv.config();

const init = async () => {
  await connectDB();

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost'
  });

  server.route({
    method: 'GET',
    path: '/api/health',
    handler: () => {
      return {
        success: true,
        message: 'Server is running'
      };
    }
  });

  await server.start();

  console.log(
    \`Server running on \${server.info.uri}\`
  );
};

init();
`.trim()
    );

    // Sample model
    fs.writeFileSync(
      path.join(srcDir, 'models', 'example.model.ts'),
      ''
    );

    // Boilerplate files
    fs.writeFileSync(
      path.join(srcDir, 'routes', 'example.routes.ts'),
      ''
    );

    fs.writeFileSync(
      path.join(srcDir, 'controllers', 'example.controller.ts'),
      ''
    );

    fs.writeFileSync(
      path.join(srcDir, 'services', 'example.service.ts'),
      ''
    );

    fs.writeFileSync(
      path.join(srcDir, 'middlewares', 'auth.middleware.ts'),
      ''
    );

    fs.writeFileSync(
      path.join(srcDir, 'utils', 'helper.ts'),
      ''
    );

    fs.writeFileSync(
      path.join(srcDir, 'constants', 'constants.ts'),
      ''
    );

    console.log(
      `Hapi + TypeScript + ${database} project created successfully in "${projectDir}"`
    );
  }
}

export default MyHapi;