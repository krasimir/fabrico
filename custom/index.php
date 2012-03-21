<?php

    require("../global.php");
    
    $fabrico = new Fabrico(
        array(
            ROOT."/admin/modules/adapters.php",
            ROOT."/admin/modules/models.php",
            ROOT_UNIT."/modules/router.php"
        )
    );

?>