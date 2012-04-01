<?php

    require_once(dirname(__FILE__)."/Command.php");

    class units_command extends Command {
        public function prepare() {            
            $this->operations []= (object) array(
                "pattern" => "units show",
                "callback" => "showUnits"
            );
            parent::prepare();
        }
        public function showUnits() {
            $result = "";
            $result .= "Available units:<br />";
            $result .= "<ul>";
            $this->getDirs(dirname(__FILE__)."/../../../", $result, "/");
            $result .= "</ul>";
            $this->addToQueue("output.info", $result);
        }
    }


?>