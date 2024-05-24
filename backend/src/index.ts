import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { errors } from 'celebrate';

import { PORT } from './config';

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(errors());

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});
