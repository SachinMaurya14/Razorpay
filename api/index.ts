import app from '../server/app';

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default app;
