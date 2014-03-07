<?php


class Comment extends Eloquent {

        
	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'comments';


        public function user()
        {
            return $this->belongsTo('User');
        }
        
        public function message(){
            return $this->belongsTo('Message');
        }
        
}