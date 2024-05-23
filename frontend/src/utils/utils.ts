import React from 'react';

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
