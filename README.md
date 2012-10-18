# Fabrico PHP Framework

***

# Fabrico PHP Package Manager

### Usage

The modules are placed in a **modules** directory by default. For example if you have the following structure:

    site
      └ libs
        └ fabrico
          └ modules
      └ assets
        └ css
        └ js
      └ controllers
      └ views

Let's say that you want to add your modules in **/site/libs/fabrico/modules**. Then you should create a php file there with the following content:

    <?php
        require("[path to fabrico]/index.php");     
    ?>

I.e. simply to include **index.php* of  fabrico.
The next step is to create your **package.json**, where you will describe what modules you want to have. The json file should be create in the same place.

Format of **package.json**

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
        },
        {
            "owner": "ownername",
            "repository": "reponame",
            "branch": "master",
            "modules": [
                { "path": "path/to/directory" },
                { "path": "path/to/directory" },
                { "path": "path/to/directory" }
            ]
        }
    ]

**commit** property is not mandatory. If you don't specify it the manager will fetch the latest commit. Once the manager finishes its job a file **commit.sha** will be created in the module's directory. You can use it to get the commit's **sha** and place it in **package.json**. Following this approach you will be sure that you will fetch the exact version of the files that you are currently using.

At the end you should have the following structure:

    site
      └ libs
        └ fabrico
          └ modules
            └ install.php
            └ package.json
      └ assets
        └ css
        └ js
      └ controllers
      └ views

Then just simply execute your php file via the command line

    php install.php

Fabrico package manager will creates directory **modules** and will place everything there.