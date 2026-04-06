import "dotenv/config";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from '@srv/routes/index';
import documentRouter from '@srv/routes/documentRoutes';
import fileRouter from '@srv/routes/fileRoutes';
import homeRouter from '@srv/routes/homeRoutes';
import searchRouter from '@srv/routes/searchRoutes';
import categoryRouter from '@srv/routes/categoryRoutes';

const app = express();

app.use(cors({
    origin: process.env.FE_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/document', documentRouter);
app.use('/file', fileRouter);
app.use('/home', homeRouter);
app.use('/search', searchRouter);
app.use('/category', categoryRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
