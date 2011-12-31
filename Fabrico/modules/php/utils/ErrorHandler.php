<?php
    /*
    Code inspired from:

    /**
     * Flight: An extensible micro-framework.
     *
     * @copyright   Copyright (c) 2011, Mike Cao <mike@mikecao.com>
     * @license     http://www.opensource.org/licenses/mit-license.php
     */
    
    function error(Exception $e) {
    
        global $ERROR_HANDLER_CONTROLLER;
    
        // always output to log first
        $output = 'Message:'.$e->getMessage().'\n\r'.' File:'.$e->getFile().' Line:'.$e->getLine().'\n\r'.' Trace: '.$e->getTraceAsString();
        error_log($output);
        
        // show as raw response using Response.php style
        if($ERROR_HANDLER_CONTROLLER != "") {
            inject($ERROR_HANDLER_CONTROLLER);
            $handlerClass = getFilename($ERROR_HANDLER_CONTROLLER);
            new $handlerClass($e);
        } else {
            header((isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.1').' Internal Server Error', true, 500);
            exit(
                '<h1>500 Internal Server Error</h1>'.
                '<h3>Message:'.$e->getMessage().'</h3>'.
                '<h4>File:'.$e->getFile().' Line:'.$e->getLine().'</h4>'.
                '<pre>'.$e->getTraceAsString().'</pre>'
            );
        }
        
    }
    /**
     * shutdown
     */
    function shutdown() {
        
    }
    /**
     * Custom error handler.
     */
    function handleError($errno, $errstr, $errfile, $errline) {
        try {
           error(new ErrorException($errstr, 0, $errno, $errfile, $errline));
        } catch (Exception $ex) {
            // if error logging fails, tray again to log the error during error logging :)
            $output = 'message: '.$ex->getMessage().'\n'.'trace: '.$ex->getTraceAsString().'\n';
            error_log($output);
            exit();
        }
    }
    /**
     * Custom exception handler.
     */
    function handleException(Exception $e) {
        try {
            error($e);
        } catch (Exception $ex) {
            // if error logging fails, tray again to log the error during error logging :)
            $output = 'message: '.$ex->getMessage().'\n'.'trace: '.$ex->getTraceAsString().'\n';
            error_log($output);

            // silently exit
            exit();
        }
    }
    function getFilename($path) {
        $parts = explode("/", $path);
        $parts = explode(".", array_pop($parts));
        return $parts[0];
    }
    
    $ERROR_HANDLER_CONTROLLER = "";
        
    set_error_handler('handleError');
    set_exception_handler('handleException');
    register_shutdown_function('shutdown'); 
    
    error_reporting(E_ALL);
    
?>