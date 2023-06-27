import '../../styles.css';
import './VerifySchematicPage.css';

import React, { ChangeEvent, Component, ReactElement, useEffect, useState } from 'react';
import { capitalize } from '../../util/StringUtils';
import { TagSubmitButton } from '../../components/common/TagSubmitButton';
import { LoaderState, MAX_ITEM_PER_PAGE } from '../../config/Config';

import UserName from '../user/LoadUserName';
import SchematicInfo from '../schematic/SchematicInfo';
import LazyLoadImage from '../../components/common/LazyLoadImage';
import Dropbox from '../../components/common/Dropbox';
import SearchBar from '../../components/common/SearchBar';
import { API } from '../../API';
import Tag, { CustomTag, TagChoice } from '../../components/common/Tag';
import { Trans } from 'react-i18next';
import Loading from '../../components/common/Loading';

export const VerifySchematicPage = () => {
	const [loaderState, setLoaderState] = useState<LoaderState>(LoaderState.LOADING);

	const [schematicList, setSchematicList] = useState<SchematicInfo[][]>([[]]);
	const [currentSchematic, setCurrentSchematic] = useState<SchematicInfo>();

	const [showSchematicModel, setShowSchematicModel] = useState(false);

	useEffect(() => {
		getSchematicUploadTag();
		loadPage();
	}, []);

	const [schematicUploadTag, setSchematicUploadTag] = useState<Array<TagChoice>>([]);
	function getSchematicUploadTag() {
		API.REQUEST.get('tag/schematic-upload-tag') //
			.then((result) => {
				let customTagList: Array<CustomTag> = result.data;
				let tagChoiceList: Array<TagChoice> = [];
				let temp = customTagList.map((customTag) => customTag.value.map((v) => new TagChoice(customTag.name, v, customTag.color)));

				temp.forEach((t) => t.forEach((r) => tagChoiceList.push(r)));
				setSchematicUploadTag(tagChoiceList);
			});
	}

	function loadToPage(page: number) {
		setSchematicList([[]]);
		setLoaderState(LoaderState.LOADING);

		for (let i = 0; i < page; i++) {
			API.REQUEST.get(`schematic-upload/page/${i}`)
				.then((result) => {
					if (result.status === 200 && result.data) {
						let schematics: SchematicInfo[] = result.data;

						if (schematics.length < MAX_ITEM_PER_PAGE) setLoaderState(LoaderState.NO_MORE);
						else setLoaderState(LoaderState.MORE);

						setSchematicList([...schematicList]);
					} else setLoaderState(LoaderState.NO_MORE);
				})
				.catch(() => setLoaderState(LoaderState.MORE));
		}
	}

	function loadPage() {
		const lastIndex = schematicList.length - 1;
		const newPage = schematicList[lastIndex].length === MAX_ITEM_PER_PAGE;

		API.REQUEST.get(`schematic-upload/page/${schematicList.length + (newPage ? 0 : -1)}`)
			.then((result) => {
				if (result.status === 200 && result.data) {
					let schematics: SchematicInfo[] = result.data;
					if (newPage) schematicList.push(schematics);
					else schematicList[lastIndex] = schematics;

					if (schematics.length < MAX_ITEM_PER_PAGE) setLoaderState(LoaderState.NO_MORE);
					else setLoaderState(LoaderState.MORE);

					setSchematicList([...schematicList]);
				} else setLoaderState(LoaderState.NO_MORE);
			})
			.catch(() => setLoaderState(LoaderState.MORE));
	}

	const schematicArray: ReactElement[] = [];
	for (let p = 0; p < schematicList.length; p++) {
		for (let i = 0; i < schematicList[p].length; i++) {
			let schematic = schematicList[p][i];
			schematicArray.push(
				<div
					key={p * MAX_ITEM_PER_PAGE + i}
					className='schematic-preview'
					onClick={() => {
						setCurrentSchematic(schematic);
						setShowSchematicModel(true);
					}}>
					<LazyLoadImage className='schematic-image' path={`schematic-upload/${schematic.id}/image`}></LazyLoadImage>
					<div className='schematic-preview-description flexbox-center'>{capitalize(schematic.name)}</div>
				</div>
			);
		}
	}

	class SchematicVerifyPanel extends Component<{ schematic: SchematicInfo }, { tags: TagChoice[]; tag: string }> {
		state = { tags: TagChoice.parseArray(this.props.schematic.tags, schematicUploadTag), tag: '' };

		handleRemoveTag(index: number) {
			this.setState({ tags: [...this.state.tags.filter((_, i) => i !== index)] });
		}

		deleteSchematic(id: string) {
			setShowSchematicModel(false);
			API.REQUEST.delete(`schematic-upload/${id}`) //
				.finally(() => loadToPage(schematicList.length));
		}

		verifySchematic(schematic: SchematicInfo) {
			let form = new FormData();
			const tagString = `${this.state.tags.map((t) => `${t.name}:${t.value}`).join()}`;

			form.append('id', schematic.id);
			form.append('authorId', schematic.authorId);
			form.append('data', schematic.data);

			form.append('tags', tagString);

			API.REQUEST.post('schematic', form) //
				.finally(() => {
					loadToPage(schematicList.length);
					setShowSchematicModel(false);
				});
		}

		handleAddTag(tag: TagChoice) {
			if (!tag) return;
			this.state.tags.filter((q) => q.name !== tag.name);
			this.setState((prev) => ({ tags: [...prev.tags, tag], tag: '' }));
		}

		render() {
			return (
				<div className='schematic-info-container' onClick={(event) => event.stopPropagation()}>
					<LazyLoadImage className='schematic-info-image' path={`schematic-upload/${this.props.schematic.id}/image`}></LazyLoadImage>
					<div className='schematic-info-desc-container small-gap'>
						<span>Name: {capitalize(this.props.schematic.name)}</span>
						<span>
							Author: <UserName userId={this.props.schematic.authorId} />
						</span>
						{this.props.schematic.description && <span>{this.props.schematic.description}</span>}
						{this.props.schematic.requirement && (
							<section className='requirement-container flexbox-row small-gap'>
								{this.props.schematic.requirement.map((r, index) => (
									<span key={index} className='text-center'>
										<img className='small-icon ' src={`/assets/images/items/item-${r.name}.png`} alt={r.name} />
										<span> {r.amount} </span>
									</span>
								))}
							</section>
						)}

						<div className='flexbox-column flex-wrap small-gap'>
							<Dropbox value={this.state.tag} onChange={(event) => this.setState({ tag: event.target.value })}>
								{schematicUploadTag
									.filter((t) => t.name.includes(this.state.tag) || t.value.includes(this.state.tag))
									.map((t, index) => (
										<div key={index} onClick={() => this.handleAddTag(t)}>
											<Trans i18nKey={t.name} /> : <Trans i18nKey={t.value} />
										</div>
									))}
							</Dropbox>
							<div className='tag-container'>
								{this.state.tags.map((t: TagChoice, index: number) => (
									<Tag
										key={index}
										index={index}
										tag={t}
										removeButton={
											<div className='remove-tag-button button-transparent' onClick={() => this.handleRemoveTag(index)}>
												<img src='/assets/icons/quit.png' alt='quit'></img>
											</div>
										}
									/>
								))}
							</div>
						</div>
						<section className='flexbox-center flex-nowrap small-gap'>
							<button type='button' className='button-normal' onClick={() => this.verifySchematic(this.props.schematic)}>
								Verify
							</button>
							<button type='button' className='button-normal' onClick={() => this.deleteSchematic(this.props.schematic.id)}>
								Reject
							</button>
						</section>
					</div>
				</div>
			);
		}
	}

	return (
		<div className='verify-schematic'>
			<section className='schematic-container'>{schematicArray}</section>
			<footer className='schematic-container-footer'>
				{loaderState === LoaderState.LOADING ? (
					<div className='flexbox-center loading-spinner'></div>
				) : (
					<button className='load-more-button button-normal' onClick={() => loadPage()}>
						{loaderState === LoaderState.MORE ? 'Load more' : 'No schematic left'}
					</button>
				)}
			</footer>
			{showSchematicModel === true && currentSchematic !== undefined && (
				<div className='schematic-info-modal model flexbox-center image-background' onClick={() => setShowSchematicModel(false)}>
					<div className='flexbox-center'>
						<div className='schematic-card dark-background'>
							<SchematicVerifyPanel schematic={currentSchematic} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
