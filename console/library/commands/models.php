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
            $this->operations []= (object) array(
                "pattern" => "models manage @unit @file",
                "callback" => "manage"
            );
            $this->operations []= (object) array(
                "pattern" => "models manage @unit",
                "callback" => "manage"
            );
            $this->operations []= (object) array(
                "pattern" => "models manage",
                "callback" => "manage"
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
        public function manage($params) {
            $unit = isset($params["unit"]) ? $params["unit"] : "admin";
            $file = isset($params["file"]) ? $params["file"] : "modules/models.php";
            $templates = array(
                (object) array(
                    "template" => view("commands/templates/models.module.json.tpl"),
                    "label" => "Module Configuration"
                ),
                (object) array(
                    "template" => view("commands/templates/model.json.tpl"),
                    "label" => "Model"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.json.tpl"),
                    "label" => "Fields",
                ),
            );
            $this->processManageCommand($unit, $file, json_encode($templates));                        
        }
    }


?>