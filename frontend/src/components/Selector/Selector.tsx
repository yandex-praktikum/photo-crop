import { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Selector.module.scss';

type SelectorProps = {
	selected: number;
	total: number;
	onChange: (index: number) => void;
	onAdd: () => void;
	className?: string;
	children: (props: { index: number; className: string }) => ReactNode;
};

/**
 * Селектор для выбора элемента из списка
 */
export function Selector({
	selected,
	total,
	onChange,
	onAdd,
	children,
	className,
}: SelectorProps) {
	return (
		<div className={clsx(styles.container, className)}>
			{Array.from({ length: total }, (_, index) => (
				<button
					key={index}
					className={clsx(styles.item, {
						[styles.active]: index === selected,
					})}
					onClick={() => onChange(index)}
				>
					{children({ index, className: styles.preview })}
				</button>
			))}
			<button className={clsx(styles.item, styles.add)} onClick={onAdd} />
		</div>
	);
}
