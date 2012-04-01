<?php

    require_once(dirname(__FILE__)."/Command.php");

    class models_command extends Command {
        public function prepare() {            
            $this->operations []= (object) array(
                "pattern" => "models show @unit @file",
                "callback" => "showModels"
            );
            $this->operations []= (object) array(
                "pattern" => "models show @unit",
                "callback" => "showModels"
            );
            $this->operations []= (object) array(
                "pattern" => "models show",
                "callback" => "showModels"
            );
            parent::prepare();
        }
        public function showModels($params) {
            $unit = isset($params["unit"]) ? $params["unit"] : "admin";
            $file = isset($params["file"]) ? $params["file"] : "modules/models.php";
            if(file_exists(dirname(__FILE__)."/../../../".$unit."/".$file)) {
                $funcName = str_replace(".php", "", basename($file));
                if(!function_exists($funcName)) {
                    require(dirname(__FILE__)."/../../../".$unit."/".$file);
                }                
                $config = $funcName();
                $this->addToQueue("output.json", json_encode($config));
            } else {
                $this->addToQueue("output.error", $unit."/".$file." is missing.");
            }
            
        }
    }


?>