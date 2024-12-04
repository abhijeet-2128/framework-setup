import path from 'path';
import { execa } from 'execa';
import fs from 'fs';

class MyExpress {
  async setupExpress(projectDir) {
    console.log('Setting up Express...');

    //initializing the project and install dependencies
    await execa('npm', ['init', '-y'], { cwd: projectDir });
    await execa('npm', ['install', 'express', 'dotenv'], { cwd: projectDir });
    await execa('npm', ['install', '-D', 'typescript', '@types/node', '@types/express', 'ts-node'], { cwd: projectDir });
    
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
app.use(routes);
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
console.log(\`Server is running at http://localhost:\${port}\`);
});
  `.trim()
    );

    fs.writeFileSync(
      path.join(srcDir, 'routes', 'index.ts'),
      `
import { Router } from "express";
const api = Router().use();
export default Router().use('/api', api);
  `.trim()
    );

      fs.writeFileSync(path.join(srcDir, 'routes', 'example.routes.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'controllers', 'example.controller.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'services', 'example.service.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'utils', 'helper.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'middlewares', 'auth.middleware.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'constants', 'constants.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'database', 'connection.ts'), ''),
      fs.writeFileSync(path.join(srcDir, 'models', 'example.model.ts'), ''),

      console.log(`Express + TypeScript project structure created successfully in "${projectDir}"`);
  }
}

export default MyExpress;