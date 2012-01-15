<?php

    inject("utils/rglob.php");

    /**
    * @package Fabrico\Modules\Utils
    */
    class FileJoin {
        private $root;
        public function __construct($root = ""){
            $this->root = $root;
        }

        public function run($dirs) {
            $result = "";
            if(!is_array($dirs)) {
                $dirs = array($dirs);
            }
            foreach($dirs as $dir) {
                $result .= $this->join(rglob($this->root.$dir))."\n";
            }
            return $result;
        }

        public function join($files) {
            $numOfFiles = count($files);
            $str = "";
            for($i=0; $i<$numOfFiles; $i++) {
                $file = $files[$i];
                $fh = @fopen($file, "r");
                if(!$fh){
                    throw new Exception("error reading file '".$file."'");
                } else {
                    $str .= fread($fh, filesize($file))."\n";
                    fclose($fh);
                }
            }
            return $str;
        }
    }
?>