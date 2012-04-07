<?php

    require("../global.php");
    
    $injector->mapFile(ROOT_UNIT."/library/ConsoleResponse.php");
    $injector->mapFile(ROOT_UNIT."/library/ConsoleUtils.php");
    
    $fabrico = new Fabrico(
        array(
            ROOT_UNIT."/modules/views.php",
            ROOT_UNIT."/modules/assets.php",
            ROOT_UNIT."/modules/access.php",
            ROOT_UNIT."/modules/consoleRouter.php"
        )
    );

?>