<?php

    class IncludePath {
        public static function add($path) {
            foreach (func_get_args() AS $path)
            {
                if (!file_exists($path) OR (file_exists($path) && filetype($path) !== 'dir'))
                {
                    trigger_error("Include path '{$path}' not exists", E_USER_WARNING);
                    continue;
                }
                
                $paths = explode(PATH_SEPARATOR, get_include_path());
                
                if (array_search($path, $paths) === false)
                    array_push($paths, $path);
                
                set_include_path(implode(PATH_SEPARATOR, $paths));
            }
        }
        public static function remove($path) {
            foreach (func_get_args() AS $path)
            {
                $paths = explode(PATH_SEPARATOR, get_include_path());
                
                if (($k = array_search($path, $paths)) !== false)
                    unset($paths[$k]);
                else
                    continue;
                
                if (!count($paths))
                {
                    trigger_error("Include path '{$path}' can not be removed because it is the only", E_USER_NOTICE);
                    continue;
                }
                
                set_include_path(implode(PATH_SEPARATOR, $paths));
            }
        }
    }
    
?>