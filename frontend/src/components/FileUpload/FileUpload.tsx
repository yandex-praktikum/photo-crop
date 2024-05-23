import React, { ChangeEvent, useEffect, useState } from 'react';
import { DropZone } from '../DropZone/DropZone.tsx';

interface FileUploadProps {
	value: File[];
	onChange: (files: File[]) => void;
	fileTypes: string[];
	maxSize: number;
	maxCount?: number;
	className?: string;
	validate?: (file: File) => string | null;
}

/**
 * Компонент для загрузки файлов
 */
export function FileUpload({
	value,
	onChange,
	fileTypes,
	maxSize,
	maxCount,
	className,
	validate,
}: FileUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Обработчик события "dragover", когда мы занесли файл над областью, но еще не отпустили.
	// Проблема в том, что по умолчанию браузеры не позволяют увидеть файл до того как мы его отпустим
	const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		if (!isDragging) {
			setIsDragging(true);
		}
		if (error) {
			setError(null);
		}
	};

	const validateFile = (files: FileList) => {
		if (files.length === 0) {
			setError('No file uploaded');
			return false;
		}
		if (files.length + value.length > (maxCount || 1)) {
			setError('Only one file allowed');
			return false;
		}
		const nextError: string[] = [];
		for (const file of files) {
			if (!fileTypes.includes(file.type)) {
				nextError.push('File ${file.name} has invalid type');
			}
			if (file.size > maxSize) {
				nextError.push('File ${file.name} is too large');
			}
			if (validate) {
				const customError = validate(file);
				if (customError) {
					nextError.push(customError);
				}
			}
		}
		if (nextError.length > 0) {
			setError(nextError.join('; '));
			return false;
		}

		return true;
	};

	const checkFiles = (files: FileList) => {
		if (validateFile(files)) {
			onChange([...value, ...Array.from(files)]);
		}
	};

	// Обработчик события "change" для input[type="file"]
	const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			checkFiles(event.target.files);
		}
	};

	// Обработчик события "drop"
	const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		setIsDragging(false);
		checkFiles(e.dataTransfer.files);
	};

	// Подготавливаем строки вывода разрешенных типов и размера
	const allowedExt = fileTypes
		.map((type) => '.' + type.split('/')[1])
		.join(', ');
	const allowedSize = maxSize / 1024 / 1024 + 'MB';

	useEffect(() => {
		if (error !== null) {
			const timer = setTimeout(() => {
				setError(null);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [error]);

	// Используем заранее подготовленную верстку в другом компоненте
	return (
		<DropZone
			className={className}
			dragging={isDragging}
			error={error}
			onDragOver={onDragOver}
			onDragEnd={() => setIsDragging(false)}
			onDrop={onDrop}
			onChange={onFileChange}
			accept={fileTypes.join(',')}
			allowedSize={allowedSize}
			allowedExt={allowedExt}
		/>
	);
}
