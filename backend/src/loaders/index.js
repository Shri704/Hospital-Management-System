import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import routes from '../routes/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { apiLimiter } from '../middleware/rateLimit.js';


export const createApp = () => {
const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));


app.get('/', (_req, res) => res.json({ ok: true, name: 'HMS API' }));
app.use('/api', apiLimiter, routes);


app.use((req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`)));


// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
const status = err.statusCode || 500;
res.status(status).json(new ApiResponse({
statusCode: status,
message: err.message || 'Server error',
data: null,
meta: { errors: err.errors || [] }
}));
});


return app;
};