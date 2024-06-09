import { useCallback, useRef, useState } from 'react';

import { uploadFile } from '../utils/api.ts';

export interface FileUploaderOptions {
	timeout?: number;
	onProgress?: (progress: number) => void;
}

export function useFileUploader({ onProgress, timeout }: FileUploaderOptions) {
	const [files, _setFiles] = useState<File[]>([]);
	const loadState = useRef<Set<string>>(new Set());
	const fileIds = useRef<Map<File, string>>(new Map());

	const uploadAndGetID = useCallback(
		async (file: File, index: number) => {
			const { upload } = uploadFile(file, import.meta.env.VITE_UPLOAD_API, {
				onProgress: (progress) => {
					onProgress?.(progress);
					console.log(`Progress ${index}: ${progress}%`);
				},
				timeout: timeout || 5000,
			});

			loadState.current.add(file.name);
			const { id } = await upload();
			loadState.current.delete(file.name);
			return {
				id,
				index,
			};
		},
		[onProgress, timeout, loadState]
	);

	const uploadFiles = useCallback(
		async (files: File[]) => {
			const results = await Promise.allSettled(
				files
					.filter((file) => !loadState.current.has(file.name))
					.map(uploadAndGetID)
			);

			for (const result of results) {
				if (result.status === 'fulfilled') {
					const { id, index } = result.value;
					console.log(`File uploaded with ID: ${id}`);
					fileIds.current.set(files[index], id);
				} else {
					console.error(result.reason);
				}
			}
		},
		[fileIds, loadState, uploadAndGetID]
	);

	const setFiles = useCallback(
		(files: File[]) => {
			console.log(`Files: ${files.length}`, files);
			_setFiles((prev) => {
				const newFiles = Array.from(files).filter(
					(file) => !prev.includes(file)
				);
				console.log(`New files: ${newFiles.length}`, newFiles);
				void uploadFiles(newFiles);
				return [...prev, ...newFiles];
			});
		},
		[_setFiles, uploadFiles]
	);

	const getFileID = useCallback(
		(file: File) => {
			return fileIds.current.get(file);
		},
		[fileIds]
	);

	return {
		files,
		setFiles,
		getFileID,
	};
}
