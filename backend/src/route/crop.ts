/**
 * Работаем с задачами по обрезке изображений в три шага:
 * 1. Пользователь отправляет POST запрос на /crop с параметрами обрезки и получаем ID задачи
 * 2. Пользователь отправляет GET запрос на /crop/:task и получает статус задачи
 * 3. Пользователь отправляет GET запрос на /crop/:task/result и получает результат обрезки
 */

import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import debug from 'debug';

import { cropTaskSchema } from '../lib/types';
import { addTask, getTask, TaskErrors } from '../lib/task';

const router = express.Router();
const log = debug('app:crop');

/**
 * Создание задачи обрезки изображения
 * @route POST /crop
 * @response application/json { task: string } - ID задачи
 */
router.post(
	'/crop',
	async (req: Request, res: Response, next: NextFunction) => {
		// Проверяем что задача корректно сформирована
		const { value, error } = cropTaskSchema.validate(req.body);
		if (error) {
			// Если нет, то передаем ошибку дальше
			return next(error);
		}
		// Если все хорошо, то добавляем задачу в очередь
		const task = addTask(value);
		// Возвращаем ID задачи, завершаем запрос, но задача будет выполняться дальше
		res.json({ task });
	}
);

/**
 * Получение статуса задачи обрезки изображения
 * @route GET /crop/:task
 * @response application/json { result: string } - имя файла с обрезанным изображением
 */
router.get('/crop/:task', async (req: Request, res: Response) => {
	log('Try to get task result ', req.params.task);
	try {
		const task = getTask(req.params.task);
		return res.status(200).json({
			result: path.basename(task),
		});
	} catch (err) {
		if (err instanceof Error)
			switch (err.message) {
				case TaskErrors.NOT_FOUND:
					// Если задача не найдена, возвращаем 404 ошибку
					return res.status(404).json({ error: 'Task not found' });
				case TaskErrors.RUNNING:
					// Если задача выполняется это тоже успешный статус, но задача еще не завершена
					return res.status(202).json({ error: 'Task is running' });
			}
		// Если что-то пошло не так, возвращаем 500 ошибку
		return res.status(500).json({ error: 'Internal server error' });
	}
});

/**
 * Получение результата задачи обрезки изображения
 * @route GET /crop/:task/result
 * @response image/* - обрезанное изображение
 */
router.get('/crop/:task/result', async (req: Request, res: Response) => {
	log('Try to get task result ', req.params.task);
	try {
		const task = getTask(req.params.task);
		// В нормальном случае мы окажемся здесь только после того как задача завершится
		return res.sendFile(task);
	} catch (err) {
		return res.status(404).json({ error: 'Task not found' });
	}
});

export default router;
