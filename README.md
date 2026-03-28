# GSTToolkit

## Build Electron
1. Copy build output
	npm run copy

2. replace content in main.js
	const startUrl = url.format({
		pathname: path.join(__dirname, `../gst-toolkit/index.html`),
		protocol: 'file:',
		slashes: true
	});

3. npm run start 


## Deployment on Electron

1. set GITHUB_TOKEN Refer F:\Apps\GSTToolkit\GSTToolkit Stuff\create electron build.txt
	echo %GITHUB_TOKEN%

2. set GH_TOKEN F:\Apps\GSTToolkit\GSTToolkit Stuff\create electron build.txt
	echo %GH_TOKEN%
	
3. Copy build output
	npm run copy

4. replace content in main.js
	const startUrl = url.format({
		pathname: path.join(__dirname, `../gst-toolkit/index.html`),
		protocol: 'file:',
		slashes: true
	});

4. npx electron-builder --publish always
	it will build and publish the release to the GITHUB
	
5. Release can be uploaded manualy from
	G:\Apps\GSTToolkit\gst-toolkit-electron\dist
