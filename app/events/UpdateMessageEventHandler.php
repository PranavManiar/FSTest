<?php

class UpdateMessageEventHandler {
 
    CONST EVENT = 'message.update';
    CONST CHANNEL = 'message.update';
 
    public function handle($data)
    {
        $redis = Redis::connection();
        $redis->publish(self::CHANNEL, $data);
    }
}
