import React from 'react';
import clsx from 'clsx';
import styles from './DropZone.module.scss';

interface DropZoneProps {
	className?: string;
	dragging: boolean;
	error: string | null;
	onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
	onDragEnd: () => void;
	onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	accept: string;
	allowedSize: string;
	allowedExt: string;
}

export function DropZone(props: DropZoneProps) {
	return (
		<label
			className={clsx(styles.container, props.className, {
				[styles.dragging]: props.dragging,
				[styles.allow]: props.dragging,
				[styles.forbidden]: !!props.error,
			})}
			onDragOver={props.onDragOver}
			onDragEnd={props.onDragEnd}
			onDrop={props.onDrop}
		>
			<input
				type="file"
				hidden
				id="browse"
				onChange={props.onChange}
				accept={props.accept}
				multiple
			/>
			{props.error ? (
				<p className="error">{props.error}</p>
			) : (
				<>
					<p>Drop file here or click to select file to upload.</p>
					<p>
						Limit {props.allowedSize} per file. Supported files:{' '}
						{props.allowedExt}
					</p>
				</>
			)}
		</label>
	);
}
