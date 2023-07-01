import './App.css';
import './styles.css';

import React, { Suspense, useContext, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Loading from './components/common/loader/Loading';
import UserData from './components/common/user/UserData';
import NavigationPanel from './components/navigation/NavigationPanel';
import AdminRoute from './components/router/AdminRoute';
import PrivateRoute from './components/router/PrivateRoute';
import OAuth2RedirectHandler from './routes/login/OAuth2RedirectHandler';
import { API } from './API';
import { ACCESS_TOKEN, WEB_VERSION } from './config/Config';
import UserDisplay from './routes/user/UserDisplay';
import { TagChoice } from './components/common/tag/Tag';

const Map = React.lazy(() => import('./routes/map/MapPage'));
const Home = React.lazy(() => import('./routes/home/HomePage'));
const User = React.lazy(() => import('./routes/user/UserPage'));
const Logic = React.lazy(() => import('./routes/logic/LogicPage'));
const Schematic = React.lazy(() => import('./routes/schematic/SchematicPage'));
const Login = React.lazy(() => import('./routes/login/LoginPage'));
const Upload = React.lazy(() => import('./routes/upload/UploadSchematicPage'));
const Admin = React.lazy(() => import('./routes/admin/AdminPage'));
const Forum = React.lazy(() => import('./routes/forum/ForumPage'));
const SchematicPreview = React.lazy(() => import('./routes/schematic/SchematicPreviewPage'));

type Context = {
	user: UserData | undefined;
	loading: boolean;
	handleLogout: () => void;
};

const GlobalContext = React.createContext<Context>({ user: undefined, loading: true, handleLogout: () => {} });
export const useGlobalContext = () => useContext(GlobalContext);

function App() {
	const [currentUser, setCurrentUser] = useState<UserData>();
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		ping();
		getUserData();

		TagChoice.getTag('schematic-upload-tag', TagChoice.SCHEMATIC_UPLOAD_TAG);
		TagChoice.getTag('schematic-search-tag', TagChoice.SCHEMATIC_SEARCH_TAG);
	}, []);

	function ping() {
		const start = Date.now();
		API.REQUEST.get('ping') //
			.then(() => console.log(`Ping: ${Date.now() - start}ms`));
	}

	function getUserData() {
		setLoading(true);
		let accessToken = localStorage.getItem(ACCESS_TOKEN);
		if (accessToken) {
			API.setBearerToken(accessToken);
			API.REQUEST.get('/users') //
				.then((result) => handleLogin(result.data))
				.catch(() => handleLogOut())
				.finally(() => setLoading(false));
		} else setLoading(false);
	}

	function handleLogin(user: UserData) {
		if (user) {
			setCurrentUser(user);
		} else handleLogOut();
	}

	function handleLogOut() {
		setCurrentUser(undefined);
		localStorage.removeItem(ACCESS_TOKEN);
	}

	return (
		<main className='app'>
			<GlobalContext.Provider value={{ user: currentUser, loading: loading, handleLogout: handleLogOut }}>
				<Router>
					<img className='mindustry-logo' src='https://cdn.discordapp.com/attachments/1010373926100148356/1106488674935394394/a_cda53ec40b5d02ffdefa966f2fc013b8.gif' alt='Error' hidden></img>
					<section className='navigation-bar'>
						<NavigationPanel />
						<UserDisplay />
					</section>
					<Suspense fallback={<Loading />}>
						<Routes>
							<Route path='/' element={<Home />} />
							<Route path='/map' element={<Map />} />
							<Route path='/home' element={<Home />} />
							<Route path='/logic' element={<Logic />} />
							<Route path='/login' element={<Login />} />
							<Route path='/upload' element={<Upload />} />
							<Route path='/schematic' element={<Schematic />} />
							<Route path='/forum/*' element={<Forum></Forum>}></Route>
							<Route path='/schematic/:id' element={<SchematicPreview />} />
							<Route path='/user' element={<PrivateRoute element={<User />} />} />
							<Route path='/admin' element={<AdminRoute element={<Admin />} />} />
							<Route path='/oauth2/redirect' element={<OAuth2RedirectHandler />} />
						</Routes>
					</Suspense>
					<footer className='web-version'>{WEB_VERSION}</footer>
				</Router>
			</GlobalContext.Provider>
		</main>
	);
}

export default App;
