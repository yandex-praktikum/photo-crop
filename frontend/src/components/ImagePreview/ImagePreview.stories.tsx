import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ImagePreview } from './ImagePreview.tsx';
import { useState } from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: 'Component/ImagePreview',
	component: ImagePreview,
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
		setSize: fn(),
	},
} satisfies Meta<typeof ImagePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
	args: {
		file: new File([''], 'image.jpg', { type: 'image/jpeg' }),
	},
	render: (args) => {
		const [file, setFile] = useState<File | null>(null);
		return file ? (
			<ImagePreview {...args} file={file} />
		) : (
			<input
				type="file"
				onChange={(e) => setFile(e.target.files?.[0] ?? null)}
			/>
		);
	},
};
