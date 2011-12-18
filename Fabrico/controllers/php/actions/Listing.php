<?php

    require_once("actions/Action.php");
    require_once("presenters/Presenter.php");

    class Listing extends Action {
        
        public function __toString() {
            return "Listing";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $items = $this->model->get()->order("position")->desc()->flush();
            
            $fields = $this->model->fields;
            
            if($items) {
                
                $tableRows = '';
                
                // adding rows
                foreach($items as $item) {
                    $tableColumns = '';
                    foreach($fields as $field) {
                        $value = $item->{$field->name};
                        $presenter = $this->getPresenter($field);
                        $tableColumns .= $this->view("column.html", array(
                            "data" => $presenter ? $presenter->listing($value) : $value
                        ));
                    }
                    $tableColumns .= $this->view("columnOptions.html", array(
                        "id" => $item->id,
                        "http" => $req->fabrico->root->http.$this->controller->url
                    ));
                    $tableRows .= $this->view("row.html", array(
                        "columns" => $tableColumns
                    ));
                }
                
                $fieldsRow = '';
                $fieldsColumns = '';
                
                // adding table headers
                foreach($fields as $field) {
                    $fieldsColumns .= $this->view("column.html", array(
                        "data" => isset($field->label) ? $field->label : $field->name
                    ));
                }
                $fieldsColumns .= $this->view("column.html", array(
                    "data" => "Actions"
                ));
                $fieldsRow .= $this->view("rowHeader.html", array(
                    "columns" => $fieldsColumns
                ));
                
                // wrapping everything
                $content = "";
                $content .= $this->view("subnav.html", array(
                    "http" => $req->fabrico->root->http.$this->controller->url
                ));
                $content .= $this->view("table.html", array(
                    "rows" => $fieldsRow.$tableRows
                ));
                
                $this->controller->response($content, $req, $res);
                
            } else {
                $content = "";
                $content .= $this->view("subnav.html", array(
                    "http" => $req->fabrico->root->http.$this->controller->url
                ));
                $content .= $this->view("norecords.html");
                $this->controller->response($content, $req, $res);
            }
        }
    
    }

?>