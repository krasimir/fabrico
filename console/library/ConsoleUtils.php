<?php

    class ConsoleUtils {
        
        public static function formatJSON($jsonObj, $initialIndent = 0) {
            $jsonString = stripslashes(json_encode($jsonObj));
            $tabcount = 0;
            $result = '';
            $inquote = false;
            $tab = "    ";
            $initialIndent = str_repeat($tab, $initialIndent);
            $newline = "\n";
            for($i = 0; $i < strlen($jsonString); $i++) {
                $char = $jsonString[ $i];
                if($char == '"' && $jsonString[$i-1] != '\\') {
                    $inquote = !$inquote;
                }
                if($inquote) {
                    $result .= $char;
                    continue;
                }
                switch($char) {
                    case '{':
                        if($i) {
                            $result .= $newline.$initialIndent;
                        }
                        $result .= str_repeat($tab, $tabcount).$char.$newline.$initialIndent.str_repeat($tab, ++$tabcount);
                    break;
                    case '[':
                        $result .= $char;
                        $tabcount += 1;
                    break;
                    case '}':
                        $tabcount = $tabcount-1 > 0 ? $tabcount - 1 : 0;
                        $result .= $newline.$initialIndent.str_repeat($tab, $tabcount).$char;
                    break;
                    case ']':
                        $tabcount = $tabcount-1 > 0 ? $tabcount - 1 : 0;
                        $result .= $newline.$initialIndent.str_repeat($tab, $tabcount).$char;
                    break;
                    case ',':
                        $result .= $char;
                        if($jsonString[$i+1] != '{') $result .= $newline.$initialIndent.str_repeat($tab, $tabcount);
                    break;
                    default:
                        $result .= $char;
                }
            }
            return $result;
        } 
    
    }


?>