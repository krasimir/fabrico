<?php

    class Custom {
        public function __construct($router) {
            echo "Custom->constructor<br />";
        }
        public function run($req, $res) {
            echo "Custom->run<br />";
        }
    }

?>