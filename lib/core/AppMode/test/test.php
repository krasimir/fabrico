<?php

    require("../index.php");

    var_dump(AppMode::get());

    AppMode::clear();
    AppMode::set("localhost", "localhost-mode");
    var_dump(AppMode::get());

    AppMode::clear();
    AppMode::setDefault("production");
    var_dump(AppMode::get());

?>