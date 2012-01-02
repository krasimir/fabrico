<?php

    /**
    * @package Fabrico\Modules\Utils
    */
    class Injector {
    
        /** If true shows the injected files. (false by default) */
        public $debug = false;
    
        private $map;
        private $injected;
        private $reportContent = "";
        
        public function __construct() {
            
        }        
        public function setRoot($root) {
            $this->injected = (object) array();
            $this->map = (object) array();
            $files = $this->readDir($root);
            foreach($files as $file) {
                $this->map->{basename($file)} = (object) array(
                    "path" => $file
                );
            }
        }
        public function inject($files) {
            if(!is_array($files)) {
                $files = array($files);
            }
            $result = array();
            foreach($files as $file) {
                $basename = basename($file);
                if(!isset($this->injected->$basename)) {
                    $this->injected->$basename = str_replace(".php", "", $basename);
                    if(!isset($this->map->$basename) && strpos($this->map->{$basename}->path, $file) !== FALSE) {
                        throw new Exception("Injector: missing file '".$file."'.");
                    } else {
                        require($this->map->{$basename}->path);
                        $this->log($this->map->{$basename}->path);
                    }
                }
                $result []= $this->injected->$basename;
            }
            return count($result) == 1 ? $result[0] : $result;
        }
        public function report($color) {
            $matches = array();
            $numOfMatches = preg_match_all('<br />', $this->reportContent, $matches);
            echo '<div class="debug" style="background:'.$color.'">Injector ('.$numOfMatches.' files injected):<br />'.$this->reportContent.'</div>';
        }
        private function readDir($dir) {
            $files = array();
            if ($handle = opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry != "." && $entry != "..") {
                        if(is_dir($dir."/".$entry)) {
                            $files = array_merge($files, $this->readDir($dir."/".$entry));
                        } else if(is_file($dir."/".$entry)) {
                            if(strpos($entry, ".php") !== FALSE) {
                                $files []= $dir."/".$entry;
                            }
                        }
                    }
                }
                closedir($handle);
            }
            return $files;
        }
        private function log($file) {
            $this->reportContent .= $file."<br />";
        }
    }

?>