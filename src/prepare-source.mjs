import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs-extra';

const workDir = './src/';
const spaDir = 'auth0-spa-js';
const reactDir = 'auth0-react';

const sourceDirSpa = `./node_modules/@auth0/${spaDir}/src`;
const sourceDirReact = `./node_modules/@auth0/${reactDir}/src`;

await fs.emptyDir(workDir + spaDir);
await fs.emptyDir(workDir + reactDir);

await fs.copy(sourceDirSpa, workDir + spaDir);
await fs.copy(sourceDirReact, workDir + reactDir);

const project = new Project();
project.addSourceFilesAtPaths(`${workDir}/${spaDir}/**/*.ts`);
project.addSourceFilesAtPaths(`${workDir}/${reactDir}/**/*.tsx`);

// --
// edit Auth0Client.ts
// --

const clientClass = project.getSourceFile('Auth0Client.ts').getClass('Auth0Client');

// change _url method to add "/auth" path prefix
clientClass.getMethod('_url').setBodyText((writer) => {
	// writer.writeLine('// @ts-ignore')
	writer.writeLine('return `${this.domainUrl}/auth${path}`;');
});

// change _authorizeUrl method to add /oauth2 prefix
const templateHeadUrl = clientClass.getMethod('_authorizeUrl').getFirstDescendantByKind(SyntaxKind.TemplateHead);
templateHeadUrl.replaceWithText(templateHeadUrl.getText().replace('/authorize', '/oauth2/authorize'));

// change buildLogoutUrl to remove /v2 from url
const templateHeadBuildLogoutUrl = clientClass.getMethod('buildLogoutUrl').getFirstDescendantByKind(15);
templateHeadBuildLogoutUrl.replaceWithText(templateHeadBuildLogoutUrl.getText().replace('/v2/', '/'));

// Get last IF statement from constructor and remove it
clientClass.getConstructors()[0]
	.getBody()
	.getFirstChildByKind(SyntaxKind.SyntaxList)
	.getLastChildByKind(SyntaxKind.IfStatement)
	.remove();

// remove unused methods to lower footprint
/*clientClass.getMethod('loginWithRedirect').remove();
clientClass.getMethod('buildAuthorizeUrl').remove();
clientClass.getMethod('loginWithPopup').remove();
clientClass.getMethod('getTokenWithPopup').remove();*/
// clientClass.getMethod('logout').remove();

// this one is used in an IF, but not needed, replace it's content with "return"
/*clientClass.getMethod('_getTokenUsingRefreshToken').setBodyText((writer) => {
	writer.write('return;');
});*/

// ############
// edit api.js
// ############

const returnStatement = project.getSourceFile('api.ts').getFunction('oauthToken').getFirstDescendantByKind(SyntaxKind.ReturnStatement);

returnStatement.getFirstDescendantByKind(SyntaxKind.TemplateExpression).setLiteralValue('${baseUrl}/auth/oauth2/token');

returnStatement.getDescendantsOfKind(SyntaxKind.PropertyAssignment).forEach((d) => {
	if (d.getName() === '\'Auth0-Client\'') {
		d.remove();
	}
});

// ########################
// edit auth0-provider.tsx
// ########################

project.getSourceFile('auth0-provider.tsx').insertText(0, '// @ts-nocheck\n');

/*
const authProvider = project.getSourceFile('auth0-provider.tsx').getVariableDeclaration('Auth0Provider');

const varsToRemove = ['loginWithPopup', 'getAccessTokenWithPopup', 'buildAuthorizeUrl'];
const nodesToRemove = [];

authProvider.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((d) => {
	if (varsToRemove.includes(d.getFirstDescendantByKind(SyntaxKind.Identifier).getText())) {
		nodesToRemove.push(d);
	}
});

const returnBody = authProvider.getDescendantsOfKind(SyntaxKind.ReturnStatement).reverse().find(() => true);

returnBody
	.getFirstDescendantByKind(SyntaxKind.JsxElement)
	.getDescendantsOfKind(SyntaxKind.ShorthandPropertyAssignment)
	.forEach((d) => {
		if (varsToRemove.includes(d.getName())) {
			d.remove();
		}
	}
);

nodesToRemove.forEach((d) => d.remove());
*/


// edit all imports to point to our sources
project.getSourceFiles().forEach((sf) => {
	sf.getImportDeclarations().forEach((id) => {
		if (id.getModuleSpecifierValue() === '@auth0/auth0-spa-js') {
			id.setModuleSpecifier(`../${spaDir}`);
		}
	});
});

await project.save();
