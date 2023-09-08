import React from 'react';
import { IconType } from 'src/data/Icons';
import { cn } from 'src/util/Utils';

interface ClearIconButtonProps {
	className?: string;
	icon: IconType;
	title: string;
	onClick: () => void;
}

export default function ClearIconButton({ className, icon, title, onClick }: ClearIconButtonProps) {
	return (
		<button type='button' title={title} onClick={() => onClick()}>
			<img
				className={cn(className)} //
				src={icon}
				alt={title}
			/>
		</button>
	);
}