<?php
/**
 * Flight: An extensible micro-framework.
 *
 * @copyright   Copyright (c) 2011, Mike Cao <mike@mikecao.com>
 * @license     http://www.opensource.org/licenses/mit-license.php
 */
class Request {
    /**
     * Constructor.
     *
     * @param array $config Request configuration
     */
    public function __construct($config = array()) {
        // Default properties
        if (empty($config)) {
            $config = array(
                'url' => $_SERVER['REQUEST_URI'],
                'host' => $this->getHost(),
                'base' => str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])),
                'method' => $_SERVER['REQUEST_METHOD'],
                'referrer' => isset($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:"",
                'ip' => $_SERVER['REMOTE_ADDR'],
                'ajax' => ((isset($_SERVER['HTTP_X_REQUESTED_WITH'])?$_SERVER['HTTP_X_REQUESTED_WITH']:"") == 'XMLHttpRequest'),
                'scheme' => $_SERVER['SERVER_PROTOCOL'],
                'user_agent' => $_SERVER['HTTP_USER_AGENT'],
                'body' => file_get_contents('php://input'),
                'type' => isset($_SERVER['CONTENT_TYPE'])?$_SERVER['CONTENT_TYPE']:"",
                'length' => isset($_SERVER['CONTENT_LENGTH'])?$_SERVER['CONTENT_LENGTH']:0,
                'query' => array(),
                'data' => $_POST,
                'cookies' => $_COOKIE,
                'files' => $_FILES
            );
        }
        
        self::init($config);
    }

    /**
     * Initialize request properties.
     *
     * @param array $properties Array of request properties
     */
    public function init($properties) {
        foreach ($properties as $name => $value) {
            $this->$name = $value;
        }

        if ($this->base != '/' && strpos($this->url, $this->base) === 0) {
            $this->url = substr($this->url, strlen($this->base));
        }

        if (empty($this->url)) {
            $this->url = '/';
        } else {
            $this->params = self::parseQueryParams($this->url);
        }
        
        if($this->base != "/") {
            $this->url = str_replace(str_replace(" ", "%20", $this->base), "", $this->url);
        }
    }

    /**
     * Parse query parameters from a URL.
     */
    public function parseQueryParams($url) {
        $params = array();

        $args = parse_url($url);
        if (isset($args['query'])) {
            parse_str($args['query'], $params);
        }

        return $params;
    }

    public function param($key, $defaultValue = NULL) {
        return isset($this->params[$key])?$this->params[$key]:$defaultValue;
    }
	
	public function getHost() {
		$host = 'http';
		if(isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on") {
			$host .= "s";
		}
		$host .= "://".$_SERVER['HTTP_HOST'];		
		return $host;
	}

    public function header($name) {
        if(strtolower($name) == "content-type")
           return $_SERVER['CONTENT_TYPE'];
        // TODO write all the others available... 
        return $_SERVER["HTTP_".strtoupper($name)];
    }
}
?>