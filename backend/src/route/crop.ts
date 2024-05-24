import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import debug from 'debug';

import { upload } from '../middleware/upload';
import { Box, boxSchema } from '../lib/types';
import { cropImage } from '../lib/image';

const router = express.Router();
const log = debug('app:crop');

router.post(
	'/crop',
	upload.single('photo'),
	async (req: Request, res: Response, next: NextFunction) => {
		const { value, error } = boxSchema.validate(req.body);
		if (error) {
			return next(error);
		}
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		log('Cropping image', req.file.filename, 'to', JSON.stringify(value));
		const output = path.join(
			path.dirname(req.file.path),
			'cropped_' + req.file.filename
		);
		await cropImage(req.file.path, output, value as Box);
		log('Cropped image saved to', output);

		// Можно было бы сразу удалять файлы,
		// но так как они использовались для отправки,
		// то в Windows они могут быть заблокированы.
		// Поэтому на практике лучше чистить директорию
		// от старых файлов через крон.
		res.download(output, req.file.filename);
	}
);

export default router;
