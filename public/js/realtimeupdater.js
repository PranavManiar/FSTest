$(document).ready(function(){
    var socket = io.connect('http://128.199.216.224:3000/');

    //socket.on('connect', function(data){
    //    socket.emit('subscribe', {channel:'score.update'});
    //});

    socket.on('message.update', function (data) {
        //Do something with data
    //console.log('Message updated: ', data);
        //Buid the div and append it to the top of the message section

    var jsonData = $.parseJSON(data);
    //console.log('UserName ' + data.user);
    
    var userName = jsonData.user.username;
    var userRole = (jsonData.user.userrole != null ) ? jsonData.user.userrole : "";
    var createdAt = jsonData.created_at;
    var messageText = jsonData.message;
    
    var isLeader = (jsonData.user.isleader == 1) ? true :false;
    var isLoggedIn = ($('#aLogin').length > 0 ) ? false : true;
    
    
    var messageId = jsonData.id;
    var messageLike = 0;
    var messageUnlike = 0;
    var messageWrapperClass = "message-wrapper";
    
    if(isLeader){
         messageWrapperClass= "message-wrapper-leader";
    }else{
        messageWrapperClass = "message-wrapper"
    }

    var divMessage = '<div class="row clearfix"> <div class="col-md-2 column" > '
                                                    +'<img class="img-thumbnail img-message ' + messageWrapperClass 
                                                    + ' " alt="140x140" src="image/defaultprofile.jpg"  > '
                                                    + '</div> <div class="col-md-10 column ' +  messageWrapperClass + ' " > '
                                                    + '<div class="row clearfix"> <div class="col-md-12 column message-header"> '
                                                    + '<div class="row clearfix"> <div class="col-md-8 column"> '
                                                    + '<a href="#" > '+ userName + '</a> <span >' + userRole + '</span>'
                                                    + '	</div> 	<div class="col-md-4 column"> <span >'+ createdAt+'</span>'
                                                    + '</div> </div> </div> </div> '
                                                    + '<div class="row clearfix"> <div class="col-md-12 column message-text" > '
                                                    + '<span>'+messageText + '</span>'
                                                    + '</div> </div> <div class="row clearfix"> <div class="col-md-12 column">	<div class="row clearfix"> '
                                                    + '<div class="col-md-5 column">';


    if (isLoggedIn && !isLeader ){
            divMessage = divMessage + '<span id="messageapprove-' +messageId +'">'+messageLike+'</span>'
                                                    + '<a href="#"> <img class="img-thumbnail img-approval"alt="approve" src="image/approve.png" onclick="approveMessage('+ messageId+')" >'
                                                    + '</a> <span id="messagereject-'+messageId+'">'+messageUnlike+' </span>'
                                                    + '<a href="#">	<img class="img-thumbnail img-approval"alt="approve" src="image/reject.png"  onclick="rejectMessage('+messageId+')">'
                                                    +'</a>';

    }

    divMessage = divMessage + '<a id="showcommentbtn-'+messageId+'" href="#" class="btn" type="button" onclick="toggleComment('+messageId+');">Show Comments</a>';
    divMessage = divMessage + '</div> <div class="col-md-1 column"> </div>	<div class="col-md-2 column">	</div> 	<div class="col-md-4 column"> ';

    if(isLoggedIn){
            divMessage = divMessage + '<a href="#" class="btn" type="button" onclick="showComment( '+messageId+' ); " >Add Comment</a>'
                +'<a href="#" class="btn" type="button" onclick="saveMessage('+messageId+'); ">Save Message</a>';
    }
    divMessage = divMessage               + '</div> </div>	</div>	</div>	</div> </div>'
                                            + '<div id="commentdiv-'+messageId+'" style="display:none;"></div>'
                                            + '<div class="row clearfix" id="addcomment-'+messageId+'" style="display:none;padding-bootom:10px;padding-top:5px;">'
                                            + '<div class="col-md-3 column"> </div> <div class="col-md-9 column "> <div class="row clearfix"> <div class="input-group addcommentdiv" >'
                                            + '<input type="text" class="form-control" placeholder="Add Comment" name="comment" id = "addcommentinput-'+messageId+'">'
                                            + '<span class="input-group-btn"><button class="btn btn-default" type="button" onclick="addComment('+messageId+')">Add Comment</button>'
                                            + '</span><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="closeComment('+messageId+')">X</button>'
                                            + '</span></div></div></div></div>';


    //console.log('Div is created');
   // console.log(divMessage);
    $('#messsageWrapperDiv').prepend(divMessage);        
    //console.log('Div is appended to the parent Div !!!!');
      });
});

