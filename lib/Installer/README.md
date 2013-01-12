# Installer

Inspired by [npm](https://npmjs.org/) and [bundler](http://gembundler.com/), the installer could download content from various sources, including GitHub. It is not meant to be only for PHP based application, but for any other kind of software. You can install modules by specifying owner, repository, branch, directory and commit. You can also use it to download just a file or a zip archive. It is very similar to package manager, but has some additional features.

- [Basic Usage](https://github.com/krasimir/fabrico/tree/master/lib/Installer#basic-usage)
- [Installer file format](https://github.com/krasimir/fabrico/tree/master/lib/Installer#installer-file-format)
- [Actions after the download](https://github.com/krasimir/fabrico/tree/master/lib/Installer#actions-after-download)
- [Put the module in a custom path](https://github.com/krasimir/fabrico/tree/master/lib/Installer#put-the-module-in-a-custom-path)
- [Versioning](https://github.com/krasimir/fabrico/tree/master/lib/Installer#versioning)
- [Nesting of modules](https://github.com/krasimir/fabrico/tree/master/lib/Installer#nesting-of-modules)
- [Flexibility](https://github.com/krasimir/fabrico/tree/master/lib/Installer#flexibility)

- - - 

## Basic usage

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

Run Installer.php via the command line and provide a path to your json file.

    php [path to Installer.php] [path to .json file]

For example:

    php ./site/fabrico/lib/modules/Installer/Installer.php ./site/libs/something/install.json

The installer will parse your json and will download the content into *./site/libs/something/modules/* directory. 

## JSON file format

The json file should countain an array of objects. Every object should have:

### Fetching content from GitHub
- owner /required/ - the owner of the repository
- repository /required/ - the name of the repository
- branch /required/- the name of the branch
- modules /optional/ - array of objects. If you miss this property the whole repository will be downloaded. The name of the module will be same as the name of the repository.
    - path /optional/ - directory path of the module in the repository. Could be also an empty string or just */*. If you miss this property the whole repository will be downloaded. The name of the module will be same as the name of the repository.
    - name /optional/ - by default the name of the directory container is used, but you can specify your own name. For example if the path is *core/ErrorHandler* the name of the module will be *ErrorHandler*.
    - ignoreIfAvailable /optional/ - true or false. If it is true then the module will be installed only if it's missing
    - actionsAfter /optional/ - check *Actions after the download* section below
    - installIn /optional/ - specify the destination of the module
- commit /optional/ - by default the manager gets the latest commit, but you can specify a strict commit which you want to use 


    [
      {
        "owner": "krasimir",
        "repository": "fabrico",
        "branch": "master",
        "modules": [
            { 
                "path": "/"
            }
        ]
      }
    ]

### Fetching content from other source
- path /required/ - the url of the file or zip archive
- name /required/ - the name of the folder, which will be created in /modules directory
- ignoreIfAvailable /optional/ - true or false. If it is true then the module will be installed only if it's missing
- actionsAfter /optional/ - check *Actions after the download* section below
- installIn /optional/ - specify the destination of the module


    [
      {
        "path": "http://code.jquery.com/jquery-1.8.2.min.js", 
        "name": "jquery",
        "installIn": "assets/js/"
      }
    ]

## Actions after the download
Fabrico gives you the ability to performe some actions after the module is downloaded. *actionsAfter* parameter could be an object or array of objects with the following format:

    "actionsAfter": [
        {"type": "replace", "file": "[file for the manipulation]", "searchFor": "[string]", "replaceWith": "[string]"},
        {"type": "copy", "path": "[file or directory]", "to": "[directory]"},
        {"type": "delete", "path": "[file or directory]"},
        {"type": "cmd", "command": "ls -l"}
    ]

The code above illustrates the the three available types of objects. You can:
- replace a string in a specific file
- copy/delete files or directories.
- execute command via shell

An example:

    [
      {
          "owner": "krasimir",
          "repository": "fabrico",
          "branch": "master",
          "modules": [
              { 
                  "path": "examples/simpleapp/custom/TestWidget",
                  "actionsAfter": [
                      {"type": "replace", "file": "config.php", "searchFor": "DB_HOST_VALUE", "replaceWith": "mydbhost.com"},
                      {"type": "copy", "path": "config.php", "to": "config_backup"},
                      {"type": "copy", "path": "modules.json", "to": "config_backup"},
                      {"type": "copy", "path": "things-to-backup", "to": "config_backup"},
                      {"type": "delete", "path": "config_backup/modules.json"},
                      {"type": "delete", "path": "config_backup/things-to-backup"}
                  ]
              }
          ]        
      }
    ]

You can also execute custom actions, which are not related to any specific module
You can do that by simply adding the same object used in *actionsAfter*. For example:

    [
      {
          "type": "cmd", "command": "ls"
      },
      {
          "owner": "krasimir",
          "repository": "fabrico",
          "branch": "master",
          "modules": [
              { "path": "" }
          ]
      },
      {
          "path": "http://code.jquery.com/jquery-1.8.2.min.js", 
          "name": "jquery",
          "installIn": "assets/js/"
      }
    ]

## Put the module in a custom path

Feel free to use *installIn* property to specify a custom path for your modules. For example:

    {
        "path": "http://code.jquery.com/jquery-1.8.2.min.js", 
        "name": "jquery",
        "installIn": "assets/js/"
    }

or 

    {
        "owner": "krasimir",
        "repository": "fabrico",
        "branch": "master",
        "modules": [
            { 
                "path": "lib/core/ErrorHandler", 
                "actionsAfter": [
                    { "type": "cmd", "command": "ls"}
                ],
                "installIn": "utils/"
            }
        ]
    }   



If you don't use *installIn* property the installer will create directory *modules* and will place everything there.

## Versioning

The installer doesn't have a central registry/storage, which means that it can't use version numbers during the downloading of the modules. The good thing is that it searches modules in GitHub, where every commit has its own hash. So, basically if you know the owner, repository, branch and the *sha* of a specific commit you can stick to specific version of the files. Every downloaded module has commit.sha file generated in its folder, which contains the *sha* of the fetched commit. You can grab that value and add it to your .json file like:

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

## Nesting of modules

Feel free to place a .json file in some of your modules. The installer will parse it and will install the necessary dependencies in the module's directory. Modules, which are already installed are skipped.

## Flexibility 

The main job of the installer is really simple - to download files. This means that you can use it to grab every single directory, from every public repository or just a simple file which is availble via GET request. For example if you need the html5-boilerplate, jquery and bootstrap in your project you should add them to your installer file:

    [
        {
            "owner": "krasimir",
            "repository": "fabrico",
            "branch": "master",
            "modules": [
                { "path": "lib/core/ErrorHandler" },
                { "path": "lib/core/View" },
                { "path": "lib/core/Router" }
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

And when the manager finishes its job you will probably have the following file structure:

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
          └ install.json
      └ assets
        └ css
        └ js
      └ controllers
      └ views