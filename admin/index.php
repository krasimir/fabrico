<?php

    require("../global.php");
    
    $fabrico = new Fabrico(
        array(
            ROOT_UNIT."/modules/views.php",
            ROOT_UNIT."/modules/access.php",
            ROOT_UNIT."/modules/assets.php",
            ROOT_UNIT."/modules/adapters.php",
            ROOT_UNIT."/modules/models.php",
            ROOT_UNIT."/modules/router.php",
            ROOT_UNIT."/modules/benchmark.php"
        )
    );
    
?>