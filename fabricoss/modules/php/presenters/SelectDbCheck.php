<?php

    inject("presenters/SelectCheck.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "category",
        \t"presenter": "presenters/SelectDbCheck.php",
        \t"config": {
            \t\t"model": "models/categories.json",
            \t\t"field": "categoryLabel"
        \t},
        \t"defaultValue": "[id|id|id|...]", // optional
        \t"label": "[string]", // optional
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optional
    }
    </pre>
    * @package Fabrico\Modules\Presenters
    */
    class SelectDbCheck extends SelectCheck {
        
        public function __toString() {
            return "SelectDbCheck";
        }
        public function listing($value) {
            $items = $this->getModelItems();
            $result = "";
            if($items) {
                $arr = explode("|", $value);
                foreach($items as $item) {
                    foreach($arr as $id) {
                        if($item->id == $id) {
                            $result .= $item->{$this->config->field}."<br />";
                        }
                    }
                }
            }
            $this->setResponse($result);
            return $this;
        }
        public function add($default = null) {
            $items = $this->getModelItems();
            $boxes = "";
            $default = $default == null ? isset($this->defaultValue) ? $this->defaultValue : array() : $default;
            $defaultArr = $default != null ? explode("|", $default) : array();
            if($items) {
                foreach($items as $item) {
                    $boxes .= $this->view("box.html", array(
                        "key" => $item->id,
                        "label" => $item->{$this->config->field},
                        "name" => $this->name."_".$item->id,
                        "checked" => in_array($item->id, $defaultArr) ? 'checked="checked"' : ""
                    ));
                }
            }
            $this->setResponse($this->view("adding.html", array(
                "boxes" => $boxes
            )));
            return $this;
        }
        public function addAction() {
            $items = $this->getModelItems();
            $result = "";
            foreach($items as $item) {
               if(isset($this->req->body->{strtolower($this->name."_".$item->id)})) {
                    $result .= $this->req->body->{strtolower($this->name."_".$item->id)}."|";
                }
            }
            $this->setResponse($result);
            return $this;
        }
        public function edit($value) {
            $this->setResponse($this->add($value)->response->value);
            return $this;
        }
        public function editAction($value) {
            $this->setResponse($this->addAction()->response->value);
            return $this;
        }
        private function getModelItems() {
            $model = $this->req->fabrico->models->get($this->config->model);
            $items = array();
            if($model) {
                $items = $model->get()->order("position")->desc()->flush();
            } else {
                throw new Exception($this.": model '".$this->config->model."' could not be found.");
            }
            return $items;
        }
    
    }
    
?>