<?php

    function controllers() {
        return json_decode('{
            "type":"Controllers",
            "controllers":
            {
                "testcontroller":
                {
                    "modelToAdministrate":"testmodel",
                    "pageTitle":"Test Model",
                    "title":"Test",
                    "fields":[
                        {
                            "name":"job",
                            "presenter":"presenters/Select.php",
                            "config":
                            {
                                "options":[
                                    {
                                        "key":"",
                                        "label":"Please choose your job"
                                    },
                                    {
                                        "key":"PHP",
                                        "label":"PHP developer"
                                    },
                                    {
                                        "key":"Javascript",
                                        "label":"Javascript developer"
                                    },
                                    {
                                        "key":"AS3",
                                        "label":"ActionScript3"
                                    }
                                ]
                            },
                            "label":"Your job",
                            "description":"Your current job",
                            "validators":[
                                {
                                    "class":"validators/NotEmpty.php",
                                    "message":"Please choose your job!"
                                }
                            ]
                        }
                    ]
                }
            }
        }');
    };

?>