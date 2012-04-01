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
                "callback" => "showManage"
            );
            $this->operations []= (object) array(
                "pattern" => "routes manage @unit",
                "callback" => "showManage"
            );
            $this->operations []= (object) array(
                "pattern" => "routes manage",
                "callback" => "showManage"
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
        public function showManage($params) {
            $unit = isset($params["unit"]) ? $params["unit"] : "admin";
            $file = isset($params["file"]) ? $params["file"] : "modules/router.php";
            if(file_exists(dirname(__FILE__)."/../../../".$unit."/".$file)) {
                $funcName = str_replace(".php", "", basename($file));
                if(!function_exists($funcName)) {
                    require(dirname(__FILE__)."/../../../".$unit."/".$file);
                }                
                $config = $funcName();
                $this->addToQueue("output.info", view("commands/manage.html", array(
                    "json" => $this->formatJSON($config)
                ))."");
            } else {
                $this->addToQueue("output.error", $unit."/".$file." is missing.");
            }            
        }
    }


?>