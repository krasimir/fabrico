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
                (object) array(
                    "template" => view("commands/templates/model.field.Text.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ Text"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.ComplexData.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ ComplexData"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.Date.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ Date"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.File.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ File"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.Files.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ Files"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.HiddenCurrentUser.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ HiddenCurrentUser"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.HiddenModifiedDate.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ HiddenModifiedDate"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.Select.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ Select"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.SelectCheck.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ SelectCheck"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.SelectDb.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ SelectDb"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.SelectDbCheck.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ SelectDbCheck"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.SelectRadio.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ SelectRadio"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.TextLong.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ TextLong"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.TextRich.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ TextRich"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.TextTinyMCE.json.tpl"),
                    "label" => "&nbsp;&nbsp;&nbsp;└ TextTinyMCE"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.dependency.json.tpl"),
                    "label" => "Field Dependency"
                ),
                (object) array(
                    "template" => view("commands/templates/model.field.validator.json.tpl"),
                    "label" => "Field Validator"
                )
            );
            $this->processManageCommand($unit, $file, json_encode($templates));                        
        }
    }


?>