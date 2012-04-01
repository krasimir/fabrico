<?php

    require_once(dirname(__FILE__)."/Command.php");

    class help_command extends Command {
    
        public function prepare() {
            $this->operations []= (object) array(
                "pattern" => "help(.*)?",
                "callback" => "showCommands"
            );
        }
        public function showCommands($params) {
            $result = "";
            $result .= "Available commands:<br />";
            $result .= "<ul>";
            $this->readCommandsDir(dirname(__FILE__), $result);
            $result .= "</ul>";
            $this->addToQueue("output.info", $result);
        }
        private function readCommandsDir($dir, &$result) {
            if ($handle = @opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry != "." && $entry != ".." && $entry != "Command.php") {
                        $result .= "<li>".str_replace(".php", "", basename($entry))."</li>";
                    }
                }
                closedir($handle);
            }
        }
    
    }


?>