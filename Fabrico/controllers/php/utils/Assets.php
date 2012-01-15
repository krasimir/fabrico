<?php
    /**
    * Initialize the assests of Fabrico
    * @package Fabrico\Controllers\Utils
    */
    class Assets {
        public function run($req, $res) {
            $assets = $req->fabrico->config->get("fabrico.assets");
            foreach($assets as $asset) {
                $req->fabrico->assets->add($asset);
            }
        }
    }
?>