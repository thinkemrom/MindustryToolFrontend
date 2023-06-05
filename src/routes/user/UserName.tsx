import UserInfo from './UserInfo';
import './UserName.css';

import React, { Component } from 'react';

export default class UserName extends Component<{ user: UserInfo }> {
	render() {
		return (
			<span className='user-name-card'>
				<a className='name' href={`/user/${this.props.user.id}`}>
					{this.props.user.name}
				</a>
			</span>
		);
	}
}