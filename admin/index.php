<?php

    require("../global.php");
    
    $fabrico = new Fabrico(
        array(
            ROOT_APP."/modules/views.php",
            ROOT_APP."/modules/access.php",
            ROOT_APP."/modules/assets.php",
            ROOT_APP."/modules/adapters.php",
            ROOT_APP."/modules/models.php",
            ROOT_APP."/modules/router.php",
            ROOT_APP."/modules/benchmark.php"
        )
    );
    
?>