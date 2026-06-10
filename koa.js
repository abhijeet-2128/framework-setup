import path from 'path';
import fs from 'fs';
import { execa } from 'execa';

class MyKoa {
  async setupKoa(projectDir, database) {
    console.log('Setting up Koa...');

    // Initialize project
    await execa('npm', ['init', '-y'], { cwd: projectDir });
    // await execa('npm', ['install', 'mongoose'], { cwd: projectDir });
    // Install dependencies
    await execa(
      'npm',
      ['install', 'koa', '@koa/router', 'dotenv'],
      { cwd: projectDir }
    );

    // Install dev dependencies
    await execa(
      'npm',
      [
        'install',
        '-D',
        'typescript',
        'ts-node',
        '@types/node',
        '@types/koa',
        '@types/koa__router'
      ],
      { cwd: projectDir }
    );

    const packageJsonPath = path.join(
      projectDir,
      'package.json'
    );

    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf-8')
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
    // fs.writeFileSync(
    //     path.join(projectDir, '.env'),
    //     `PORT=3000
    //      MONGO_URI=mongodb://localhost:27017/mydb
    //    `.trim()
    //   );
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

    fs.mkdirSync(srcDir, { recursive: true });

    folders.forEach((folder) => {
      fs.mkdirSync(path.join(srcDir, folder), {
        recursive: true
      });
    });

    // index.ts
    fs.writeFileSync(
      path.join(srcDir, 'index.ts'),
      `
import Koa from 'koa';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = new Koa();

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});
`.trim()
    );

    // routes/index.ts
    fs.writeFileSync(
      path.join(srcDir, 'routes', 'index.ts'),
      `
import Router from '@koa/router';

const router = new Router({
  prefix: '/api'
});

router.get('/health', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'Server is running'
  };
});

export default router;
`.trim()
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

    // fs.writeFileSync(
    //   path.join(srcDir, 'database', 'connection.ts'),
    //   ''
    // );

    let connectionFileContent = '';

    if (database === 'MongoDB') {
      await execa('npm', ['install', 'mongoose'], {
        cwd: projectDir
      });
      connectionFileContent = `
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
    } else if (database === 'MySql') {
      await execa('npm', ['install', 'mysql2'], {
        cwd: projectDir
      });
      connectionFileContent = `
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
      connectionFileContent.trim()
    );
    fs.writeFileSync(
      path.join(srcDir, 'models', 'example.model.ts'),
      ''
    );

    console.log(
      `Koa + TypeScript project structure created successfully in "${projectDir}"`
    );
  }
}

export default MyKoa;