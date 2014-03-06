<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function()
{
	return View::make('hello');
});


Route::get('/resistence', function()
{
	return View::make('resistence');
});
//
//Route::get('users', function()
//{
//    $users = User::all();
//
//    return View::make('users')->with('users', $users);
//});

//Route::get('usersC', 'UserController@getIndex');

Route::controller('users', 'UserController');


Route::controller('register', 'RegistrationController');

Route::controller('message', 'MessageController');