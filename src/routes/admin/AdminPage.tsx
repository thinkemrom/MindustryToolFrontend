import './AdminPage.css';
import 'src/styles.css';

import React, { useState } from 'react';
import VerifyPage from 'src/routes/admin/verify/VerifyPage';
import { Trans } from 'react-i18next';
import LogPage from 'src/routes/admin/log/LogPage';

const tabs = ['verify', 'report', 'log'];

export default function AdminPage() {
	const [selectedTab, setSelectedTab] = useState(tabs[0]);

	function renderTab() {
		switch (selectedTab) {
			case tabs[0]:
				return <VerifyPage />;

			case tabs[1]:
				return <>No</>;

			case tabs[2]:
				return <LogPage />;
		}
	}

	return (
		<main id='admin' className='flex-column h100p w100p small-gap small-padding border-box'>
			<section className='grid-row tab-button-container'>
				{tabs.map((name, index) => (
					<button
						key={index}
						title={name}
						type='button'
						className={name === selectedTab ? 'tab-button-selected' : 'tab-button'} //
						onClick={() => setSelectedTab(name)}>
						<Trans i18nKey={name} />
					</button>
				))}
			</section>
			{renderTab()}
		</main>
	);
}
