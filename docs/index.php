<?php

    require("../global.php");
    
    $injector->path(array(
        ROOT."/docs/controllers"
    ));
    
    $fabrico = new Fabrico(
        array(
            ROOT_UNIT."/modules/router.php"
        )
    );
    
?>