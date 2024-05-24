import { useRef, useState } from 'react';
import clsx from 'clsx';

import { FileUpload } from '../FileUpload/FileUpload.tsx';
import { ImagePreview, ImageSize } from '../ImagePreview/ImagePreview.tsx';
import { Resizer } from '../Resizer/Resizer.tsx';
import {
	Box,
	getScale,
	isBoxInside,
	scaleBox,
	scaleSize,
	Size,
} from '../../utils/box.ts';
import { crop, download, remoteCrop, throttle } from '../../utils/utils.ts';
import { Actions } from '../Actions/Action.tsx';

import styles from './App.module.scss';

function App() {
	// Сохраняем файлы, которые загрузил пользователь,
	// объекты должны быть неизменными иначе потеряем к ним доступ
	const [files, setFiles] = useState<File[]>([]);
	// Сохраняем координаты и размеры области для обрезки
	const [box, setBox] = useState<Box>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});
	// Сохраняем размеры изображения и минимальные и максимальные размеры области для обрезки
	const [size, setSize] = useState<{
		image: ImageSize; // размеры изображения (оригинальное и после отрисовки)
		min: Size;
		max: Size;
	} | null>(null);
	// Пока еще нет сервера, а проверить наши вычисления на практике хочется,
	// поэтому используем ref для доступа к изображению
	// и передаем его в функцию crop для локальной обрезки
	const ref = useRef<HTMLImageElement | null>(null);

	// Действия при нажатии на кнопку "Crop and download"
	const onCrop = () => {
		const cropSize = scaleBox(
			box,
			getScale(size!.image.rendered, size!.image.natural)
		);
		// Если в настройках установлен сервер, отправляем запрос на обрезку
		if (import.meta.env.VITE_CROP_API) {
			// @todo: можно было бы проверять доступность сервера
			void remoteCrop('/api/crop', files[0], cropSize);
		} else {
			// Иначе обрезаем изображение локально
			try {
				download(crop(ref.current!, cropSize), 'cropped.png');
			} catch (e) {
				console.error(e);
			}
		}
	};

	// Действия при нажатии на кнопку "Reset"
	const onReset = () => {
		setFiles([]);
		setSize(null);
		setBox({
			x: 0,
			y: 0,
			width: 0,
			height: 0,
		});
	};

	// Пересчитываем масштаб области для обрезки при изменении размеров окна
	const onScale = throttle((image: ImageSize) => {
		if (size) {
			setSize((prev) => {
				const scale = getScale(size.image.rendered, image.rendered);
				console.log(scale);
				setBox((prev) => scaleBox(prev, scale));
				return {
					...prev,
					image,
					min: scaleSize(prev!.min, scale),
					max: scaleSize(prev!.max, scale),
				};
			});
		}
	}, 100);

	// Обработчик изменения размера окна браузера
	const onResize = (image: ImageSize) => {
		// Первый раз устанавливаем размеры изображения и области для обрезки
		if (size === null) {
			setSize({
				image,
				min: {
					width: 50,
					height: 50,
				},
				max: {
					width: image.rendered.width,
					height: image.rendered.height,
				},
			});
			setBox({
				x: 0,
				y: 0,
				width: image.rendered.width,
				height: image.rendered.height,
			});
		} else onScale(image); // Дальше, при изменении размеров окна, пересчитываем масштаб
	};

	return (
		<main className={styles.app}>
			{files[0] ? (
				<div className={styles.container}>
					<ImagePreview
						ref={ref}
						file={files[0]}
						setSize={onResize}
						className={styles.preview}
					/>
					{size && (
						<Resizer
							value={box}
							onChange={setBox}
							className={styles.resizer}
							min={size.min}
							max={size.max}
						/>
					)}
				</div>
			) : (
				<FileUpload
					value={files}
					onChange={setFiles}
					fileTypes={['image/jpeg', 'image/png']}
					maxSize={1024 * 1024 * 2}
					className={styles.dropzone}
				/>
			)}

			<Actions
				className={styles.actions}
				items={[
					{
						className: clsx('yellow', 'button'),
						label: 'Crop and download',
						onClick: onCrop,
						isDisabled: !(
							files.length !== 0 &&
							size?.max &&
							isBoxInside(box, size.max)
						),
					},
					{
						className: clsx('fuchsia', 'button'),
						label: 'Reset',
						onClick: onReset,
						isDisabled: files.length === 0,
					},
				]}
			/>
		</main>
	);
}

export default App;
