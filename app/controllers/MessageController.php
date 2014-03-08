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

            //$data = array("name"=> "Pranav");
             Event::fire(UpdateMessageEventHandler::EVENT, $message);
            
            return "Successfull";
        }else{
            return Response::make("Please sign in to the application", 403);
        }
    }
    
        
    public function getAllbroadcast() {
                
        //$messages = Message::with('User')->get();
        $messages = Message::with('User','Comments','Comments.user')->get();
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
    
    public function postApprovemessage(){
        if(Auth::check()){
            
            $messageid = Input::get('messageid');
            $message = Message::find($messageid);
            if(isset($message->like)){
                $message->like = $message->like + 1;
            }else{
                $message->like = 1;
            }
            
            $message->save();
            return $message->like;
        }else{
            return Response::make("Please sign in to the application", 403);
        }
        
    }
    
    public function postRejectmessage(){
        if(Auth::check()){
            
            $messageid = Input::get('messageid');
            $message = Message::find($messageid);
            if(isset($message->unlike)){
                $message->unlike = $message->unlike + 1;
            }else{
                $message->unlike = 1;
            }
            
            $message->save();
            return $message->unlike;
        }else{
            return Response::make("Please sign in to the application", 403);
        }
    }
}

?>