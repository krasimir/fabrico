<?php

    inject(array(
        "presenters/Presenter.php",
        "actions/Action.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages\Actions
    */
    class Listing extends Action {
        
        public function __toString() {
            return "Listing";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $items = $this->model->get()->order("position")->desc()->flush();
            $fields = $this->model->fields;
            forEachView(array("controllerURL" => $this->controller->url));
            
            if($items) {
                
                $dataRows = '';
                $dataColumns = '';
                
                $fieldsToHide = array();
                if($this->model->actions !== null && isset($this->model->actions->listing) && isset($this->model->actions->listing->fieldsToHide)) {
                    $fieldsToHide = $this->model->actions->listing->fieldsToHide;
                }
                
                // adding rows
                foreach($items as $item) {
                    $dataColumns = '';
                    foreach($fields as $field) {
                        if(!in_array($field->name, $fieldsToHide)) {
                            $value = $item->{$field->name};
                            $presenter = $this->getPresenter($field);
                            $dataColumns .= $this->view("column.html", array(
                                "data" => $presenter ? $presenter->listing($value)->response->value : $value
                            ));
                        }
                    }
                    $optionsView = "columnOptionsPositionUpDown.html";
                    if($this->model->actions !== null && isset($this->model->actions->listing) && isset($this->model->actions->listing->positionEditing)) {
                        switch($this->model->actions->listing->positionEditing) {
                            case "direct":
                                $optionsView = "columnOptionsPositionDirect.html";
                            break;
                            default: 
                                $optionsView = "columnOptionsPositionUpDown.html";
                            break;
                        }
                    }
                    $dataColumns .= $this->view("column.html", array(
                        "data" => $this->view($optionsView, array(
                            "id" => $item->id,
                            "position" => $item->position
                        ))
                    ));
                    $dataRows .= $this->view("row.html", array(
                        "columns" => $dataColumns
                    ));
                }
                
                $fieldsRow = '';
                $fieldsColumns = '';
                
                // adding table headers
                foreach($fields as $field) {
                    if(!in_array($field->name, $fieldsToHide)) {
                        $fieldsColumns .= $this->view("columnHeader.html", array(
                            "data" => isset($field->label) ? $field->label : $field->name
                        ));
                    }
                }
                $fieldsColumns .= $this->view("columnHeader.html", array(
                    "data" => "Actions"
                ));
                $fieldsRow .= $this->view("row.html", array(
                    "columns" => $fieldsColumns
                ));
                
                // wrapping everything
                $content = "";
                $content .= $this->view("subnav.html");
                $content .= $this->view("table.html", array(
                    "head" => $fieldsRow,
                    "body" => $dataRows
                ));
                
                $this->controller->response($content, $req, $res);
                
            } else {
                $content = "";
                $content .= $this->view("subnav.html");
                $content .= $this->view("norecords.html");
                $this->controller->response($content, $req, $res);
            }
        }
    
    }

?>