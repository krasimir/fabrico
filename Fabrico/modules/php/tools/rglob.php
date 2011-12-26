<?php
    function rglob($pattern='*', $flags = 0, $path='') {
        if (!$path && ($dir = dirname($pattern)) != '.') {
            if ($dir == '\\' || $dir == '/') $dir = '';
            return rglob(basename($pattern), $flags, $dir . '/');
        }
        $paths = glob($path.'*', GLOB_ONLYDIR | GLOB_NOSORT);
        $files = glob($path.$pattern, $flags);
        if($paths) {
            foreach($paths as $p) {
                if($files === false) {
                    $files = array();
                }
                $files = array_merge($files, rglob($pattern, $flags, $p . '/'));
            }
        }
        return $files;
    }
?>