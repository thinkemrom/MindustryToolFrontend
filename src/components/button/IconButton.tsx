import 'src/styles.css';

import React from 'react';
import { Icon } from 'src/components/common/Icon';
import Button from 'src/components/button/Button';

interface IconButtonProps {
	className?: string;
	icon: Icon;
	title?: string;
	onClick: () => void;
}

export default function IconButton(props: IconButtonProps) {
	return (
		<Button className={props.className} title={props.title} onClick={() => props.onClick()}>
			<img src={props.icon} alt={props.title} />
		</Button>
	);
}
