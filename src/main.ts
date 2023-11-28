import createAuth0nClient, {
	Auth0Client as Auth0nClient,
} from './auth0-spa-js/index';

import {
	Auth0Provider as Auth0nProvider,
	withAuth0 as withAuth0n,
	useAuth0 as useAuth0n,
} from './auth0-react/index';

export {
	Auth0nClient,
	createAuth0nClient,
	Auth0nProvider,
	withAuth0n,
	useAuth0n,
}
