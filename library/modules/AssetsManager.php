<?php

    inject(array(
        "utils/rglob.php",
        "utils/FileJoin.php",
        "modules/Module.php",
        "Middleware.php"
    ));
    
    /**
    * @package Fabrico\Library\Modules
    */
    class AssetsManager extends Module {
        
        public $root = "/";

        private $dirs = array();
        private $assets;
        private $hash = "";
        private $req;
        private $res;
        private $logStr = "";

        public function __construct() {
            $this->assets = (object) array();
        }
        public function init($config) {
            foreach($config->assets as $asset) {
                $this->add($asset);
            }
        }
        public function add($asset) {
            $this->assets->{$asset->name} = $asset;
            $this->assets->{$asset->name}->hashFile = $asset->destination.$asset->name.".hash";
            $this->assets->{$asset->name}->hash = "";
        }
        public function run($req, $res) {
            
            $this->req = $req;
            $this->res = $res;
            $this->root = $req->fabrico->paths->root;
            
            $res->assets = $this;
            foreach($this->assets as $name => $data) {
                $asset = $this->assets->$name;
                $asset->hashFile = $this->root.$asset->hashFile;
                if(file_exists($asset->hashFile)) {
                    $asset->hash = file_get_contents($asset->hashFile);
                }
            }
            
        }
        public function get($name){
        
            $asset = $this->getAsset($name);
            $result = "";
            $result .= $this->compileFiles($asset);
            $result .= $this->includeFiles($asset);
            
            return $result;
            
        }
        public function compileFiles($asset) {
        
            if(isset($asset->sourceToCompile) && count($asset->sourceToCompile) > 0 && (!isset($asset->preventCompiling) || $asset->preventCompiling === false)) {
            
                if(defined("DEBUG") && DEBUG) {
                    $this->toLog('compile -> '.$asset->name);
                }
            
                if($asset->hash != "") {
                    if(file_exists($asset->hashFile)) {
                        unlink($asset->hashFile);
                    }
                    if(file_exists($this->root.$asset->destination.$asset->hash.".".$asset->extension)) {
                        unlink($this->root.$asset->destination.$asset->hash.".".$asset->extension);
                    }
                }

                $joiner = new FileJoin($this->root);
                $content = $joiner->run($asset->sourceToCompile);
                $asset->hash = md5($content);
                file_put_contents($asset->hashFile, $asset->hash);
                file_put_contents($this->root.$asset->destination.$asset->hash.".".$asset->extension, $content);
                
                return $this->getTag($asset->destination.$asset->hash.".".$asset->extension, $asset->extension);
                
            } else {
                if(file_exists($this->root.$asset->destination.$asset->hash.".".$asset->extension)) {
                    if(defined("DEBUG") && DEBUG) {
                        $this->toLog('include hash -> '.$asset->name);
                    }
                    return $this->getTag($asset->destination.$asset->hash.".".$asset->extension, $asset->extension);
                } else {
                    return "";
                }
            }
            
        }
        public function includeFiles($asset) {
        
            if(isset($asset->sourceToInclude) && count($asset->sourceToInclude) > 0) {
        
                if(defined("DEBUG") && DEBUG) {
                    $this->toLog('include -> '.$asset->name);
                }
            
                $result = "";
                foreach($asset->sourceToInclude as $dir) {
                    $files = rglob($this->root.$dir);
                    foreach($files as $file) {
                        $file = str_replace($this->root, "", $file);
                        $result .= $this->getTag($file, $asset->extension);
                    }
                }
                
                return $result;
            
            } else {
                return "";
            }
            
        }
        private function getAsset($name) {
            $asset = isset($this->assets->$name) ? $this->assets->$name : null;
            if($asset == null) {
                throw new Exception("Missing asset with name = '".$name."'");
            }
            return $asset;
        }
        private function getTag($file, $ext) {
            $file = $this->req->fabrico->paths->url.$file;
            switch($ext) {
                case "js":
                    return '<script src="'.$file.'"></script>';
                break;
                case "css":
                    return '<link rel="stylesheet" href="'.$file.'" />';
                break;
                default:
                    return $file;
                break;
            }                
        }
        private function toLog($str) {
            $this->logStr .= '<div class="debug" style="background:#CAFCC2">AssetsManager: '.$str.'</div>';
        }
        public function log() {
            echo $this->logStr;
        }
    
    };

?>