<?php

    require("../global.php");
    
    $injector->mapFile(ROOT_UNIT."/library/ConsoleResponse.php");
    
    $fabrico = new Fabrico(
        array(
            ROOT_UNIT."/modules/views.php",
            ROOT_UNIT."/modules/assets.php",
            ROOT."/admin/modules/adapters.php",
            ROOT."/admin/modules/models.php",
            ROOT."/admin/modules/access.php",
            ROOT_UNIT."/modules/consoleRouter.php"
        )
    );

?>