import React, {
	ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import { Size } from '../../utils/box.ts';
import { isMutableRef } from '../../utils/utils.ts';

export interface ImageSize {
	natural: Size;
	rendered: Size;
}

interface ImagePreviewProps {
	file: File;
	className?: string;
	placeholder?: ReactElement;
	setSize?: (size: ImageSize) => void; // Функция для передачи размеров изображения после загрузки
}

/**
 * Компонент для отображения изображения полученного из File
 */
export const ImagePreview = React.forwardRef<
	HTMLImageElement,
	ImagePreviewProps
>(({ file, className, placeholder, setSize }, forwardedRef) => {
	const [src, setSrc] = useState<string | null>(null);
	const ref = useRef<HTMLImageElement | null>(null);

	const getSize = useCallback(() => {
		if (ref.current && setSize) {
			const { naturalWidth, naturalHeight } = ref.current;
			setSize({
				natural: { width: naturalWidth, height: naturalHeight },
				rendered: {
					width: ref.current.offsetWidth,
					height: ref.current.offsetHeight,
				},
			});
		}
	}, [ref, setSize]);

	useEffect(() => {
		// Создаем объект FileReader для чтения файла,
		// но он будет работать только с файлами,
		// которые были добавлены через input[type="file"] или Drag'n'Drop
		const reader = new FileReader();
		reader.onload = () => {
			setSrc(reader.result as string);
		};
		// Преобразуем файл в Data URL
		reader.readAsDataURL(file);
	}, [file]);

	useEffect(() => {
		window.addEventListener('resize', getSize);
		return () => window.removeEventListener('resize', getSize);
	}, [ref, getSize]);

	return src ? (
		<img
			ref={(el) => {
				// Так как нам нужен доступ к DOM-элементу и внутри и потенциально снаружи,
				// используем ref и forwardedRef
				ref.current = el;
				// Проверяем, является ли forwardedRef MutableRefObject
				if (isMutableRef(forwardedRef)) {
					forwardedRef.current = el;
				} else if (typeof forwardedRef === 'function') {
					// Потому что он может быть и функций, мы должны обработать и этот случай
					forwardedRef(el);
				}
			}}
			onLoad={getSize}
			src={src}
			alt={file.name}
			className={className}
		/>
	) : (
		placeholder ?? <span className={className} />
	);
});
