/**
 * Смысл этого файла в вынесении тяжелых операций за пределы запроса.
 * Для этого у нас есть несколько решений:
 * — создать очередь задач и обрабатывать их в фоне
 * — выделить отдельный процесс для обработки задач и связываться с ним через брокер сообщений или IPC
 *
 * Во втором случае мы можем отдельно масштабировать обработку задач и не перегружать основной процесс.
 * Но, если нагрузка не высокая и нам важно просто не потерять задачу при обрыве соединения,
 * то можно обойтись и без этого. В этом случае можно просто увеличить количество процессов приложения.
 */

import debug from 'debug';
import path from 'path';
import { readFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';

import { ArchiveTask, CroppedFile, CropTask } from './types';
import { UPLOAD_DIR } from '../config';
import { cropImage } from './image';
import { getCurrentDateTime } from './utils';

const log = debug('app:task');

/**
 * Обрезает загруженное изображение по указанным координатам
 * @param photo идентификатор загруженного изображения
 * @param fileName оригинальное имя файла
 * @param box координаты обрезки
 */
export async function cropFile({
	photo,
	fileName,
	box,
}: CropTask): Promise<CroppedFile> {
	// Формирование путей к файлам на сервере чувствительно к безопасности
	// Поэтому используем path.join вместо простой конкатенации,
	// строго проверяем строки используемые для формирования путей,
	// и как можно меньше полагаемся на пользовательский ввод.
	// В данном случае photo это сгенерированный ID, который строго проверен,
	// а в пути мы используем только расширение файла.
	const sourceFile = photo + path.extname(fileName);
	const targetFile = 'cropped_' + fileName;
	const sourcePath = path.join(UPLOAD_DIR, sourceFile);
	const outputPath = path.join(UPLOAD_DIR, targetFile);

	log('Cropping image ', sourceFile, ' to ', JSON.stringify(box));
	await cropImage(sourcePath, outputPath, box);

	return {
		file: outputPath,
		name: fileName,
	};
}

/**
 * Создает архив с указанными файлами
 * @param files список файлов для архивации
 * @param fileName имя архива
 */
export async function createArchive({
	files,
	fileName,
}: ArchiveTask): Promise<string> {
	const zip = new JSZip();
	const folder = zip.folder('crop_' + getCurrentDateTime());
	if (!folder) {
		throw new Error('Failed to create folder in archive');
	}
	for (const { file, name } of files) {
		folder.file(name, await readFile(file));
	}

	const archiveName = `${fileName}_${getCurrentDateTime()}.zip`;
	const targetPath = path.join(UPLOAD_DIR, archiveName);

	log(
		'Create archive ',
		archiveName,
		' with ',
		files.map(({ file }) => path.basename(file))
	);
	// Используем потоки для уменьшения использования памяти так как архив может быть большим
	await pipeline(
		zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }),
		createWriteStream(targetPath)
	);

	return targetPath;
}

// Дальше описываем логику для работы с задачами из запросов

// Ошибки, которые могут возникнуть при работе с задачами
export enum TaskErrors {
	NOT_FOUND = 'Task not found',
	RUNNING = 'Task is still running',
}

// Хранилище задач
const taskMap = new Map<
	string,
	{
		time: number; // Последнее время касания задачи
		result: Promise<string> | string | Error; // Результат выполнения задачи
	}
>();

// Очистка завершенных задач
setInterval(() => {
	// Удаляем задачи, которые завершились более 1 часа назад
	const now = Date.now();
	for (const [id, { time }] of taskMap) {
		if (now - time > 3600000) {
			taskMap.delete(id);
		}
	}
}, 60000);

// Функция для обработки задач
async function worker(task: CropTask[]) {
	const croppedFiles = await Promise.all(task.map(cropFile));
	return createArchive({ files: croppedFiles, fileName: 'crop' });
}

/**
 * Добавляет задачу в обработку
 * @param task задача на обработку
 * @returns идентификатор задачи
 */
export function addTask(task: CropTask[]): string {
	const id = uuidv4();
	const promise = worker(task);
	log('Add task ', id);

	taskMap.set(id, {
		time: Date.now(),
		result: worker(task), // Мы просто оставим тут новый Promise и пойдем дальше
	});

	// А теперь мы можем обработать результаты выполнения задачи асинхронно
	promise
		.then((result) => {
			log('Task ', id, ' completed');
			taskMap.set(id, {
				time: Date.now(),
				result, // Сохраняем результат выполнения задачи
			});
		})
		.catch((err) => {
			log('Task ', id, ' failed: ', err);
			taskMap.set(id, {
				time: Date.now(),
				result: err instanceof Error ? err : new Error(err), // Сохраняем ошибку выполнения задачи
			});
		});

	// Синхронно возвращаем идентификатор задачи
	return id;
}

/**
 * Возвращает результат выполнения задачи
 * @param id идентификатор задачи
 * @returns путь к файлу с результатом
 * @throws {Error} если задача не найдена или еще выполняется
 */
export function getTask(id: string): string | never {
	const task = taskMap.get(id);
	if (!task) throw new Error(TaskErrors.NOT_FOUND);
	if (task.result instanceof Error) throw task.result;
	if (typeof task.result === 'string') return task.result;
	throw new Error(TaskErrors.RUNNING);
}
