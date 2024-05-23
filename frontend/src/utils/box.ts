// Контролы для изменения размеров и перемещения окна обрезки по изображению
export enum Handle {
	Top = 'top',
	Right = 'right',
	Bottom = 'bottom',
	Left = 'left',
	TopLeft = 'topLeft',
	TopRight = 'topRight',
	BottomLeft = 'bottomLeft',
	BottomRight = 'bottomRight',
	Move = 'move',
}

export interface Point {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface Box extends Point, Size {}

/**
 * Формируем патч изменения окна обрезки по смещению контрола
 * @param handle какой контрол сместили
 * @param dx на сколько сместили по X
 * @param dy на сколько сместили по Y
 *
 * @description
 *
 * Схема расположения контролов [начальная точка]:
 * [TopLeft] 	--- Top 		--- TopRight 		*
 * Left    		--- Move 		--- Right   		*
 * BottomLeft	--- Bottom 	--- BottomRight *
 *
 */
export function getBoxChange(handle: Handle, dx: number, dy: number): Box {
	const update = (x: number, y: number, width: number, height: number) => ({
		x,
		y,
		width,
		height,
	});

	switch (handle) {
		case Handle.Right: // изменение ширины
			return update(0, 0, dx, 0);
		case Handle.Bottom: // изменение высоты
			return update(0, 0, 0, dy);
		case Handle.Left: // изменение ширины и смещение по X
			return update(dx, 0, -dx, 0);
		case Handle.Top: // изменение высоты и смещение по Y
			return update(0, dy, 0, -dy);
		case Handle.BottomRight: // изменение ширины и высоты
			return update(0, 0, dx, dy);
		case Handle.TopLeft: // изменение ширины и высоты и смещение по X и Y
			return update(dx, dy, -dx, -dy);
		case Handle.TopRight: // изменение ширины и высоты и смещение по Y
			return update(0, dy, dx, -dy);
		case Handle.BottomLeft: // изменение ширины и высоты и смещение по X
			return update(dx, 0, -dx, dy);
		default: // смещение по X и Y
			return update(dx, dy, 0, 0);
	}
}

// # Вспомогательные функции для работы с окном обрезки

/**
 * Ограничение значения в диапазоне
 */
export function limit(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Реализация ограничений отрезка внутри контейнера на одной оси
 * @param offset начальная точка отрезка
 * @param size размер отрезка
 * @param offsetChange смещение начальной точки
 * @param sizeChange изменение размера
 * @param minSize минимальный размер
 * @param maxSize максимальный размер
 *
 * @description
 * |[min] ----- [offset] === [offset + size] ----- [max]|
 */
export function limitSideInRange(
	offset: number,
	size: number,
	offsetChange: number,
	sizeChange: number,
	minSize: number,
	maxSize: number
): [number, number] {
	// Для начала просто скопируем текущие значения
	const next = {
		offset: offset,
		size: size,
	};

	// Смещаем весь отрезок без изменения размера
	if (offsetChange !== 0 && sizeChange === 0) {
		next.offset = limit(next.offset + offsetChange, 0, maxSize - next.size);
	}

	// Смещаем начальную точку вправо и уменьшаем размер
	// --[offset=2] ==== [size=4]-----
	// -- >> offset + 2, size - 2
	// ----[offset=4] == [size=2]-----
	if (offsetChange > 0 && sizeChange < 0) {
		// Ограничиваем изменение размера чтобы не выйти за минимальный размер
		const maxSizeChange = next.size - minSize;
		// Ограничиваем изменение начальной точки чтобы не выйти за начало
		next.offset = limit(next.offset + offsetChange, 0, offset + maxSizeChange);
		// Уменьшаем размер с учетом ограничений
		next.size = limit(next.size + sizeChange, minSize, maxSize - next.offset);
	}
	// Смещаем начальную точку влево и увеличиваем размер
	// ----[offset=4] == [size=2]-----
	// -- << offset - 2, size + 2
	// --[offset=2] ==== [size=4]-----
	if (offsetChange < 0 && sizeChange > 0) {
		// Если мы двигаем верхний левый угол, то изменения размера и смещения должны быть равны
		if (Math.abs(offsetChange) === Math.abs(sizeChange)) {
			// Ограничиваем изменение начальной точки чтобы не выйти за начало
			next.offset = limit(next.offset + offsetChange, 0, maxSize - minSize);
			if (offset !== 0) {
				// Если начальная точка не в начале, то увеличиваем размер
				next.size = limit(next.size + sizeChange, minSize, size + offset);
			}
		} else {
			// Отдельно обрабатываем случай, когда изменения размера и смещения разные
			next.offset = limit(next.offset + offsetChange, 0, maxSize - minSize);
			next.size = limit(next.size + sizeChange, minSize, maxSize - next.offset);
		}
	}

	// Увеличиваем размер без изменения начальной точки
	if (offsetChange === 0 && sizeChange !== 0) {
		next.size = limit(next.size + sizeChange, minSize, maxSize - next.offset);
	}

	return [next.offset, next.size];
}

/**
 * Ограничение изменений окна обрезки по двум осям
 * @param box текущее окно обрезки
 * @param change изменение окна обрезки
 * @param min минимальный размер
 * @param max максимальный размер
 */
export function limitBoxChange(
	box: Box,
	change: Box,
	min: Size,
	max: Size
): Box {
	// Ограничиваем изменения по X и Y отдельно
	const [x, width] = limitSideInRange(
		box.x,
		box.width,
		change.x,
		change.width,
		min.width,
		max.width
	);
	const [y, height] = limitSideInRange(
		box.y,
		box.height,
		change.y,
		change.height,
		min.height,
		max.height
	);
	// Возвращаем скорректированное окно обрезки
	return { x, y, width, height };
}

/**
 * Проверка находится ли один прямоугольник внутри другого
 * @param box окно обрезки
 * @param container все изображение
 */
export function isBoxInside(box: Box, container: Size): boolean {
	// Один прямоугольник внутри другого если сумма его ширины и высоты меньше чем у второго
	return (
		box.width - box.x + (box.height - box.y) <
		container.width + container.height
	);
}

/**
 * В браузере изображение будет выводиться не в оригинальном размере,
 * поэтому нужно учитывать масштабирование при изменении размеров браузера
 * и последующем запросе на сервер для обрезки изображения
 * @param previous предыдущий размер
 * @param next следующий размер
 */
export function getScale(previous: Size, next: Size): Size {
	return {
		width: next.width / previous.width,
		height: next.height / previous.height,
	};
}

/**
 * Масштабирование размера
 * @param size размер
 * @param scale масштаб
 */
export function scaleSize(size: Size, scale: Size): Size {
	return {
		width: Math.round(size.width * scale.width),
		height: Math.round(size.height * scale.height),
	};
}

/**
 * Масштабирование окна обрезки
 * @param box окно обрезки
 * @param scale масштаб
 */
export function scaleBox(box: Box, scale: Size): Box {
	return {
		x: Math.round(box.x * scale.width),
		y: Math.round(box.y * scale.height),
		width: Math.round(box.width * scale.width),
		height: Math.round(box.height * scale.height),
	};
}
