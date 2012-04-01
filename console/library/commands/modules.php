<?php

    require_once(dirname(__FILE__)."/Command.php");

    class modules_command extends Command {
        public function prepare() {            
            $this->operations []= (object) array(
                "pattern" => "modules show @unit",
                "callback" => "showModules"
            );
            $this->operations []= (object) array(
                "pattern" => "modules show",
                "callback" => "showModules"
            );
            parent::prepare();
        }
        public function showModules($params) {
            $unit = isset($params["unit"]) ? $params["unit"] : "admin";
            $result = "";
            $result .= "Modules:<br />";
            $result .= "<ul>";
            $this->getFiles(dirname(__FILE__)."/../../../".$unit."/modules/", $result, $unit."/modules/");
            $result .= "</ul>";
            $this->addToQueue("output.info", $result);
        }
    }


?>