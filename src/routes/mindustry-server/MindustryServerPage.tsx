import React, { useState } from 'react';
import MindustryServer from 'src/data/MindustryServer';
import Button from 'src/components/Button';
import { Trans } from 'react-i18next';
import ClearIconButton from 'src/components/ClearIconButton';
import useDialog from 'src/hooks/UseDialog';
import { API } from 'src/API';
import { usePopup } from 'src/context/PopupMessageProvider';
import i18n from 'src/util/I18N';
import IfTrueElse from 'src/components/IfTrueElse';
import { Users } from 'src/data/User';
import { useMe } from 'src/context/MeProvider';
import LoadingSpinner from 'src/components/LoadingSpinner';
import ColorText from 'src/components/ColorText';
import useClipboard from 'src/hooks/UseClipboard';
import useInfinitePage from 'src/hooks/UseInfinitePage';
import IfTrue from 'src/components/IfTrue';

export default function MindustryServerPage() {
	const { pages, hasMore, isLoading, loadNextPage, filter } = useInfinitePage<MindustryServer>('mindustry-server', 100);
	const addPopup = usePopup();
	const { dialog, setVisibility } = useDialog();

	function handleAddServer(address: string) {
		setVisibility(false);
		API.postMindustryServer(address) //
			.then(() => addPopup(i18n.t('add-server-success'), 5, 'info'))
			.catch(() => addPopup(i18n.t('add-server-fail'), 5, 'warning'));
	}

	function handleRemoveServer(address: string) {
		setVisibility(false);
		API.deleteServer(address)
			.then(() => addPopup(i18n.t('delete-server-success'), 5, 'info'))
			.catch(() => addPopup(i18n.t('delete-server-fail'), 5, 'warning'))
			.finally(() => filter((data) => data.address !== address));
	}

	pages.sort((a, b) => (b.name ? 1 : 0) - (a.name ? 1 : 0));

	return (
		<main className='box-border flex h-full w-full flex-col gap-2 overflow-auto p-2'>
			<section className='flex flex-row justify-end'>
				<Button className='px-3 py-1' title={i18n.t('submit')} onClick={() => setVisibility(true)}>
					<Trans i18nKey='submit' />
				</Button>
			</section>
			<MindustryServerTable servers={pages} handleRemoveServer={handleRemoveServer} />
			<MindustryServerCards servers={pages} handleRemoveServer={handleRemoveServer} />
			<footer className='flex w-full items-center justify-center'>
				<IfTrueElse
					condition={isLoading}
					whenTrue={<LoadingSpinner />} //
					whenFalse={
						<Button className='px-2 py-1' title={i18n.t('load-more')} onClick={() => loadNextPage()}>
							<IfTrueElse
								condition={hasMore} //
								whenTrue={<Trans i18nKey='load-more' />}
								whenFalse={<Trans i18nKey='no-more' />}
							/>
						</Button>
					}
				/>
			</footer>
			{dialog(<InputAddressDialog onSubmit={handleAddServer} onClose={() => setVisibility(false)} />)}
		</main>
	);
}

interface MindustryServerTableProps {
	servers: MindustryServer[];
	handleRemoveServer: (id: string) => void;
}

function MindustryServerTable({ servers, handleRemoveServer }: MindustryServerTableProps) {
	return (
		<table className='hidden w-full border-collapse border-spacing-x-8 border-spacing-y-2 border border-slate-600 lg:table'>
			<thead>
				<tr className='border border-slate-600 text-left'>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='address' />
					</th>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='ping' />
					</th>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='name' />
					</th>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='description' />
					</th>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='map-name' />
					</th>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='wave' />
					</th>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='players' />
					</th>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='mode' />
					</th>
					<th className='border border-slate-600 p-2'>
						<Trans i18nKey='version' />
					</th>
					<th className='w-6 border border-slate-600 p-2'></th>
				</tr>
			</thead>
			<tbody>
				{servers.map((server) => (
					<MindustryServerTableRow key={server.address} server={server} handleRemoveServer={handleRemoveServer} />
				))}
			</tbody>
		</table>
	);
}

interface MindustryServerTableRowProps {
	server: MindustryServer;
	handleRemoveServer: (id: string) => void;
}

function MindustryServerTableRow({ server, handleRemoveServer }: MindustryServerTableRowProps) {
	const { me } = useMe();

	const copy = useClipboard();

	return (
		<tr className='border border-slate-600 p-2'>
			<td className='border border-slate-600 p-2'>
				<section className='no-scrollbar flex max-w-[200px] flex-row items-center justify-start gap-2 overflow-x-auto'>
					<ClearIconButton title={i18n.t('copy')} icon='/assets/icons/copy.png' onClick={() => copy(server.address)} />
					{server.address}
				</section>
			</td>
			<td className='border border-slate-600 p-2'>{server.ping}</td>
			<td className='border border-slate-600 p-2'>
				<ColorText className='max-w-[200px] overflow-auto' text={server.name} />
			</td>
			<td className='border border-slate-600 p-2'>
				<ColorText className='max-w-[200px] overflow-auto' text={server.description} />
			</td>
			<td className='border border-slate-600 p-2'>
				<ColorText className='max-w-[200px] overflow-auto' text={server.mapname} />
			</td>
			<td className='border border-slate-600 p-2'>{server.wave}</td>
			<td className='border border-slate-600 p-2'>
				<span className='flex flex-row gap-1'>
					<span>{server.players}</span>
					{server.playerLimit ? (
						<>
							<span>/</span>
							<span>{server.playerLimit}</span>
						</>
					) : (
						''
					)}
				</span>
			</td>
			<td className='border border-slate-600 p-2 capitalize'>
				<div className='max-w-[200px] overflow-auto'>{server.modeName ? server.mapname : server.mode}</div>
			</td>
			<td className='border border-slate-600 p-2'>{server.version === -1 ? server.versionType : server.version}</td>
			<IfTrue
				condition={Users.isAdmin(me)}
				whenTrue={
					<td>
						<div className='flex items-center justify-center'>
							<ClearIconButton
								className='h-4 w-4'
								title={i18n.t('delete')}
								icon='/assets/icons/trash-16.png' //
								onClick={() => handleRemoveServer(server.address)}
							/>
						</div>
					</td>
				}
			/>
		</tr>
	);
}

interface MindustryServerCardsProps {
	servers: MindustryServer[];
	handleRemoveServer: (id: string) => void;
}

function MindustryServerCards({ servers, handleRemoveServer }: MindustryServerCardsProps) {
	return (
		<section className='flex flex-col gap-2 lg:hidden'>
			{servers.map((server) => (
				<MindustryServerCard key={server.address} server={server} handleRemoveServer={handleRemoveServer} />
			))}
		</section>
	);
}
interface MindustryServerCardProps {
	server: MindustryServer;
	handleRemoveServer: (id: string) => void;
}

function MindustryServerCard({ server, handleRemoveServer }: MindustryServerCardProps) {
	const { me } = useMe();

	const copy = useClipboard();

	return (
		<section className='no-scrollbar flex h-full w-full flex-col rounded-lg bg-slate-950 p-4'>
			<span className='flex flex-row items-center justify-between'>
				<section className='flex flex-row flex-wrap items-center justify-center gap-2'>
					<span className='flex flex-row gap-2'>
						<ColorText text={server.name ? server.name : server.address} /> | <span className='capitalize'>{server.modeName ? server.mapname : server.mode}</span>
					</span>
					<ClearIconButton className='p-2' title={i18n.t('copy')} icon='/assets/icons/copy.png' onClick={() => copy(server.address)} />
				</section>
				<IfTrue
					condition={Users.isAdmin(me)}
					whenTrue={
						<ClearIconButton
							className='h-4 w-4'
							title={i18n.t('delete')}
							icon='/assets/icons/trash-16.png' //
							onClick={() => handleRemoveServer(server.address)}
						/>
					}
				/>
			</span>
			<section className='flex flex-col'>
				<ColorText text={server.description} />
				<span className='flex gap-2'>
					<span>{server.players}</span>
					{server.playerLimit ? (
						<>
							<span>/</span>
							<span>{server.playerLimit}</span>
						</>
					) : (
						''
					)}
					<Trans i18nKey='players' />
				</span>
				{'Ping: '}
				{server.ping}ms
				<span className='flex flex-row gap-2'>
					<Trans i18nKey='map' />: <ColorText text={server.mapname} />
				</span>
				<span className='flex flex-row gap-2'>
					<Trans i18nKey='wave' />: {server.wave}
				</span>
				<span>
					<Trans i18nKey='version' />: {server.version === -1 ? server.versionType : server.version}
				</span>
			</section>
		</section>
	);
}

interface InputAddressDialogProps {
	onSubmit: (content: string) => void;
	onClose: () => void;
}

function InputAddressDialog({ onClose, onSubmit }: InputAddressDialogProps) {
	const [content, setContent] = useState<string>('');

	return (
		<section className='flex w-[50vw] flex-col gap-2 rounded-lg border-2 border-slate-500 bg-slate-950 p-2'>
			<span className='flex flex-row items-center justify-between p-2'>
				<Trans i18nKey='type-ip-address' />
				<ClearIconButton title={i18n.t('close')} icon='/assets/icons/quit.png' onClick={() => onClose()} />
			</span>
			<input className='bg-bl border-2 border-slate-500 bg-slate-950 p-2 outline-none' type='text' title='address' onChange={(event) => setContent(event.target.value)} />
			<section className='box-border flex w-full flex-row justify-end p-2'>
				<Button className='px-2 py-1' title={i18n.t('submit')} onClick={() => onSubmit(content)}>
					<Trans i18nKey='submit' />
				</Button>
			</section>
		</section>
	);
}
