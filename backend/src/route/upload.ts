import express, { Request, Response } from 'express';
import debug from 'debug';

import { upload } from '../middleware/upload';
import path from 'path';

const router = express.Router();
const log = debug('app:upload');

/**
 * Upload a file
 * @route POST /upload
 * @response application/json { id: string } - ID of the uploaded file
 */
router.post(
	'/upload',
	// Загружаем по одному файлу, это более гибко
	// и проблема загрузки одного файла не повлияет на другие.
	// Очистку директории загрузки будем делать через cron.
	upload.single('photo'),
	async (req: Request, res: Response) => {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		log('Uploaded file', req.file.filename);
		res.json({
			id: path.basename(req.file.filename, path.extname(req.file.filename)),
		});
	}
);

export default router;
