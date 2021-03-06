<?php

    require("../../lib/DBAdapters/MySQL/index.php");

    // initializing
    $mysql = new MySQLAdapter((object) array(
        "host" => "localhost",
        "user" => "root",
        "pass" => "",
        "dbname" => "krasimir_mysqladapter_test"
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

    $mysql->freeze = false;

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
    $user = $mysql->users->order("password")->asc()->limit("0,2")->get();

    // getting user order by password value (descending)
    $user = $mysql->users->order("password")->desc()->get();

    // execute custom mysql query
    $res = $mysql->action("SELECT * FROM users ORDER By position DESC");

    var_dump($mysql->queries);
    var_dump($res);
    
?>