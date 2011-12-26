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

    inject("presenters/Presenter.php");

    class SelectDb extends Presenter {
        
        public function __toString() {
            return "SelectDb";
        }
        public function listing($value) {
            $model = $this->req->fabrico->models->get($this->config->model);
            if($model) {
                $items = $model->get()->order("position")->desc()->flush();
                $found = false;
                if($items) {
                    foreach($items as $item) {
                        if($item->id == $value) {
                            $found = true;
                            $this->response = $item->{$this->config->field};
                        }
                    }
                }
                if(!$found) {
                    $this->response = "";
                }
            } else {
                throw new Exception($this.": model '".$this->config->model."' could not be found.");
            }
            return $this;
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
                $this->response = $this->view("adding.html", array(
                    "field" => $this->name,
                    "options" => $options
                ));
            } else {
                throw new Exception($this.": model '".$this->config->model."' could not be found.");
            }
            return $this;
        }
        public function addAction() {
            if(isset($this->req->body->{strtolower($this->name)})) {
                $this->response = $this->req->body->{strtolower($this->name)};
            } else {
                $this->response = null;
            }
            return $this;
        }
        public function edit($value) {
            $this->response = $this->add($value)->response->value;
            return $this;
        }
        public function editAction($value) {
            $this->response = $this->addAction()->response->value;
            return $this;
        }
    
    }
    
?>