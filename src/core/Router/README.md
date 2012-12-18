# Router

- - -

## Setup and initialization
Copy /htaccess/.htaccess file in your root directory and simply create an instance of Router class.

    $router = new Router();

## Routing

    // register($pattern, $controller, $method = "ALL")
    // $method could be any valid request method or 'ALL'
    $router->register("/users", "ControllerUsers", "GET");

## Routing with parameter

    $router->register("/users/@id", "ControllerUsers")

## Example
Route:

    $router->register("/users/@id", "ControllerUsers")

Request:

    http://fabrico.dev/examples/simpleapp/users/20

Controller:

    class ControllerUsers {
        public function __construct($params) {
            $id = isset($params["id"]) ? $params["id"] : null;
            ...
        }   
    }

## Chaining

    $router
    ->register("/users/@id", "ControllerUsers")
    ->register("/users", "ControllerUsers")
    ->register("", "ControllerHome")
    ->run();