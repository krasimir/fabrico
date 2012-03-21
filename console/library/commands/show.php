<?php

    require_once(dirname(__FILE__)."/Command.php");

    class show extends Command {
    
        public function prepare() {
            $this->operations []= (object) array(
                "pattern" => "show units",
                "callback" => "showUnits"
            );
            $this->operations []= (object) array(
                "pattern" => "show models",
                "callback" => "showModels"
            );
            $this->operations []= (object) array(
                "pattern" => "show routes @config",
                "callback" => "showRoutes"
            );
            $this->operations []= (object) array(
                "pattern" => "show routes",
                "callback" => "showRoutes"
            );
            $this->operations []= (object) array(
                "pattern" => "show modules @unit",
                "callback" => "showModules"
            );
            $this->operations []= (object) array(
                "pattern" => "show modules",
                "callback" => "showModules"
            );
            $this->operations []= (object) array(
                "pattern" => "show(.*)?",
                "callback" => "help"
            );
        }
        public function help() {
            $result = "";
            $result .= "Available parameters:<br />";
            $result .= "<ul>";
            $result .= "<li>show <i>&lt;units></i></li>";
            $result .= "<li>show <i>&lt;models></i></li>";
            $result .= "<li>show <i>&lt;modules></i> <i>&lt;unit name></i></li>";
            $result .= "<li>show <i>&lt;routes></i> <i>&lt;path to router module name (optional)></i></li>";
            $result .= "</ul>";
            $this->addToQueue("output.info", $result);
        }
        public function showUnits($params) {
            $result = "";
            $result .= "Available units:<br />";
            $result .= "<ul>";
            $this->getDirs(dirname(__FILE__)."/../../../", $result);
            $result .= "</ul>";
            $this->addToQueue("output.info", $result);
        }
        public function showModels($params) {
            $models = $this->req->fabrico->models->config->models;
            $result = "";
            $result .= "Available models:<br />";
            $result .= "<ul>";
            foreach($models as $name => $model) {
                $result .= "<li>".$name."</li>";
            }
            $result .= "</ul>";
            $this->addToQueue("output.info", $result);
        }
        public function showRoutes($params) {
            $config = isset($params["config"]) ? $params["config"] : "";            
            if($config === "") {
                $config = "/admin/modules/router.php";
            } else {
                $config = "/".$config;
            }
            if(file_exists(ROOT.$config)) {
                $funcName = str_replace(".php", "", basename($config));
                require_once(ROOT.$config);
                $routes = $funcName();
                if(!isset($routes) || $routes == null) {
                    $this->addToQueue("output.error", "Missing routes in ".$config);
                } else {
                    $this->addToQueue("output.json", json_encode($routes));
                }
                
            } else {
                $this->addToQueue("output.error", $config." is missing.");
            }
        }
        public function showModules($params) {
            $unit = isset($params["unit"]) ? $params["unit"] : "";
            if($unit === "") {
                $this->addToQueue("output.error", "Missing unit name. (Command: show modules <i>&lt;unit name></i>)");
                return;
            }
            if(file_exists(ROOT."/".$unit)) {
                $result = "";
                $result .= "Available modules:<br />";
                $result .= "<ul>";
                $this->getFiles(ROOT."/".$unit."/modules/", $result);
                $result .= "</ul>";
                $this->addToQueue("output.info", $result);         
            } else {
                $this->addToQueue("output.error", $unit." is missing.");
            }
        }
        private function getDirs($dir, &$result) {
            if ($handle = @opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                var_dump($entry);
                    if ($entry != "." && $entry != ".." && $entry != "library" && $entry != ".git" && $entry != ".svn" && is_dir($dir.$entry)) {
                        $result .= "<li>".str_replace(".php", "", basename($entry))."</li>";
                    }
                }
                die($result);
                closedir($handle);
            }
        }
        private function getFiles($dir, &$result) {
            if ($handle = @opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry != "." && $entry != ".." && $entry != "library" && $entry != ".git" && $entry != ".svn" && $entry != ".htaccess") {
                        $result .= "<li>".basename($entry)."</li>";
                    }
                }
                closedir($handle);
            }
        }
    
    }


?>