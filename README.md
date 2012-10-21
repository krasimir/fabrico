# Fabrico
## Fabrico is very small PHP micro framework. 

It's purpose is to provide really basic functionalities for building web applications. Actually, there is only one file that you have to include - fabrico.php. It contains two classes:

  - loader - injects the needed modules
  - package manager - downloads modules from GitHub

## Loader

The loader parses the file structure and searches for *[module name]/index.php*. There are two static methods, which you can use:

  - load - accepts string or array of strings, the name of the modules. There is also a second, optional parameter which is module's path. I.e. you can specify the search path.
  - modules - accepts string, path to the installed modules

Firstly, fabrico searches for modules in a provided path. If there is no such a path, it starts to search in the global directory. Here are few examples:

    // search in the global project's directory
    F::load("Router");

    // injecting of several modules
    F::load(array("View", "Parser", "ErrorHandler"));

    // start the search in the current directory and if there are no results continue with the global
    F::load("View", dirname(__FILE__)); // useful if you have nested modules

    // setting a local path for seaching. Every next call of the load method
    // will search in the current directory first.
    F::modules(dirname(__FILE__));
    // or for example
    F::modules("../../modules");

A valid module is a directory, which matches the name that you pass and contains *index.php*. For example:

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

Inspired by [npm](https://npmjs.org/) and [bundler](http://gembundler.com/), the manager could download content from GitHub. It is not meant to be only for PHP based application, but for any other kind of software, which uses GitHub's repositories. You can install modules by specifying owner, repository, branch, directory and commit.

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

- owner /required/ - the owner of the repository
- repository /required/ - the name of the repository
- branch /required/- the name of the branch
- modules /optional/ - array of objects. If you miss this property the whole repository will be downloaded. The name of the module will be same as the name of the repository.
    - path /optional/ - directory path of the module in the repository. Could be also an empty string or just */*. If you miss this property the whole repository will be downloaded. The name of the module will be same as the name of the repository.
    - name /optional/ - by default the name of the directory container is used, but you can specify your own name. For example if the path is *core/ErrorHandler* the name of the module will be *ErrorHandler*.
- commit /optional/ - by default the manager gets the latest commit, but you can specify a strict commit which you want to use 

At the end you should have the following structure:

    site
      └ libs
        └ something
          └ package.json
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

    php ./site/fabrico/fabrico.php ./site/libs/something/package.json

The manager will create directory *modules* in *./site/libs/something* and will place everything there.

### Versioning

Fabrico package manager doesn't have a central registry/storage, which means that it can't use version numbers during the downloading of the modules. The good thing is that it searches modules in GitHub, where every commit has its own hash. So, basically if you know the owner, repository, branch and the *sha* of a specific commit you can stick to specific version of the files. Every downloaded module has commit.sha file generated in its folder, which contains the *sha* of the fetched commit. You can grab that value and add it to your package.json file like:

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

Feel free to place a package.json file in some of your modules. The manager will parse it and will install the necessary dependencies in the module's directory. Modules, which are already installed are skipped.

### Flexibility 

The main job of the manager is really simple - to download files from Github. This means that you can use it to grab every single directory, from every public repository. For example if you need the html5-boilerplate in your project you should add it to your *package.json* file:

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
        }
    ]

And when the manager finishes its job you will have the following file structure:

    site
      └ libs
        └ something
          └ modules  
            └ Boilerplate
            └ ErrorHandler
            └ Router
            └ View
          └ install.php
          └ package.json
      └ assets
        └ css
        └ js
      └ controllers
      └ views
      └ fabrico
        └ fabrico.php