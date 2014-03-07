<?php

class CommentController extends BaseController {

    
    public function __construct() {
    
    }
    
    public function getAllbroadcast() {
                
        $comments = Comment::with('Message')->get();
        
        return $comments;
    }
    
    
    

}

?>