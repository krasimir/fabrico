<?php

    require("../../src/core/DBAdapters/MySQL/index.php");

    // initializing
    $mysql = new MySQLAdapter((object) array(
        "host" => "localhost",
        "user" => "root",
        "pass" => "",
        "dbname" => "fabrico_mysqladapter_test"
    ));

    // defining tables/contexts
    $mysql->defineContext("users", array(
        "firstName" => "VARCHAR(250)",
        "lastName" => "VARCHAR(250)",
        "email" => "VARCHAR(100)",
        "password" => "INT",
        "createdAt" => "DATETIME",
        "bio" => "LONGTEXT"
    ));

    $mysql->freeze = true;

    // adding a record
    $record = (object) array(
        "firstName" => "Krasimir",
        "lastName" => "Tsonev",
        "email" => "info@krasimirtsonev.com",
        "password" => rand(0, 1000000)
    );
    $mysql->users->save($record);

    // updating a record
    $record->lastName = "My-Custom-Last-Name";
    $mysql->users->save($record);

    // deleting a record
    // $mysql->users->trash($record);

    // getting records
    $allUsers = $mysql->users->get();

    // getting user with id=2
    $user = $mysql->users->where("position=2")->get();

    // getting user order by password value
    $user = $mysql->users->order("password")->get();

    // getting user order by password value (ascending)
    $user = $mysql->users->order("password")->asc()->get();

    // getting user order by password value (descending)
    $user = $mysql->users->order("password")->desc()->get();

    // execute custom mysql query
    $res = $mysql->action("SELECT * FROM users WHERE id > 30");

    var_dump($mysql->queries);die();
    
?>