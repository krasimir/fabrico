<?php

    /**
    * @package Fabrico\Modules\Utils
    */
    class Injector {
    
        /** If true shows the injected files. (false by default) */
        public $debug = false;
    
        private $map;
        private $injected;
        
        public function __construct() {
            
        }        
        public function setRoot($root) {
            $this->injected = (object) array();
            $this->map = (object) array();
            $files = $this->readDir($root);
            foreach($files as $file) {
                $this->map->{basename($file)} = $file;
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
                    if(!isset($this->map->$basename)) {
                        throw new Exception("Injector: missing file '".$file."'.");
                    } else {
                        require($this->map->$basename);
                    }
                }
                $result []= $this->injected->$basename;
            }
            return count($result) == 1 ? $result[0] : $result;
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
    }

?>