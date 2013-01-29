# Loader

- - -

Once you include *Autoloader.php* into your page, the loader parses the file structure of your project and creates a cache file. It is good to know that this process run only if there is no cache file or the class/file required by you is not found.

There are two static methods, which you can use:

  - loadModule - accepts strings, names of the modules.
  - loadResource - accepts strings, path to files or group of files

It searches for files based on the current directory. For example if you have the following file structure:

    site
      └ libs
        └ modules
          └ View
            └ index.php
            └ logic.php
        └ custom
          └ config.php
          └ logic.php
        └ index.php

And if you type the following code in **index.php**

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

### Troubleshooting

#### Loader can't find new files
Delete the Loader's cache. It is located in the same directory as *Autoloader.php*.