import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs-extra';

const workDir = './src/';
const spaDir = 'auth0-spa-js';
const vueDir = 'auth0-vue';

const sourceDirSpa = `./node_modules/@auth0/${spaDir}/src`;
const sourceDirReact = `./node_modules/@auth0/${vueDir}/src`;

await fs.emptyDir(workDir + spaDir);
await fs.emptyDir(workDir + vueDir);

await fs.copy(sourceDirSpa, workDir + spaDir);
await fs.copy(sourceDirReact, workDir + vueDir);

const project = new Project();
project.addSourceFilesAtPaths(`${workDir}/${spaDir}/**/*.ts`);
project.addSourceFilesAtPaths(`${workDir}/${vueDir}/**/*.ts`);

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
// Get last IF statement from constructor and remove it
clientClass.getConstructors()[0]
	.getBody()
	.getFirstChildByKind(SyntaxKind.SyntaxList)
	.getLastChildByKind(SyntaxKind.IfStatement)
	.remove();


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

// project.getSourceFile('auth0-provider.tsx').insertText(0, '// @ts-nocheck\n');


project.getSourceFiles().forEach((sf) => {
	sf.getImportDeclarations().forEach((id) => {
		if (id.getModuleSpecifierValue() === '@auth0/auth0-spa-js') {
			id.setModuleSpecifier(`../${spaDir}`);
		}
	});

	sf.getExportDeclarations().forEach((id) => {
		if (id.getModuleSpecifierValue() === '@auth0/auth0-spa-js') {
			id.setModuleSpecifier(`../${spaDir}`);
		}
	});
});

await project.save();
