<?php

    function readJSON($file) {
        if(!file_exists($file)) {
            throw new Exception("readJSON: missing file '".$file."'!");
        } else {
            $result = json_decode(file_get_contents($file));
            if($result == null) {
                throw new Exception("readJSON: error reading '".$file."'!");
            } else {
                return json_decode(file_get_contents($file));
            }
        }
    }

?>