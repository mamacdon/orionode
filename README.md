# Orionode
A minimal, single-user deployment of [Eclipse Orion](http://www.elipse.org/orion/). Use for hacking files on your computer using Orion's editing environment.

## Requirements
* node.js
* A web browser

## Usage
1. Checkout the orionode repository from GitHub.
2. **Recommended:** create a one-line ```password.txt``` file containing a secret password.
3. Launch the Orion server by running this command from a shell: 
```node index.js [-p port] [-w directory] [-password password.txt]```
4. Go to **[http://localhost:8081](http://localhost:8081)** (or whatever port you chose) in your web browser to start using Orion.

##### Optional command line arguments:
* ```-p``` or ```-port```: the port that the Orion server will listen on. Defaults to **8081**.
* ```-pwd``` or ```-password```: path to a file containing a password. If provided, Orionode will enforce HTTP Basic Authentication 
with the password (the auth 'User' field is ignored -- Orionode only verifies the password). Use caution: if you don't provide a password
file, **no authentication** is used (so anyone request can read and write your files!).
* ```-w``` or ```-workspace```: the target directory for reading and writing files. Will be created if it doesn't exist. Defaults to a subdirectory 
named **.workspace** in the repository folder.

## Features
* Basic Navigator operations (Create file/folder, delete file/folder)
* Basic Editor operations (Edit file, save file, ETags)
* Plugin operations
* Shell command for launching a node app (type ```help node``` in the Shell page to find out more)
* Client caching for static content (cache time: 2 hours)
* Gzip
* Concatenation and minification of pages (requires a manual step, see **Concatenation + Minification**, below)

## Missing/buggy features
* Missing file operations: copy/move/rename, import/export, binary data.
* Buggy: breadcrumb

## Other ways of using Orionode
You can use Orionode as a file server, to access your local files from [Orionhub.org](http://www.orionhub.org/) (or any other Orion installation). All you need is 
Orionode and a publicly-accessible URL pointing to your local Orionode server.

1. Visit this page on your Orionode server (the hostname will differ from this example) and copy its URL:
[http://yourOrionNodeServer:8081/plugins/fileClientPlugin.html](http://yourOrionNodeServer:8081/plugins/fileClientPlugin.html)
2. Log in to Orionhub.
3. Click the user menu in the top right-hand corner of the page, then click **Settings**.
4. Select the **Plugins** category, click **Install**, paste in the URL, click **Submit**.
5. Return to the Navigator page. Your Orionode files should appear as a new filesystem in the left-hand sidebar.

## Security Concerns
No security is guaranteed or even implied. Always run Orionode with the ```-pwd``` flag to prevent unauthorized access to your files.

## Concatenation + Minification
By default the pages served up by Orionode are not concatenated or minified, so they will load rather slowly.
You can mitigate this by running the client-side build. To do this, just run the ```node build.js``` from the ```orion-build``` subdirectory:
```
orionode $ node ./orion-build/build.js
-------------------------------------------------------
 [lots of output]
Done.
orionode $
```
Clear your browser cache. The next time you load Orionode, it should be much faster.

