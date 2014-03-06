<?php

class MessageController extends BaseController {

    
    public function __construct() {

    }
    

    
    public function postBroadcast() {
        
        $user = Auth::user();
        $message = new Message;
        $message->message = Input::get('message');
        $message->user()->associate($user);
        $message->save();
         
        return "Successfull";
    }
    
        
    public function getBroadcast() {
        
        $user = Auth::user();
        $message = new Message;
        $message->message = "message";
       $message->user()->associate($user);
       $message->save();
         
        return "Successfull";
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