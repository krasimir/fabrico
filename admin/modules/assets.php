<?php

    function assets() {
        return json_decode('
            {
                "type": "assets",
                "assets": [
                    {
                        "name": "javascript", 
                        "sourceToCompile": [
                            "/js/jquery/jquery-1.7.1.min.js",
                            "/js/calendar/*.js",
                            "/js/color/*.js",
                            "/js/utils/*.js",
                            "/js/presenters/*.js",
                            "/js/bootstrap/*.js"
                        ],
                        "sourceToInclude": [
                            "/js/tinymce/tiny_mce.js"
                        ],
                        "destination": "/assets/compiled/",
                        "extension": "js",
                        "preventCompiling": false
                    },
                    {
                        "name": "css", 
                        "sourceToCompile": [
                            "/assets/css/*.css"
                        ],
                        "sourceToInclude": [
                        
                        ],
                        "destination": "/assets/compiled/",
                        "extension": "css"
                    }
                ]
            }
        ');
    }
    
?>