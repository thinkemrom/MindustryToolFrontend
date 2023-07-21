import './LoadingSpinner.css';
import 'src/styles.css';

import React from 'react';

export default function LoadingSpinner() {
	return (
		<div className='flex-center w100p medium-padding'>
			<div className='loading-spinner' />
		</div>
	);
}
