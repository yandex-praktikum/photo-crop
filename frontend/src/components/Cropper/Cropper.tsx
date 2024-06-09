import { CropActions, CropBox } from './Reducer.tsx';
import { Dispatch, ReactNode } from 'react';
import styles from '../App/App.module.scss';
import { ImagePreview, ImageSize } from '../ImagePreview/ImagePreview.tsx';
import { Resizer } from '../Resizer/Resizer.tsx';
import { throttle } from '../../utils/utils.ts';

type CropperProps = {
	file: File;
	state: CropBox;
	dispatch: Dispatch<CropActions>;
	children: ReactNode;
};

export const Cropper = ({ file, state, dispatch, children }: CropperProps) => {
	// Обработчик изменения размера окна браузера
	const onResize = throttle((image: ImageSize) => {
		dispatch({ type: 'CHANGE_SIZE', payload: image });
	}, 100);

	return file ? (
		<div className={styles.container}>
			<ImagePreview file={file} setSize={onResize} className={styles.preview} />
			{state.size && (
				<Resizer
					value={state.box}
					onChange={(box) => dispatch({ type: 'CHANGE_BOX', payload: box })}
					className={styles.resizer}
					min={state.size.min}
					max={state.size.max}
				/>
			)}
		</div>
	) : (
		children
	);
};
