import { Box } from './box.ts';
import { download } from './utils.ts';

/**
 * Функция для обрезки изображения на сервере
 * @param url
 * @param file
 * @param box
 */
export async function remoteCrop(url: string, file: File, box: Box) {
	const form = new FormData();
	form.append('photo', file);
	form.append('x', box.x.toString());
	form.append('y', box.y.toString());
	form.append('width', box.width.toString());
	form.append('height', box.height.toString());

	const response = await fetch(url, {
		method: 'POST',
		// Для следующих типов Content-Type браузер автоматически устанавливает заголовок
		// Если в body передать FormData, то отправляем как multipart/form-data
		// Если передать URLSearchParams, то отправляем как application/x-www-form-urlencoded
		// Если передать строку, то отправляем как text/plain
		// А чтобы передавать JSON, нужно установить заголовок вручную
		body: form,
	});
	// Так мы могли бы получить имя с сервера
	//const filename = response.headers.get('Content-Disposition')?.split('filename=')[1];

	// Получаем бинарные данные изображения
	const data = await response.blob();

	// Создаем URL для скачивания, это не то же самое что и Data URL
	// Data URL - это base64-строка,
	// а URL.createObjectURL - это ссылка на объект в памяти браузера
	const dataUrl = URL.createObjectURL(data);

	// Инициируем скачивание файла.
	// Попробуйте передать сюда filename, чтобы сохранить файл с именем с сервера
	// Но на практике это не всегда работает, так как браузер может добавить _ в начале и в конце
	// Поэтому лучше всего устанавливать имя файла вручную
	// К тому же у нас есть имя оригинального файла выбранного пользователем
	// Просто добавим к нему префикс или суффикс
	download(dataUrl, `cropped_${file.name}`);

	// Освобождаем память, занимаемую объектом
	URL.revokeObjectURL(url);
}

type UploadOptions = {
	onProgress?: (progress: number) => void;
	timeout?: number;
	signal?: AbortSignal;
};

/**
 * Функция для загрузки файла на сервер c отслеживанием прогресса
 * @param file - файл для загрузки
 * @param url - адрес сервера
 * @param options
 */
export function uploadFile(file: File, url: string, options: UploadOptions) {
	const { onProgress, timeout, signal } = options || {};
	const xhr = new XMLHttpRequest();
	xhr.timeout = timeout || 2000; // 2 секунды по умолчанию

	// Создаем объект FormData и добавляем туда файл
	const fileData = new FormData();
	fileData.append('photo', file);

	return {
		// Функция для ручной отмены загрузки
		abort: () => xhr.abort(),
		// Функция для инициации загрузки файла
		upload: (): Promise<{ id: string }> => {
			return new Promise((resolve, reject) => {
				function errorAction(event: ProgressEvent<XMLHttpRequestEventTarget>) {
					reject(event.type);
				}

				// Устанавливаем обработчики событий до вызова open

				// Отслеживаем прогресс загрузки
				xhr.upload.addEventListener('progress', (event) => {
					onProgress?.(Math.floor((event.loaded / event.total) * 10000) / 100);
				});

				// Отслеживаем окончание загрузки
				xhr.upload.addEventListener('loadend', (event) => {
					if (event.loaded !== 0) onProgress?.(100);
				});

				// Чтобы получить ответ от сервера, нужно отслеживать событие readystatechange
				xhr.onreadystatechange = () => {
					if (xhr.readyState === 4) { // ответ загружен в браузер
						resolve(JSON.parse(xhr.response));
					}
				};

				xhr.upload.addEventListener('error', errorAction);
				xhr.upload.addEventListener('abort', errorAction);
				xhr.upload.addEventListener('timeout', errorAction);

				// Для отмены загрузки по сигналу отмены
				signal?.addEventListener('abort', () => {
					xhr.abort();
					reject('aborted');
				});

				// Открываем соединение и отправляем файл
				xhr.open('POST', url, true);
				xhr.send(fileData);
			});
		},
	};
}

type PullOptions = {
	timeout: number;
	signal?: AbortSignal;
};

/**
 * Функция для опроса сервера на наличие результата
 * @param url - адрес сервера
 * @param options
 */
export function pull<T>(url: string, options: PullOptions): Promise<T> | never {
	let isAborted = false;

	// Функция для проверки ответа сервера
	const check = (response: Response): Promise<T> => {
		switch (response.status) {
			case 200:
				return response.json();
			case 202:
				return Promise.reject('running');
			default:
				return Promise.reject(response.statusText);
		}
	};

	// Функция для отправки запроса на сервер
	const request = (): Promise<T> =>
		fetch(url, {
			signal: options.signal,
		}).then(check);

	// Функции для ограничения времени ожидания
	const timeout = () =>
		new Promise<T>((_, reject) => {
			setTimeout(() => {
				isAborted = true;
				reject('timeout');
			}, options.timeout);
		});

	// Функция для задержки перед следующим запросом
	const pause = (time: number) =>
		new Promise<T>((resolve) => {
			setTimeout(resolve, time);
		});

	// Функция для рекурсивного опроса сервера
	const tryPull = async (wait: number = 0): Promise<T> => {
		try {
			return await request();
		} catch (err) {
			if (!isAborted && err === 'running') {
				// Повторяем опрос через некоторое время
				await pause(wait);
				return tryPull(wait > 0 ? wait * 2 : 500);
			}
			throw err;
		}
	};

	return Promise.race([
		tryPull(),// Периодически с замедлением опрашиваем сервер
		timeout() // Если сервер не ответил вовремя, то завершаем работу
	]);
}

export interface CropTask {
	photo: string;
	fileName: string;
	box: Box;
}

export interface CropResult {
	result: string;
}

// Функция для отправки задачи на сервер
export async function sendCropTask(
	url: string,
	task: CropTask[]
): Promise<string> {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(task),
	});
	const result = await response.json();
	return result.task;
}
