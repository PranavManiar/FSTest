<?php

class CommentController extends BaseController {

    
    public function __construct() {
    
    }
    
    public function getAllbroadcast() {
                
        $comments = Comment::with('Message')->get();
        
        return $comments;
    }
    
    
    public function postSavecomment(){
        
         if(Auth::check()){
            
             $user = Auth::user();
             
            $commentText = Input::get('comment');
            $messageid = Input::get('messageid');
            $message = Message::find($messageid);
            $comment = new Comment;
            $comment->commenttext = $commentText;
            $comment->user()->associate($user);
            $comment->message()->associate($message);
            $comment->save();
            
            return $comment;
        }else{
            return Response::make("Please sign in to the application", 403);
        }
    }
    
    

}

?>