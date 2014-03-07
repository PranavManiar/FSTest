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

//Route::get('/', function()
//{
//	return View::make('resistence');
//});


Route::get('/', 'DefaultController@defaultHandler');
Route::get('saved', 'DefaultController@showSavedMesages');

Route::controller('register', 'RegistrationController');
Route::controller('message', 'MessageController');
Route::controller('comment', 'CommentController');