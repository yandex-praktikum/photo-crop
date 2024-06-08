import { useReducer, useState } from 'react';
import clsx from 'clsx';

import { FileUpload } from '../FileUpload/FileUpload.tsx';
import { getScale, isBoxInside, scaleBox } from '../../utils/box.ts';
import { remoteCrop } from '../../utils/utils.ts';
import { Actions } from '../Actions/Action.tsx';

import styles from './App.module.scss';
import { Cropper } from '../Cropper/Cropper.tsx';
import { cropReducer, InitialCropState } from '../Cropper/Reducer.tsx';

function App() {
	// Сохраняем файлы, которые загрузил пользователь,
	// объекты должны быть неизменными иначе потеряем к ним доступ
	const [files, setFiles] = useState<File[]>([]);
	const [state, dispatch] = useReducer(cropReducer, InitialCropState);

	// Действия при нажатии на кнопку "Crop and download"
	const onCrop = () => {
		const cropSize = scaleBox(
			state.cropSettings[state.selected].box,
			getScale(
				state.cropSettings[state.selected].size!.image.rendered,
				state.cropSettings[state.selected].size!.image.natural
			)
		);
		// Если в настройках установлен сервер, отправляем запрос на обрезку
		if (import.meta.env.VITE_CROP_API) {
			// @todo: можно было бы проверять доступность сервера
			void remoteCrop(import.meta.env.VITE_CROP_API, files[0], cropSize);
		}
	};

	// Действия при нажатии на кнопку "Reset"
	const onReset = () => {
		dispatch({ type: 'RESET' });
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
					maxSize={1024 * 1024 * 2}
					className={styles.dropzone}
				/>
			</Cropper>

			<Actions
				className={styles.actions}
				items={[
					{
						className: clsx('yellow', 'button'),
						label: 'Crop and download',
						onClick: onCrop,
						isDisabled: !(
							files.length !== 0 &&
							state.cropSettings[state.selected].size?.max &&
							isBoxInside(
								state.cropSettings[state.selected].box,
								state.cropSettings[state.selected].size!.max
							)
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
