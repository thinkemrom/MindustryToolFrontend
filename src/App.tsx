import './App.css';
import './styles.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { Suspense, useEffect, useState } from 'react';

const Map = React.lazy(() => import('./routes/map/MapPage'));
const Home = React.lazy(() => import('./routes/home/HomePage'));
const User = React.lazy(() => import('./routes/user/UserPage'));
const Logic = React.lazy(() => import('./routes/logic/LogicPage'));
const Schematic = React.lazy(() => import('./routes/schematic/SchematicPage'));
const Login = React.lazy(() => import('./routes/login/LoginPage'));
const Upload = React.lazy(() => import('./routes/upload/UploadSchematicPage'));
const Admin = React.lazy(() => import('./routes/admin/AdminPage'));
const Forum = React.lazy(() => import('./routes/forum/ForumPage'));

import OAuth2RedirectHandler from './routes/login/OAuth2RedirectHandler';
import PrivateRoute from './components/router/PrivateRoute';
import NavigationBar from './components/navigation/NavigationBar';
import AdminRoute from './components/router/AdminRoute';
import Loading from './components/common/Loading';
import UserInfo from './routes/user/UserInfo';

import { ACCESS_TOKEN, WEB_VERSION } from './config/Config';
import { API } from './API';

function App() {
	const [currentUser, setCurrentUser] = useState<UserInfo>();
	const [loading, setLoading] = useState<boolean>(true);

	const start = Date.now();
	API.REQUEST.get('https://mindustry-tool-backend.onrender.com/api/v1/ping') //
		.then(() => console.log(`Ping: ${Date.now() - start}ms`));

	useEffect(() => {
		setLoading(true);
		let accessToken = localStorage.getItem(ACCESS_TOKEN);
		if (accessToken) {
			API.setBearerToken(accessToken);
			API.REQUEST.get('/users') //
				.then((result) => {
					if (result.status === 200) handleLogin(result.data);
					else localStorage.removeItem(ACCESS_TOKEN);
				})
				.catch((error) => handleLogOut())
				.finally(() => setLoading(false));
		} else setLoading(false);
	}, []);

	function handleLogin(user: UserInfo) {
		if (user) {
			setCurrentUser(user);
		} else handleLogOut();
	}

	function handleLogOut() {
		setCurrentUser(undefined);
		localStorage.removeItem(ACCESS_TOKEN);
	}

	return (
		<div className='app image-background'>
			<Router>
				<img className='mindustry-logo' src='https://cdn.discordapp.com/attachments/1010373926100148356/1106488674935394394/a_cda53ec40b5d02ffdefa966f2fc013b8.gif' alt='Error' hidden></img>
				{!loading &&
					(currentUser ? (
						<button className='logout-button dark-background' type='button' onClick={() => handleLogOut()}>
							Logout
						</button>
					) : (
						<a className='logout-button dark-background' href='/login'>
							Login
						</a>
					))}
				<NavigationBar user={currentUser} />
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/map' element={<Map />} />
						<Route path='/home' element={<Home />} />
						<Route path='/logic' element={<Logic />} />
						<Route path='/login' element={<Login />} />
						<Route path='/upload' element={<Upload user={currentUser} />} />
						<Route path='/schematic' element={<Schematic user={currentUser} />} />
						<Route path='/forum/*' element={<Forum></Forum>}></Route>
						<Route
							path='/user'
							element={
								<PrivateRoute loading={loading} user={currentUser}>
									<User user={currentUser} />
								</PrivateRoute>
							}
						/>
						<Route
							path='/admin'
							element={
								<AdminRoute loading={loading} user={currentUser}>
									<Admin user={currentUser} />
								</AdminRoute>
							}
						/>
						<Route path='/oauth2/redirect' element={<OAuth2RedirectHandler />} />
					</Routes>
				</Suspense>
				<footer className='web-version'>{WEB_VERSION}</footer>
			</Router>
		</div>
	);
}

export default App;
function setBearerToken(accessToken: string) {
	throw new Error('Function not implemented.');
}
