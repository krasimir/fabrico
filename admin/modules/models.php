<?php

    function models() {
        return json_decode('{
            "type":"Models",
            "adapters":"modules/adapters.php",
            "models":
            {
                "testmodel":
                {
                    "adapter":"adapters/MySQL.php",
                    "freeze":false,
                    "fields":[
                        {
                            "name":"username"
                        },
                        {
                            "name":"email"
                        },
                        {
                            "name":"job"
                        }
                    ]
                }
            }
        }');
    };

?>