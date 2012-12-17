# Adapters

A wrapper around MySQL functions with friendly API.

- - -

## MySQL

### Initializing

    $mysql = new MySQLAdapter((object) array(
        "host" => "localhost",
        "user" => "root",
        "pass" => "",
        "dbname" => "fabrico_mysqlorm_test"
    ));

### Defining tables/contexts

    $mysql->defineContext("users", array(
        "firstName" => "VARCHAR(250)",
        "lastName" => "VARCHAR(250)",
        "email" => "VARCHAR(100)",
        "password" => "INT",
        "createdAt" => "DATETIME",
        "bio" => "LONGTEXT"
    ));

### Adding a record

    $record = (object) array(
        "firstName" => "Krasimir",
        "lastName" => "Tsonev",
        "email" => "info@krasimirtsonev.com",
        "password" => rand(0, 1000000)
    );
    $mysql->users->save($record);

### Updating a record

    $record->lastName = "My-Custom-Last-Name";
    $mysql->users->save($record);

### Deleting a record
    
    $mysql->trash($record);

### Getting records

    $allUsers = $mysql->users->get();

### Getting user with position=2

    $user = $mysql->users->where("position=2")->get();

### Getting user order by password value

    $user = $mysql->users->order("password")->get();

### Getting user order by password value (ascending)

    $user = $mysql->users->order("password")->asc()->get();

### Getting user order by password value (descending)

    $user = $mysql->users->order("password")->desc()->get();
