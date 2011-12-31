<?php

    inject("presenters/Text.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "colorField",
        \t"presenter": "presenters/Color.php"
    }
    </pre>
    * @package Fabrico\Modules\Presenters
    */
    class Color extends Text {
        
        public function __toString() {
            return "Color";
        }
        public function listing($value) {
            $this->response = $this->view("listing.html", array(
                "color" => $value
            ));
            return $this;
        }
    
    }
    
?>