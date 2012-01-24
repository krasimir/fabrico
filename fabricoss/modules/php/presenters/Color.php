<?php

    inject("presenters/Text.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "colorField",
        \t"presenter": "presenters/Color.php",
        \t"label": "[string]", // optional
        \t"defaultValue": "[string]", // optional
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optional
    }
    </pre>
    * @package Fabrico\Modules\Presenters
    */
    class Color extends Text {
        
        public function __toString() {
            return "Color";
        }
        public function listing($value) {
            $this->setResponse($this->view("listing.html", array(
                "color" => $value
            )));
            return $this;
        }
    
    }
    
?>