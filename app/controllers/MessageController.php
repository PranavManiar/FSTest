<?php

class MessageController extends BaseController {

    
    public function __construct() {
          //   $this->beforeFilter('auth', array('only'=>array('postBroadcast')));
    }
    

    
    public function postBroadcast() {
        
        if(Auth::check()){
            
            $user = Auth::user();
            $message = new Message;
            $message->message = Input::get('message');
            $message->user()->associate($user);
            $message->save();

            return "Successfull";
        }else{
            return Response::make("Please sign in to the application", 403);
        }
    }
    
        
    public function getAllbroadcast() {
                
        //$messages = Message::with('User')->get();
        $messages = Message::with('User','Comments')->get();
        return $messages;
    }
    
    public function postSavemessage(){
        
        if(Auth::check()){
            
            $user = Auth::user();
            //$message = new Message;
            //$message->message = Input::get('message');
            //$message->user()->associate($user);
            //$message->save();
            $messageid = Input::get('messageid');
            $user->savedmessages()->attach($messageid);
            
            
            return "Successfull";
        }else{
            return Response::make("Please sign in to the application", 403);
        }
    }
    
    

}

?>