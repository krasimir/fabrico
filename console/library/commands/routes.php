<?php

    require_once(dirname(__FILE__)."/Command.php");

    class routes_command extends Command {
        public function prepare() {            
            $this->operations []= (object) array(
                "pattern" => "routes show @unit @file",
                "callback" => "showRoutes"
            );
            $this->operations []= (object) array(
                "pattern" => "routes show @unit",
                "callback" => "showRoutes"
            );
            $this->operations []= (object) array(
                "pattern" => "routes show",
                "callback" => "showRoutes"
            );
            $this->operations []= (object) array(
                "pattern" => "routes manage @unit @file",
                "callback" => "manage"
            );
            $this->operations []= (object) array(
                "pattern" => "routes manage @unit",
                "callback" => "manage"
            );
            $this->operations []= (object) array(
                "pattern" => "routes manage",
                "callback" => "manage"
            );
            parent::prepare();
        }
        public function showRoutes($params) {
            $unit = isset($params["unit"]) ? $params["unit"] : "admin";
            $file = isset($params["file"]) ? $params["file"] : "modules/router.php";
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
        public function manage($params) {
            $unit = isset($params["unit"]) ? $params["unit"] : "admin";
            $file = isset($params["file"]) ? $params["file"] : "modules/router.php";
            $templates = array(
                (object) array(
                    "template" => view("commands/templates/route.module.json.tpl"),
                    "label" => "Module Configuration"
                ),
                (object) array(
                    "template" => view("commands/templates/route.json.tpl"),
                    "label" => "Route"
                )
            );
            $this->processManageCommand($unit, $file, json_encode($templates));                        
        }
    }


?>