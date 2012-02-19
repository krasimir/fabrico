<?php

    inject("presenters/Text.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "descriptionField",
        \t"presenter": "presenters/TextLong.php",
        \t"label": "[string]", // optional
        \t"defaultValue": "[string]", // optional
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optiona
    }
    </pre>
    * @package Fabrico\Library\Presenters
    */
    class TextLong extends Text {
    
        public function __toString() {
            return "TextLong";
        }
        public function listing($value) {
            if(strlen($value) > 300) {
                $this->setResponse(substr($value, 0, 300)."...");
            } else {
                $this->setResponse($value);
            }
            return $this;
        }
    
    }
    
?>