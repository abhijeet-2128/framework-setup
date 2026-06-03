import Koa from 'koa';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = new Koa();

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});