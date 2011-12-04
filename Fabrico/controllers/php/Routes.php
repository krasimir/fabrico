<?php
class Routes {
    
    private $router;

    public function __construct($router){
    
        $this->router = $router;
        
        // routes
        $this->router->all("/logout(.*)?", "pages/Logout.php");
        $this->router->all("/login(.*)?", "pages/Login.php");
        $this->router->all("/sample-static-page(.*)?", "pages/SampleStatic.php");
        $this->router->all("/sample(.*)?", "pages/Sample.php");
        $this->router->all("(.*)?", "pages/Home.php");
        
    }
    public function run($req, $res) {
        
        // if the user is not logged in show the login page
        if(!$req->fabrico->access->logged) {
            $this->router->removeAllRoutes();
            $this->router->all("(.*)?", "pages/Login.php");
        }
        
    }
}
?>