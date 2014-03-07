<?php


class Message extends Eloquent {

        
	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'messages';


        public function user()
        {
            return $this->belongsTo('User');
        }
        
        public function comments(){
            return $this->hasMany('Comment');
        }
        
        public function savedbyusers(){
            
            return $this->belongsToMany('User','user_saved_messages');
        }
        
        
}