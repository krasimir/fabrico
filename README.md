# Fabrico

Fabrico is PHP micro framework. It's purpose is to provide really basic functionalities for building web applications. During the development, the very first priority was to contain modules which are independent. I.e. there are not tied to any other classes or modules. Simple classes for a specific job.

## Modules

  - [Installer](https://github.com/krasimir/fabrico/tree/master/lib/Installer)
  - [Autoloader](https://github.com/krasimir/fabrico/tree/master/lib/Autoloader)
  - [Router](https://github.com/krasimir/fabrico/tree/master/lib/Router)
  - [Template engine](https://github.com/krasimir/fabrico/tree/master/lib/View)
  - [Database adapters](https://github.com/krasimir/fabrico/tree/master/lib/DBAdapters)
  - [Error handler](https://github.com/krasimir/fabrico/tree/master/lib/ErrorHandler)
  - [Application mode](https://github.com/krasimir/fabrico/tree/master/lib/AppMode)
  - [Session manager](https://github.com/krasimir/fabrico/tree/master/lib/SessionManager)
  - [Former](https://github.com/krasimir/fabrico/tree/master/lib/Former)

## Installation

The easier way is to download the files directly and check the documentation of every of the modules.

Fabrico is also available for *composer*

    {
        "require": {
            "krasimir/fabrico": "dev-master"
        }
    }
