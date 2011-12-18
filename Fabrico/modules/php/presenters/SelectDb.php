<?php

    /*
    
    {
        "name": "descriptionaa",
        "presenter": "presenters/SelectDb.php",
        "config": {
            "model": "models/categories.json",
            "field": "categoryLabel"
        }
    }
    
    */

    require_once("presenters/Presenter.php");
    require_once("tools/RedBean.php");

    class SelectDb extends Presenter {
        
        public function __toString() {
            return "SelectDb";
        }
        public function listing($value) {
            $model = $this->req->fabrico->models->get($this->config->model);
            if($model) {
                $items = $model->get()->order("position")->desc()->flush();
                if($items) {
                    foreach($items as $item) {
                        if($item->id == $value) {
                            return $item->{$this->config->field};
                        }
                    }
                }
                return "";
            } else {
                throw new Exception($this.": model '".$this->config->model."' could not be found.");
            }
        }
        public function add($default = null) {
            $options = "";
            $model = $this->req->fabrico->models->get($this->config->model);
            if($model) {
                $items = $model->get()->order("position")->desc()->flush();
                if($items) {
                    foreach($items as $item) {
                        $options .= $this->view("option.html", array(
                            "key" => $item->id,
                            "label" => $item->{$this->config->field},
                            "selected" => $default == $item->id ? 'selected="selected"' : ""
                        ));
                    }
                }
                return $this->view("adding.html", array(
                    "field" => $this->name,
                    "options" => $options
                ));
            } else {
                throw new Exception($this.": model '".$this->config->model."' could not be found.");
            }
        }
        public function addAction() {
            if(isset($this->req->body->{strtolower($this->name)})) {
                return $this->req->body->{strtolower($this->name)};
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