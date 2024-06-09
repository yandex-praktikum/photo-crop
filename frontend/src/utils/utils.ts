import React from 'react';
import { Box } from './box.ts';

/**
 * Функция для проверки, является ли значение MutableRefObject
 * @param value
 */
export const isMutableRef = (
	value: unknown
): value is React.MutableRefObject<unknown> => {
	return !!value && Object.hasOwn(value as object, 'current');
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

export function promiseState(promise: Promise<unknown>) {
	const pendingState = { status: 'pending' };

	return Promise.race([promise, pendingState]).then(
		(value) =>
			value === pendingState ? value : { status: 'fulfilled', value },
		(reason) => ({ status: 'rejected', reason })
	);
}
