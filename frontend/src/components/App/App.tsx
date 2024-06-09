import { useEffect, useReducer } from 'react';
import clsx from 'clsx';

import { FileUpload } from '../FileUpload/FileUpload.tsx';
import { getScale, isBoxInside, scaleBox } from '../../utils/box.ts';
import { Actions } from '../Actions/Action.tsx';

import styles from './App.module.scss';
import { Cropper } from '../Cropper/Cropper.tsx';
import { cropReducer, InitialCropState } from '../Cropper/Reducer.tsx';
import { Selector } from '../Selector/Selector.tsx';
import { ImagePreview } from '../ImagePreview/ImagePreview.tsx';
import { useFileUploader } from '../../hooks/useFileUploader.tsx';
import { CropResult, pull, sendCropTask } from '../../utils/api.ts';

function App() {
	// Сохраняем файлы, которые загрузил пользователь,
	// объекты должны быть неизменными иначе потеряем к ним доступ
	const { files, setFiles, getFileID } = useFileUploader({
		timeout: 60000,
	});
	const [state, dispatch] = useReducer(cropReducer, InitialCropState);

	useEffect(() => {
		if (files.length === 0) {
			dispatch({ type: 'RESET' });
		}
		if (files.length > state.cropSettings.length) {
			dispatch({
				type: 'ADD_CROPPER',
				payload: files.length - state.cropSettings.length,
			});
		}
	}, [files, state.cropSettings.length]);

	const downloadArchive = async () => {
		const task = state.cropSettings.map((crop, index) => {
			return {
				photo: getFileID(files[index])!,
				box: scaleBox(
					crop.box,
					getScale(crop.size!.image.rendered, crop.size!.image.natural)
				),
				fileName: files[index].name,
			};
		});

		const id = await sendCropTask(import.meta.env.VITE_CROP_API, task);

		try {
			await pull<CropResult>([import.meta.env.VITE_CROP_API, id].join('/'), {
				timeout: 15000,
			});
			return [import.meta.env.VITE_CROP_API, id, 'result'].join('/');
		} catch (err) {
			console.log(err);
		}
	};

	// Действия при нажатии на кнопку "Crop and download"
	const onCrop = async () => {
		const archiveUrl = await downloadArchive();
		window.open(archiveUrl);
	};

	// Действия при нажатии на кнопку "Reset"
	const onReset = () => {
		dispatch({ type: 'RESET' });
	};

	const isAllCropped = () => {
		let isReady = true;
		state.cropSettings.forEach((crop) => {
			isReady =
				isReady && !!crop.size?.max && isBoxInside(crop.box, crop.size!.max);
		});
		return isReady;
	};

	return (
		<main className={styles.app}>
			<Cropper
				file={files[state.selected]}
				state={state.cropSettings[state.selected]}
				dispatch={dispatch}
			>
				<FileUpload
					value={files}
					onChange={setFiles}
					fileTypes={['image/jpeg', 'image/png']}
					maxSize={1024 * 1024 * 10}
					maxCount={10}
					className={styles.dropzone}
				/>
			</Cropper>

			<Selector
				selected={state.selected}
				total={state.cropSettings.length}
				onChange={(index) => dispatch({ type: 'SELECT', payload: index })}
				onAdd={() => dispatch({ type: 'ADD_CROPPER' })}
			>
				{({ index, className }) => (
					<ImagePreview
						file={files[index]}
						className={clsx(className, styles.icon, {
							[styles.uploaded]: !!getFileID(files[index]),
						})}
						placeholder={
							<img
								className={className}
								src={'https://placehold.co/300x300?text=?'}
								alt={`Preview ${index}`}
							/>
						}
					/>
				)}
			</Selector>

			<Actions
				className={styles.actions}
				items={[
					{
						className: clsx('yellow', 'button'),
						label: 'Crop all and download .ZIP archive',
						onClick: onCrop,
						isDisabled: !(files.length !== 0 && isAllCropped()),
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
