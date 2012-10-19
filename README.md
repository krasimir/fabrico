# Fabrico

Fabrico is a php micro framework. It's purpose is to provide really basic functionalities for building web applications. 

***

# Package manager

Inspired by [npm](https://npmjs.org/) and [bundler](http://gembundler.com/), the manager could download content from GitHub. It is not meant to be only for PHP based application, but for any other kind of software, which uses GitHub's repositories. You can install modules which by specifying owner, repository, branch, directory and commit.

*There is no any special kind of files which you have to add to define a module. Basically every directory is a separated module.*

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

And you want to add a module in */site/libs/something*. There are two things that you should do:

Create a .php file and add the following code

    <?php
        require("[path to fabrico]/fabrico.php");     
    ?>

I.e. simply include fabrico.
The next step is to create your *package.json*, where you will describe what modules you want to add. The json file should be created in the same directory.

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
- modules /required/ - array of objects
    - path /required/ - directory path of the module in the repository
    - name /optional/ - by default the name of the directory container is used, but you can specify your own name. For example if the path is *core/ErrorHandler* the name of the module will be *ErrorHandler*.
- commit /optional/ - by default the manager gets the latest commit, but you can specify a strict commit which you want to use 

At the end you should have the following structure:

    site
      └ libs
        └ something
          └ install.php
          └ package.json
      └ assets
        └ css
        └ js
      └ controllers
      └ views

Navigate to your php file (*install.php* in our case) and then just execute it via the command line

    php install.php

The manager will create directory *modules* and will place everything there.

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