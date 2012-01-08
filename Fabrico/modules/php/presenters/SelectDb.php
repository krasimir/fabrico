<?php

    inject("presenters/Presenter.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "category",
        \t"presenter": "presenters/SelectDb.php",
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
                            $this->setResponse($item->{$this->config->field});
                        }
                    }
                }
                if(!$found) {
                    $this->setResponse("");
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
                $this->setResponse($this->view("adding.html", array(
                    "field" => $this->name,
                    "options" => $options
                )));
            } else {
                throw new Exception($this.": model '".$this->config->model."' could not be found.");
            }
            return $this;
        }
        public function addAction() {
            if(isset($this->req->body->{strtolower($this->name)})) {
                $this->setResponse($this->req->body->{strtolower($this->name)});
            } else {
                $this->setResponse(null);
            }
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
    
    }
    
?>