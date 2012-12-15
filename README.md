# Fabrico

Fabrico is very small PHP micro framework. 

It's purpose is to provide really basic functionalities for building web applications. Actually, there is only one file that you have to include - fabrico.php. It contains two classes:

  - auto-loader - includes files
  - package manager - downloads code

## Loader

Once you include *fabrico.php* into your page, the loader parses the file structure of your project and creates a cache file. 

The loader parses the file structure and searches for php files. There are two static methods, which you can use:

  - loadModule - accepts strings, names of the modules.
  - loadResource - accepts strings, path to files or group of files

Fabrico searches for files based on the current directory. For example if you have the following file structure:

    site
      └ libs
        └ modules
          └ View
            └ index.php
            └ logic.php
        └ custom
          └ config.php
          └ logic.php
        └ start.php

And if you type the following code in **start.php**

    global $F;
    $F->loadModule("View");

Fabrico will start to search for the module **View** in /site/libs/ and all the inner folders.

Here are fiew examples:

    // requiring Router
    F::loadModule("Router");

    // requiring more then one module
    F::loadModule("Router", "View", "ErrorHandler", "MyCustomModule");

    // requiring specific php file
    F::loadResource("libs/configs.php", "external/emailsender.php");

    // requiring all the php files in a folder and its subfolders
    F::loadResource("libs/*");

A valid module is a directory, which matches the name that you pass and contains *index.php*. All the modules should be placed in a subfolder **modules**. For example:

Valid module with name *View*:

    site
      └ libs
        └ modules
          └ View
            └ index.php
            └ logic.php
      └ assets
        └ css
        └ js

Invalid module with name *View*:

    site
      └ libs
        └ modules
          └ View
            └ main.php
            └ logic.php
      └ assets
        └ css
        └ js

***

## Package manager

Inspired by [npm](https://npmjs.org/) and [bundler](http://gembundler.com/), the manager could download content from any source, including GitHub. It is not meant to be only for PHP based application, but for any other kind of software. You can install modules by specifying owner, repository, branch, directory and commit. You can also use the manager to download just a file or a zip archive.

*There is no any special kind of file which you have to add to define a module. Basically every directory is a separated module. However if you want to use the fabrico's loader you will have to add index.php in the main module's directory.*

### Usage

Let's say that you have the following structure:

    site
      └ libs
        └ something
      └ assets
        └ css
        └ js
      └ controllers
      └ views
      └ fabrico
        └ fabrico.php

Create a json file, which will store the information about your modules. It should contain something like that:

    [
        {
            "owner": "krasimir",
            "repository": "fabrico",
            "branch": "master",
            "modules": [
                { "path": "core/ErrorHandler", "name": "MyCustomModuleName" },
                { "path": "console" }
            ],
            "commit": "f43adca84f6c882236e208a874fb6acb27908457"
        }
        ...
    ]

#### Fetching content from GitHub
- owner /required/ - the owner of the repository
- repository /required/ - the name of the repository
- branch /required/- the name of the branch
- modules /optional/ - array of objects. If you miss this property the whole repository will be downloaded. The name of the module will be same as the name of the repository.
    - path /optional/ - directory path of the module in the repository. Could be also an empty string or just */*. If you miss this property the whole repository will be downloaded. The name of the module will be same as the name of the repository.
    - name /optional/ - by default the name of the directory container is used, but you can specify your own name. For example if the path is *core/ErrorHandler* the name of the module will be *ErrorHandler*.
    - ignoreIfAvailable /optional/ - true or false. If it is true then the module will be installed only if it's missing
- commit /optional/ - by default the manager gets the latest commit, but you can specify a strict commit which you want to use 

#### Fetching content from other source
- path /required/ - the url of the file or zip archive
- name /required/ - the name of the folder, which will be created in /modules directory
- ignoreIfAvailable /optional/ - true or false. If it is true then the module will be installed only if it's missing

At the end you should have the following structure:

    site
      └ libs
        └ something
          └ fabrico.json
      └ assets
        └ css
        └ js
      └ controllers
      └ views
      └ fabrico
        └ fabrico.php

Run fabrico.php via the command line and provide a path to your json file.

    php [path to fabrico.php] [path to .json file]

In this case:

    php ./site/fabrico/fabrico.php ./site/libs/something/fabrico.json

The manager will create directory *modules* in *./site/libs/something* and will place everything there.

### Versioning

Fabrico package manager doesn't have a central registry/storage, which means that it can't use version numbers during the downloading of the modules. The good thing is that it searches modules in GitHub, where every commit has its own hash. So, basically if you know the owner, repository, branch and the *sha* of a specific commit you can stick to specific version of the files. Every downloaded module has commit.sha file generated in its folder, which contains the *sha* of the fetched commit. You can grab that value and add it to your fabrico.json file like:

    [
        {
            "owner": "krasimir",
            "repository": "fabrico",
            "branch": "master",
            "modules": [
                { "path": "core/ErrorHandler" },
                { "path": "console" }
            ],
            "commit": "f43adca84f6c882236e208a874fb6acb27908457"
        }
        ...
    ]

(If you don't set *commit* property the manager will download the latest one)

### Nesting of modules

Feel free to place a fabrico.json file in some of your modules. The manager will parse it and will install the necessary dependencies in the module's directory. Modules, which are already installed are skipped.

### Flexibility 

The main job of the manager is really simple - to download files. This means that you can use it to grab every single directory, from every public repository or just a simple file which is availble via GET request. For example if you need the html5-boilerplate, jquery and bootstrap in your project you should add them to your *fabrico.json* file:

    [
        {
            "owner": "krasimir",
            "repository": "fabrico",
            "branch": "master",
            "modules": [
                { "path": "src/core/ErrorHandler" },
                { "path": "src/core/View" },
                { "path": "src/core/Router" }
            ]
        },
        {
            "owner": "h5bp",
            "repository": "html5-boilerplate",
            "branch": "master",
            "modules": [
                { "path": "", "name": "Boilerplate" }
            ]
        },
        {
            "path": "http://code.jquery.com/jquery-1.8.2.min.js", "name": "jQuery"
        },
        {
            "path": "http://twitter.github.com/bootstrap/assets/bootstrap.zip", "name": "Bootstrap"
        }
    ]

And when the manager finishes its job you will have the following file structure:

    site
      └ libs
        └ something
          └ modules  
            └ Boilerplate
            └ jQuery
            └ Bootstrap
            └ ErrorHandler
            └ Router
            └ View
          └ install.php
          └ fabrico.json
      └ assets
        └ css
        └ js
      └ controllers
      └ views
      └ fabrico
        └ fabrico.php