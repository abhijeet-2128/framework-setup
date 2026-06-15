import path from 'path';
import { execa } from 'execa';
import fs from 'fs';

class MyExpress {
  async setupExpress(projectDir, database) {
    console.log('Setting up Express...');

    //initializing the project and install dependencies
    await execa('npm', ['init', '-y'], { cwd: projectDir });
    await execa('npm', ['install', 'express', 'dotenv'], { cwd: projectDir });
    await execa('npm', ['install', '-D', 'typescript', '@types/node', '@types/express', 'ts-node'], { cwd: projectDir });
    // await execa('npm', ['install', 'mongoose'], { cwd: projectDir });
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
    // Create tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: 'ES6',
        module: 'CommonJS',
        rootDir: './src',
        outDir: './dist',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules'],
    };
    fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

    // Create folder structure
    const srcDir = path.join(projectDir, 'src');
    const folders = ['routes', 'controllers', 'services', 'utils', 'middlewares', 'constants', 'models', 'database'];
    fs.mkdirSync(srcDir, { recursive: true });
    folders.forEach((folder) => fs.mkdirSync(path.join(srcDir, folder)));

    // Create basic files
    fs.writeFileSync(
      path.join(srcDir, 'index.ts'),
      `
import express from 'express';
import dotenv from 'dotenv';
import routes from './routes'
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
console.log(\`Server is running at http://localhost:\${port}\`);
});
  `.trim()
    );

    let connectionContent = '';
    // Database connection file
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
    fs.writeFileSync(
      path.join(srcDir, 'routes', 'index.ts'),
      `
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API is working'
  });
});

export default router;
  `.trim()
    );

      fs.writeFileSync(path.join(srcDir, 'routes', 'example.routes.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'controllers', 'example.controller.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'services', 'example.service.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'utils', 'helper.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'middlewares', 'auth.middleware.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'constants', 'constants.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'models', 'example.model.ts'), ''),

      console.log(`Express + TypeScript project structure created successfully in "${projectDir}"`);
  }
}

export default MyExpress;