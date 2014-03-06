<?php

class RegistrationController extends BaseController {
   
    
    public function __construct() {
       // $this->beforeFilter('csrf', array('on'=>'post'));
        //$this->beforeFilter('auth', array('only'=>array('getDashboard')));
    }
    
    
    public function getRegister() {
        $this->layout->content = View::make('users.register');
    }
    
    public function getLogin() {
        $this->layout->content = View::make('users.login');
    }
    
    public function postRegisteruser() {
        
        $validator = Validator::make(Input::all(), User::$rules);
        
        if ($validator->passes()) {
            // validation has passed, save user in DB
            
            $user = new User;
            $user->firstname = 'Pranav';
            $user->lastname = 'Maniar';
            $user->username = Input::get('username');
            $user->email = Input::get('email');
            $user->password = Hash::make(Input::get('password'));
            $user->save();
            
            return "Successfull";
            //return Redirect::to('register/')->with('message', 'Thanks for registering!');
        } else {
            // validation has failed, display error messages   
             //return Redirect::to('users/register')->with('message', 'The following errors occurred')->withErrors($validator)->withInput();
            
            //return $validator->messages();
            return Response::make($validator->messages(), 400);
        }
         
    }
    
    
    public function postSignin() {
        if (Auth::attempt(array('email'=>Input::get('email'), 'password'=>Input::get('password')))) {
           //return Redirect::to('users/dashboard')->with('message', 'You are now logged in!');
            
            Session::put('loggedinUser.email',Auth::user()->email);
            Session::put('loggedinUser.username', Auth::user()->username);
            
            return "Success";
       } else {
//           return Redirect::to('users/login')
//               ->with('message', 'Your username/password combination was incorrect')
//               ->withInput();
           return Response::make("Your username/password was incorrect", 400);
       }
    }
    
    public function getDashboard() {
        $this->layout->content = View::make('users.dashboard');
    }
    
    public function getLogout() {
        Session::forget('loggedinUser.email');
        Session::forget('loggedinUser.username');
        
        Auth::logout();
        return Redirect::to('/')->with('message', 'Your are now logged out!');
    }
    
    public function getId($id = null){
       // return Redirect::to('users/id');
        //return $id;
         return Redirect::to('users/id1')->with('message', "$id ");
        //return Redirect::to('users/login')->with('message', "$id ");
    }
}

?>
