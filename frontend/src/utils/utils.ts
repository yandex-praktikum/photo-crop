import React from 'react';
import { Box } from './box.ts';

/**
 * Функция для проверки, является ли значение MutableRefObject
 * @param value
 */
export const isMutableRef = (
	value: unknown
): value is React.MutableRefObject<unknown> => {
	return Object.hasOwn(value as object, 'current');
};

/**
 * Функция для ограничения частоты вызова функции
 * @param fn
 * @param delay
 */
export function throttle<T extends (...args: never[]) => void>(
	fn: T,
	delay: number
) {
	let last = 0;
	return function (...args: Parameters<T>) {
		const now = Date.now();
		if (now - last < delay) return;
		last = now;
		fn(...args);
	};
}

/**
 * Функция для обрезки изображения прямо в браузере
 * @param image dom-элемент с загруженным изображением
 * @param box объект с координатами и размерами области для обрезки
 */
export function crop(image: HTMLImageElement, box: Box): string {
	// Создаем холст и получаем 2d контекст для редактирования
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	// 2D контекст есть почти всегда, но на всякий случай проверим
	if (ctx) {
		// Устанавливаем размеры холста
		canvas.width = box.width;
		canvas.height = box.height;

		// Рисуем изображение на холсте
		ctx.drawImage(
			image, // источник изображения, откуда берем пиксели для рисования
			box.x, // координата x (image), с которой начинаем рисовать
			box.y, // координата y (image), с которой начинаем рисовать
			box.width, // ширина (image), которую рисуем
			box.height, // высота (image), которую рисуем
			0, // координата x (canvas), куда начинаем рисовать
			0, // координата y (canvas), куда начинаем рисовать
			box.width, // ширина (canvas), которую рисуем
			box.height // высота (canvas), которую рисуем
		);

		// Возвращаем изображение в формате base64
		return canvas.toDataURL('image/png');
	} else {
		throw new Error('Could not get 2d context');
	}
}

/**
 * Функция для форсированного скачивания файла по URL
 * через эмуляцию клика по ссылке
 * @param url адрес или base64-строка файла
 * @param name имя файла
 */
export function download(url: string, name: string) {
	const a = document.createElement('a');
	a.href = url;
	// Устанавливаем атрибут download, чтобы браузер понял, что нужно скачать файл
	// Если установить свое имя сгенерированное в коде, то файл будет скачиваться с этим именем
	// Но если используем что-то с сервера, например имя из заголовков,
	// то например Chrome добавит к имени _ (например _file.jpg_) в начале и в конце
	a.download = name;
	a.click();
}

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