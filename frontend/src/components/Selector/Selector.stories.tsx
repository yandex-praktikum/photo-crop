import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Selector } from './Selector.tsx';

const meta = {
	title: 'Component/Selector',
	component: Selector,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {},
	// Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
	args: {
		onChange: fn(),
		onAdd: fn(),
	},
} satisfies Meta<typeof Selector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		selected: 2,
		total: 5,
		children: ({ index, className }: { index: number; className: string }) => (
			<img
				src={`https://placehold.co/50x50?text=${index}`}
				className={className}
				alt={`Preview ${index}`}
			/>
		),
	},
};
