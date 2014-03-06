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
        
        $user = Auth::user();
//        $message = new Message;
//        $message->message = "message";
//       $message->user()->associate($user);
//       $message->save();
         
        $messages = Message::all();
        
        return $messages;
    }
    
    
    
    public function postSignin() {
        if (Auth::attempt(array('email'=>Input::get('email'), 'password'=>Input::get('password')))) {
           return Redirect::to('users/dashboard')->with('message', 'You are now logged in!');
       } else {
           return Redirect::to('users/login')
               ->with('message', 'Your username/password combination was incorrect')
               ->withInput();
       }
    }

}

?>