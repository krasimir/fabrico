# Application mode
Module, which could help if you work in different develop environments.

## Defininng mode

    // set([your domain or part of it], [string/mode])
    AppMode::set("fabrico.dev", "development");
    AppMode::set("mysite.com", "production");

## Getting current mode

    $mode = AppMode::get();

## Setting default mode

    AppMode::setDefault("local");

## Clear defined modes

    AppMode::clear();