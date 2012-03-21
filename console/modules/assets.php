<?php

    function assets() {
        return json_decode('
            {
                "type": "Assets",
                "assets": [
                    {
                        "name": "javascript", 
                        "sourceToCompile": [
                            "/js/jquery/jquery-1.7.1.min.js",
                            "/js/bootstrap/*.js",
                            "/js/console/*.js"
                        ],
                        "sourceToInclude": [
                            
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