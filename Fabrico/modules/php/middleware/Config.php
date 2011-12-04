<?php

    require_once("tools/JSONConfig.php");
    require_once("tools/RedBean.php");

    class Config extends JSONConfig {
    
        public function run($req, $res) {
            
            // setup redbean   
            $db = $this->get("fabrico.db");
            R::setup('mysql:host=localhost;dbname='.$db->dbname, $db->user, $db->pass);
            
        }
        
    }

?>