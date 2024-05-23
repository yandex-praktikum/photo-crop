import { MouseEventHandler, useEffect, useState } from 'react';
import styles from './Resizer.module.scss';
import clsx from 'clsx';
import { throttle } from '../../utils/utils.ts';
import {
	Box,
	getBoxChange,
	Handle,
	limitBoxChange,
	Point,
	Size,
} from '../../utils/box.ts';

interface ResizerProps {
	className?: string;
	value: Box;
	onChange: (box: Box) => void;
	min: Size;
	max: Size;
}

/**
 * Компонент для редактирования размера и положения окна обрезки
 */
export const Resizer = ({
	value,
	onChange,
	className,
	min,
	max,
}: ResizerProps) => {
	const [isResizing, setIsResizing] = useState(false);
	const [currentHandle, setCurrentHandle] = useState<Handle | null>(null);
	const [initialPosition, setInitialPosition] = useState<Point>({
		x: 0,
		y: 0,
	});
	const [previousValue, setPreviousValue] = useState<Box | null>(null);

	// Обработчик нажатия на ручку изменения размера
	const onMouseDown =
		(handle: Handle): MouseEventHandler<HTMLDivElement> =>
		(e) => {
			e.preventDefault();
			e.stopPropagation();
			setIsResizing(true); // При нажатии ставим флаг, что началось движение
			setCurrentHandle(handle); // Запоминаем текущую ручку
			setPreviousValue(value); // Запоминаем предыдущее значение
			setInitialPosition({ x: e.clientX, y: e.clientY }); // Запоминаем начальную позицию курсора
		};

	useEffect(() => {
		const onMouseUp = () => {
			setIsResizing(false); // При отпускании сбрасываем флаг
			setCurrentHandle(null); // Сбрасываем текущую ручку
			setPreviousValue(value); // Сбрасываем предыдущее значение
		};

		// Чтобы не терять события при быстром движении мыши, ограничиваем их частоту
		const onMoveHandler = throttle((e: MouseEvent) => {
			if (isResizing && currentHandle && previousValue) {
				// В быстрой серии событий их порядок не гарантирован,
				// поэтому вычисляем каждый раз исходя из начального значения
				const dx = e.clientX - initialPosition.x;
				const dy = e.clientY - initialPosition.y;

				// Применяем уже проверенные тестами расчеты
				const change = getBoxChange(currentHandle, dx, dy);
				const next = limitBoxChange(previousValue, change, min, max);
				onChange(next);
			}
		}, 100);

		// Надежнее слушать события на document, чтобы не терять события при быстром движении мыши
		document.addEventListener('mousemove', onMoveHandler);
		document.addEventListener('mouseup', onMouseUp);
		return () => {
			document.removeEventListener('mousemove', onMoveHandler);
			document.removeEventListener('mouseup', onMouseUp);
		};
	}, [
		isResizing,
		previousValue,
		initialPosition,
		currentHandle,
		value,
		onChange,
		min,
		max,
	]);

	return (
		<div
			className={clsx(styles.resizer, className)}
			style={{
				width: `${value.width}px`,
				height: `${value.height}px`,
				transform: `translate(${value.x}px, ${value.y}px)`,
			}}
			onMouseDown={onMouseDown(Handle.Move)}
		>
			<div
				className={clsx(styles.handler, styles.top)}
				onMouseDown={onMouseDown(Handle.Top)}
			/>
			<div
				className={clsx(styles.handler, styles.right)}
				onMouseDown={onMouseDown(Handle.Right)}
			/>
			<div
				className={clsx(styles.handler, styles.bottom)}
				onMouseDown={onMouseDown(Handle.Bottom)}
			/>
			<div
				className={clsx(styles.handler, styles.left)}
				onMouseDown={onMouseDown(Handle.Left)}
			/>
			<div
				className={clsx(styles.handler, styles.topLeft)}
				onMouseDown={onMouseDown(Handle.TopLeft)}
			/>
			<div
				className={clsx(styles.handler, styles.topRight)}
				onMouseDown={onMouseDown(Handle.TopRight)}
			/>
			<div
				className={clsx(styles.handler, styles.bottomLeft)}
				onMouseDown={onMouseDown(Handle.BottomLeft)}
			/>
			<div
				className={clsx(styles.handler, styles.bottomRight)}
				onMouseDown={onMouseDown(Handle.BottomRight)}
			/>
		</div>
	);
};
