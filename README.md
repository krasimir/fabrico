# Fabrico

Fabrico is very small PHP micro framework. 

It's purpose is to provide really basic functionalities for building web applications. Actually, there is only one file that you have to include - fabrico.php. It contains two classes:

  - auto-loader - includes files
  - package manager - downloads code

Check the additional core modules [here](https://github.com/krasimir/fabrico#core-modules).

- - -

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
    $F->loadModule("Router");

    // requiring more then one module
    $F->loadModule("Router", "View", "ErrorHandler", "MyCustomModule");

    // requiring specific php file
    $F->loadResource("libs/configs.php", "external/emailsender.php");

    // requiring all the php files in a folder and its subfolders
    $F->loadResource("libs/*");

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

- - -



- - -

## Core modules

  - [Router](https://github.com/krasimir/fabrico/tree/master/lib/core/Router)
  - [Template engine](https://github.com/krasimir/fabrico/tree/master/lib/core/View)
  - [Database adapters](https://github.com/krasimir/fabrico/tree/master/lib/core/DBAdapters)
  - [Error handler](https://github.com/krasimir/fabrico/tree/master/lib/core/ErrorHandler)
  - [Application mode](https://github.com/krasimir/fabrico/tree/master/lib/core/AppMode)
  - [Session manager](https://github.com/krasimir/fabrico/tree/master/lib/core/SessionManager)
  - [Former](https://github.com/krasimir/fabrico/tree/master/lib/core/Former)

## Troubleshooting

#### Loader can't find new files
Delete the Loader's cache. It is located in the same directory as *fabrico.php*.