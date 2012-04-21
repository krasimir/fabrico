<?php

    require_once(dirname(__FILE__)."/Command.php");

    class controllers_command extends Command {
        public function prepare() {            
            $this->operations []= (object) array(
                "pattern" => "controllers show @unit @file",
                "callback" => "showControllers"
            );
            $this->operations []= (object) array(
                "pattern" => "controllers show @unit",
                "callback" => "showControllers"
            );
            $this->operations []= (object) array(
                "pattern" => "controllers show",
                "callback" => "showControllers"
            );
            $this->operations []= (object) array(
                "pattern" => "controllers manage @unit @file",
                "callback" => "manage"
            );
            $this->operations []= (object) array(
                "pattern" => "controllers manage @unit",
                "callback" => "manage"
            );
            $this->operations []= (object) array(
                "pattern" => "controllers manage",
                "callback" => "manage"
            );
            parent::prepare();
        }
        public function showControllers($params) {
            $unit = isset($params["unit"]) ? $params["unit"] : "admin";
            $file = isset($params["file"]) ? $params["file"] : "modules/controllers.php";
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
            $file = isset($params["file"]) ? $params["file"] : "modules/controllers.php";
            $templates = array(
                (object) array(
                    "template" => view("commands/templates/controllers.module.json.tpl"),
                    "label" => "Module Configuration"
                ),
                (object) array(
                    "template" => view("commands/templates/controller.json.tpl"),
                    "label" => "Controller's settings"
                ),
                (object) array(
                    "template" => "",
                    "label" => "Fields"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.Text.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ Text"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.ComplexData.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ ComplexData"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.Date.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ Date"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.File.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ File"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.Files.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ Files"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.HiddenCurrentUser.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ HiddenCurrentUser"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.HiddenModifiedDate.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ HiddenModifiedDate"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.Select.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ Select"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.SelectCheck.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ SelectCheck"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.SelectDb.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ SelectDb"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.SelectDbCheck.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ SelectDbCheck"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.SelectRadio.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ SelectRadio"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.TextLong.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ TextLong"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.TextRich.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ TextRich"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.TextTinyMCE.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ TextTinyMCE"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.dependency.json.tpl"),
                    "label" => "Field Dependency"
                ),
                (object) array(
                    "template" => view("commands/templates/controllers.field.validator.json.tpl"),
                    "label" => "Field Validator"
                )
            );
            $this->processManageCommand($unit, $file, json_encode($templates));                        
        }
    }


?>