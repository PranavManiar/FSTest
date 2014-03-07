<?php

class DefaultController extends BaseController {

    
    public function __construct() {
          //   $this->beforeFilter('auth', array('only'=>array('postBroadcast')));
    }
    
    public function defaultHandler(){
        
        $messages = Message::with('User','Comments','Comments.user')->orderBy('created_at','desc')->get();
        
        return View::make('resistence', array(
            'broadcastMessages' => $messages
        ));
        
    }
    
    public function showSavedMesages(){
        
        if(Auth::check()){
            
            $cuser = Auth::user();
        
            $id = $cuser->id;
            //$savedMessages = $user->savedmessages();
            //$savedMessages = $user::with('savedmessages')->get();
            //$savedMessages = Message::with(array('user','savedbyusers'))->where('user_saed_messages.user_id','=',$user->id)->get();
            $savedMessages = Message::with(array('user'))->whereHas('savedbyusers',function($q) use ($id){
                
                $q->where('user_id' , '=' ,$id);
            })->get();
  
           
            return View::make('resistence', array(
            'broadcastMessages' => $savedMessages,
                'hideSaveMessage'=> false
        ));
            
            //return $savedMessages;
            //return "Successfull";
        }else{
            return Response::make("Please sign in to the application", 403);
        }
        
    }

}

?>