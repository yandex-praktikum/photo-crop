import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Resizer } from './Resizer.tsx';
import { useState } from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const min = 50;
const max = 250;

const meta = {
	title: 'Component/Resizer',
	component: Resizer,
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
		min: { width: min, height: min },
		max: { width: max, height: max },
	},
} satisfies Meta<typeof Resizer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
	args: {
		value: { x: 0, y: 0, width: 0.5 * max, height: 0.5 * max },
	},
	render: ({ value, onChange, min, max }) => {
		const [size, setSize] = useState(value);
		return (
			<div
				style={{
					width: 250,
					height: 250,
					background: 'rgba(0,0,0,0.1)',
				}}
			>
				<Resizer
					value={size}
					onChange={(box) => {
						setSize(box);
						onChange(box);
					}}
					min={min}
					max={max}
				/>
			</div>
		);
	},
};
