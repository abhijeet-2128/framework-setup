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