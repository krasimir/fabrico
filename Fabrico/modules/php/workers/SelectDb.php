<?php

    /*
    
    The following configuration must be added in /config/config.json:
    "workers": {
        [your custom key here]: {
            "table": "[table name]",
            "keyColumn": "[name of table column]",
            "labelColumn": "[name of table column]"
        }
    }
    
    */

    require_once("workers/Worker.php");
    require_once("tools/RedBean.php");

    class SelectDb extends Worker {
        
        public function __toString() {
            return "SelectDb";
        }
        public function listing($value) {
            $config = $this->getConfig();
            $items = R::getAll("SELECT * FROM ".$config->table." ORDER BY position DESC");
            foreach($items as $item) {
                if($item[$config->keyColumn] == $value) {
                    return $item[$config->labelColumn];
                }
            }
            return $value;
        }
        public function add($default = null) {
            $options = "";
            $config = $this->getConfig();
            $items = R::getAll("SELECT * FROM ".$config->table." ORDER BY position DESC");
            foreach($items as $item) {
                $options .= $this->view("option.html", array(
                    "key" => $item[$config->keyColumn],
                    "label" => $item[$config->labelColumn],
                    "selected" => $default == $item[$config->keyColumn] ? 'selected="selected"' : ""
                ));
            }
            return $this->view("adding.html", array(
                "field" => $this->field,
                "options" => $options
            ));
        }
        public function addAction() {
            if(isset($this->req->body->{strtolower($this->field)})) {
                return $this->req->body->{strtolower($this->field)};
            } else {
                return null;
            }
        }
        public function edit($value) {
            return $this->add($value);
        }
        public function editAction($value) {
            return $this->addAction();
        }
    
    }
    
?>