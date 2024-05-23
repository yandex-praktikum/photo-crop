import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DropZone } from './DropZone.tsx';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: 'UI/DropZone',
	component: DropZone,
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
		onDrop: fn(() => {}),
		onDragOver: fn(() => {}),
		onDragEnd: fn(() => {}),
		onChange: fn(() => {}),
	},
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
	args: {
		accept: 'image/jpeg, image/png',
		allowedSize: '1MB',
		allowedExt: 'jpg, png',
		dragging: false,
		error: null,
	},
};

export const Allowed: Story = {
	args: {
		accept: 'image/jpeg, image/png',
		allowedSize: '1MB',
		allowedExt: 'jpg, png',
		dragging: true,
		error: null,
	},
};

export const Forbidden: Story = {
	args: {
		accept: 'image/jpeg, image/png',
		allowedSize: '1MB',
		allowedExt: 'jpg, png',
		dragging: false,
		error: 'File type not allowed',
	},
};
