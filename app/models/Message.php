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
        
}