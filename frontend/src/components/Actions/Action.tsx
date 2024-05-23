type Action = {
	className?: string;
	label: string;
	onClick: () => void;
	isDisabled?: boolean;
};

interface ActionsProps {
	className?: string;
	items: Action[];
}

/**
 * Компонент для отображения списка действий
 * @param items
 * @param className
 * @constructor
 */
export function Actions({ items, className }: ActionsProps) {
	return (
		<div className={className}>
			{items.map((item, index) => (
				<button
					key={index}
					className={item.className}
					disabled={item.isDisabled}
					onClick={item.onClick}
				>
					{item.label}
				</button>
			))}
		</div>
	);
}
