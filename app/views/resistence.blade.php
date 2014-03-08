<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>The Resistence </title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  
  <meta name="author" content="">

	<!--link rel="stylesheet/less" href="less/bootstrap.less" type="text/css" /-->
	<!--link rel="stylesheet/less" href="less/responsive.less" type="text/css" /-->
	<!--script src="js/less-1.3.3.min.js"></script-->
	<!--append ‘#!watch’ to the browser URL, then refresh the page. -->
	
	<link href="packages/bootstrap/css/bootstrap.min.css" rel="stylesheet">
	<link href="packages/jquery-ui-1.10.4/themes/base/jquery-ui.css" rel="stylesheet">
	<link href="css/main.css" rel="stylesheet">
	 <!-- <link href="css/style.css" rel="stylesheet"> -->

  <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
  <!--[if lt IE 9]>
    <script src="js/html5shiv.js"></script>
  <![endif]-->

  <!-- Fav and touch icons -->
  <link rel="shortcut icon" href="img/favicon.png">
  
	<script type="text/javascript" src="js/jquery-1.11.js"></script>
	<script type="text/javascript" src="packages/bootstrap/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="packages/jquery-ui-1.10.4/ui/jquery-ui.js"></script>
  <!--  <script type="text/javascript" src="socket.io/lib/socket.io.js"></script> -->
        <script type="text/javascript" src="js/socket.io.js"></script>
	
	<script type="text/javascript">
		$(function() {
		
			var signUpForm = $( "#signUpForm" ).dialog({
				autoOpen: false,
				width: 500,
				modal: true,
				 buttons: {
					"Sign Up": function() {
						$.ajax({
							type: "POST",
							url: "register/registeruser",
							data: $( "#registrationForm" ).serialize(),
							statusCode: {
								404: function() {
									alert( "page not found" );
								},
								500: function() {
									alert( "Internal Server Error" );
								},
								400:function(data){
									//console.log(data);
									//console.log(data.responseText);
									//interate through data and append it to the list
									
									//parse the data
									var json = $.parseJSON(data.responseText);
									$(json).each(function(i,val){
										$.each(val,function(k,v){
											  console.log("Key is :"+k+" , "+"Value is :"+ v);     
											$("#registrationError").append("<li>"+v+"</li>");
									});
									});							
								}
							}
						}).done(function( data ) {
							//alert( "Data Saved: " + data );
							
							signUpForm.dialog( "close" );
							
							$('#infoMessage').show();
								$('#infoMessage').text('You are successfully Registered !!!');
								setTimeout(function(){
									$('#infoMessage').hide();
								}
								,2000);
						});
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				}			
			});
			
			var loginFormDialog = $( "#loginForm" ).dialog({
				autoOpen: false,
				width: 500,
				modal: true,
				 buttons: {
					"Login": function() {
					  $.ajax({
							type: "POST",
							url: "register/signin",
							data: $( "#loginPostForm" ).serialize(),
							statusCode: {
								404: function() {
									alert( "page not found" );
								},
								500: function() {
									alert( "Internal Server Error" );
								},
								400:function(data){
									//console.log(data);
									//console.log(data.responseText);
									//interate through data and append it to the list
									
									$("#loginError").append("<li>" + data.responseText + "</li>");					
								}
							}
						}).done(function( data ) {
							
							loginFormDialog.dialog( "close" );
							location.reload();
						});
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				}			
			});
			
			var messageBroadcastDialog  = $( "#msgBroadcast" ).dialog({
				autoOpen: false,
				width: 500,
				modal: true,
				 buttons: {
					"Broadcast Message": function() {
					
						//Check if message is not null & does not have more than 200 characters
						if($.trim($('#message').val()).length <= 0){
							alert('Please enter message');
						
						}else{
						
							 $.ajax({
								type: "POST",
								url: "message/broadcast",
								data: $( "#messageForm" ).serialize(),
								statusCode: {
									403: function() {
											//alert( "Access denied!! Please sign up" );
											$('#broadcastError').append("<li>" + "Please sign in to broadcast message" + "</li>");
									},
									500: function() {
										alert( "Internal Server Error" );
									},
									400:function(data){
										//console.log(data);
										//console.log(data.responseText);
										//interate through data and append it to the list
										
										$("#loginError").append("<li>" + data.responseText + "</li>");					
									}
								}
							}).done(function( data ) {
								//alert('Message save successuflly')
								messageBroadcastDialog.dialog( "close" );
								//location.reload();
							});
						}
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
					
					
				}			
			});
			
		});
		
		function showRegForm(){
			$( "#signUpForm" ).dialog( "open" );
		}
		
		function showLoginForm(){
			$( "#loginForm" ).dialog( "open" );
		}
		
		function showMsgBroadcast(){
			$( "#msgBroadcast" ).dialog( "open" );
                        //clear the input data 
                        $('#message').val('');
		}        
		
		function saveMessage(id){
		
			//alert('save messsage called for message id ' + id);
			
				 $.ajax({
								type: "POST",
								url: "message/savemessage",
								data: {messageid : id},
								statusCode: {
									403: function() {
											//alert( "Access denied!! Please sign up" );
											$('#broadcastError').append("<li>" + "Please sign in to broadcast message" + "</li>");
									},
									500: function() {
										alert( "Internal Server Error" );
									},
									400:function(data){
										//console.log(data);
										//console.log(data.responseText);
										//interate through data and append it to the list
										
										//$("#loginError").append("<li>" + data.responseText + "</li>");					
									}
								}
							}).done(function( data ) {
								//alert('Message Saved successfully');
								$('#infoMessage').show();
								$('#infoMessage').text('Message Saved Successfully');
								setTimeout(function(){
									$('#infoMessage').hide();
								}
								,2000);
							});
			
			
		}
		
		function showComment(id){
			var commentdivid="#addcomment-"+id;
			$(commentdivid).show();
		}
		
		function toggleComment(id){
			var commentdivid = "#commentdiv-"+id;
			var showhidetext = "#showcommentbtn-"+id;
			
			$(commentdivid).toggle();
			
			if($(showhidetext).text() == "Show Comments")
			{
				$(showhidetext).text("Hide Comments"); 
			}else{
				$(showhidetext).text("Show Comments"); 
			}
			
	
			
			
		}
		
		
		function closeComment(id){
			var addCommentDiv = "#addcomment-"+id;
			$(addCommentDiv).hide();
		}
		
		function addComment(id){
		//alert("id"+id);
		
			var commentinputid = "#addcommentinput-"+id;
			var commentdivid="#addcomment-"+id;
			
			var commendwrapperid = "#commentdiv-"+id;
			var commentText = $(commentinputid).val();
			
			
			$.ajax({
								type: "POST",
								url: "comment/savecomment",
								data: {messageid : id,
								comment:commentText},
								statusCode: {
									403: function() {
											//alert( "Access denied!! Please sign up" );
											$('#broadcastError').append("<li>" + "Please sign in to broadcast message" + "</li>");
									},
									500: function() {
										alert( "Internal Server Error" );
									},
									400:function(data){
										//console.log(data);
										//console.log(data.responseText);
										//interate through data and append it to the list
										
										//$("#loginError").append("<li>" + data.responseText + "</li>");					
									}
								}
							}).done(function( data ) {
			//					alert('Comment Saved successfully');
								$(commentdivid).hide();
								//$(commendwrapperid).append('<div>Newly Added comment will be visible here...</div>')
								$(commendwrapperid).append('<div class="row clearfix" >	<div class="col-md-3 column"></div>	<div class="col-md-9 column message-wrapper">\
<div class="row clearfix" > 	<div class="col-md-2 column "> 	<img class="img-thumbnail img-comment" alt="140x140" src="image/defaultprofile.jpg" > \
</div> 			<div class="col-md-10 column"> 					<div class="row clearfix"> 					<div class="col-md-12 column"> \
		<div class="row clearfix"> 			<div class="col-md-9 column message-header"> 		<a href="#" class="comment-username"> '+data.user.username +'</a> \
			<span >'+data.created_at+'</span> 		</div> 				<div class="col-md-3 column">  	</div> 	</div>			</div>		</div>\
	<div class="row clearfix">					<div class="col-md-12 column message-text">					<span>		'+commentText+'			</span>\
	</div> 						</div>					</div>						</div> 		</div> </div>');
		
							});
		}
                
        function approveMessage(id){
					 $.ajax({
						type: "POST",
						url: "message/approvemessage",
						data: {messageid : id},
						statusCode: {
							403: function() {
									//alert( "Access denied!! Please sign up" );
									$('#broadcastError').append("<li>" + "Please sign in to broadcast message" + "</li>");
							},
							500: function() {
								alert( "Internal Server Error" );
							},
							400:function(data){
								//console.log(data);
								//console.log(data.responseText);
								//interate through data and append it to the list
								
								//$("#loginError").append("<li>" + data.responseText + "</li>");					
							}
						}
					}).done(function( data ) {
						//alert('Message Saved successfully');
						
						var messageapproveid = "#messageapprove-"+id;
						$(messageapproveid).text(data);
					});

			
		}
		function rejectMessage(id){
					$.ajax({
						type: "POST",
						url: "message/rejectmessage",
						data: {messageid : id},
						statusCode: {
							403: function() {
									//alert( "Access denied!! Please sign up" );
									$('#broadcastError').append("<li>" + "Please sign in to broadcast message" + "</li>");
							},
							500: function() {
								alert( "Internal Server Error" );
							},
							400:function(data){
								//console.log(data);
								//console.log(data.responseText);
								//interate through data and append it to the list
								
								//$("#loginError").append("<li>" + data.responseText + "</li>");					
							}
						}
					}).done(function( data ) {
						//alert('Message Saved successfully');
						var messagerejectid = "#messagereject-"+id;
						$(messagerejectid).text(data);
					});
		}
                
                
                
	</script>
	
</head>

<body>
<div class="container">
	<div class="row clearfix">
		<div class="col-md-12 column">
			<nav class="navbar navbar-default navbar-static-top" role="navigation">
				<div class="navbar-header">
					 <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
					 <span class="sr-only">Toggle navigation</span>
					 <span class="icon-bar"></span>
					 <span class="icon-bar">
					 </span><span class="icon-bar"></span></button> <a class="navbar-brand" style="font-size:x-large" href="#"><strong>The Resistence</strong></a>
				</div>

				<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
					<ul class="nav navbar-nav navbar-right">
       
                             
                      @if(Session::has('loggedinUser.email'))   
                      
                      <li>
					  
                          <a style="margin-right:5px;"> {{{Session::get('loggedinUser.username') }}}</a>
                          
                        </li>

                      @else
                                                                                     <li>
                                <a href="#" onclick="showRegForm();">Sign Up for the resistence</a>
                        </li>
                        <li >
                                 <a id="aLogin" href="#"  onclick="showLoginForm();" style="margin-right:15px;">Login</a>
                        </li>
                      @endif
                                                
                             
                      

					</ul>
				</div>
			</nav>
			
		</div>
			<div class="row clearfix">
			<div class="col-md-12 column">
				<div id="infoMessage" class="btn-warning"></div>
			</div>
			</div>
		
	</div>
	<div class="row clearfix">
		<div class="col-md-2 column">
			<ul class="nav nav-pills nav-stacked side-menu">
			<ul class="nav nav-pills nav-stacked side-menu">
				
				@if(Session::has('loggedinUser.email'))
				
				<li class="side-menu-item">
						<a href="#" onclick="showMsgBroadcast();">Broadcast Message</a>
				</li>
				<li class="side-menu-item">
					
						<a href="saved" >Saved Message</a>
					
				</li>
				
				<li class="side-menu-item">
						<a href="register/logout"  >Logout</a>
				</li>
				@endif
			</ul>	
		</div>
		<div class="col-md-10 column" id="messsageWrapperDiv">
			@if (isset($broadcastMessages))
			@foreach ($broadcastMessages as $broadcastMessage)
			<div class="row clearfix">
				<div class="col-md-2 column" >
                                    
                                        @if ($broadcastMessage->user->isleader == 0 )
                                            <img class="img-thumbnail img-message message-header message-wrapper"
					alt="140x140" src="image/defaultprofile.jpg" >
                                        @else
						<img class="img-thumbnail img-message message-wrapper-leader"
					alt="140x140" src="image/defaultprofile.jpg" >
                                        @endif
                                    
					
					
				</div>
				@if ($broadcastMessage->user->isleader == 0 )
				<div class="col-md-10 column message-wrapper" >
				@else
				<div class="col-md-10 column message-wrapper-leader" >
				@endif
					<div class="row clearfix">
						<div class="col-md-12 column message-header">
							<div class="row clearfix">
								<div class="col-md-8 column">
									 <a href="#" >
										{{{ $broadcastMessage->user->username}}} </a>
										<span >{{{ $broadcastMessage->user->userrole}}}</span>
										
								</div>
								<div class="col-md-4 column">
									 <span >{{{$broadcastMessage->created_at}}}</span>
								</div>
							</div>
						</div>
					</div>
					<div class="row clearfix">
						<div class="col-md-12 column message-text" >
							<span>
								{{{$broadcastMessage->message}}}
							</span>
						</div>
					</div>
					<div class="row clearfix">
						<div class="col-md-12 column">
							<div class="row clearfix">
								<div class="col-md-5 column">
									 
                                                         @if ($broadcastMessage->user->isleader == 0 )
														 @if(Session::has('loggedinUser.email'))
																		 <span id="messageapprove-{{{$broadcastMessage->id}}}"> {{{$broadcastMessage->like or '0'}}} </span>
																		<a href="#">
                                                                        <img class="img-thumbnail img-approval"alt="approve" src="image/approve.png" onclick="approveMessage({{{$broadcastMessage->id}}})" >
                                                                       </a>
                                                                       <span id="messagereject-{{{$broadcastMessage->id}}}"> {{{$broadcastMessage->unlike or '0'}}} </span>
																	   <a href="#">
																		<img class="img-thumbnail img-approval"alt="approve" src="image/reject.png"  onclick="rejectMessage({{{$broadcastMessage->id}}})">
																		</a>
														@endif			
														@endif
                                                                         
                                                                         <a id="showcommentbtn-{{{$broadcastMessage->id}}}" href="#" class="btn" type="button" onclick="toggleComment({{{$broadcastMessage->id}}});">Show Comments</a>
								</div>
								<div class="col-md-1 column">
									
								</div>
								<div class="col-md-2 column">
									 
								</div>
								<div class="col-md-4 column">
                                                                    
                                                                @if(Session::has('loggedinUser.email'))
								<a href="#" class="btn" type="button" onclick="showComment( {{{$broadcastMessage->id}}} ); " >Add Comment</a>
                                                                
                                                                
                                                                @if (isset($hideSaveMessage))
                                                                
                                                                @else                                                                
									 <a href="#" class="btn" type="button" onclick="saveMessage({{{$broadcastMessage->id}}}); ">Save Message</a>
                                                                @endif
                                                                @endif
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div id="commentdiv-{{{$broadcastMessage->id}}}" style="display:none;">
			
			@foreach ($broadcastMessage->comments as $comment)
			<div class="row clearfix" >
				<div class="col-md-3 column">
				</div>
				<div class="col-md-9 column message-wrapper">
				
				<div class="row clearfix" >
					<div class="col-md-2 column ">
						<img class="img-thumbnail img-comment" alt="140x140" src="image/defaultprofile.jpg" >
					</div>
					<div class="col-md-10 column">
						<div class="row clearfix">
							<div class="col-md-12 column">
								<div class="row clearfix">
									<div class="col-md-9 column message-header">
									<a href="#" class="comment-username">
											{{{ $comment->user->username}}} </a>
									<span >{{{$comment->created_at}}}</span>
									</div>
									<div class="col-md-3 column">
									
									</div>
								</div>
							</div>
						</div>
						<div class="row clearfix">
							<div class="col-md-12 column message-text">
								<span>
									{{{$comment->commentText}}}
								</span>
							</div>
						</div>
					</div>
					
				</div>
				</div>
				
			</div>
			
			
			@endforeach
			</div>
			<div class="row clearfix" id="addcomment-{{{$broadcastMessage->id}}}" style="display:none;padding-bootom:10px;padding-top:5px;">
				<div class="col-md-3 column">
				</div>
				<div class="col-md-9 column ">
				
				<div class="row clearfix">
				
					<div class="input-group addcommentdiv" >
						  <input type="text" class="form-control" placeholder="Add Comment" name="comment" id = "addcommentinput-{{{$broadcastMessage->id}}}">
						  <span class="input-group-btn">
								<button class="btn btn-default" type="button" onclick="addComment({{{$broadcastMessage->id}}})">Add Comment</button>
						  </span>
						  <span class="input-group-btn">
								<button class="btn btn-default" type="button" onclick="closeComment({{{$broadcastMessage->id}}})">X</button>
						  </span>
					</div>
				
				
					<div>
						
							<!--<input  style="width:80%;" placeholder="Add Comment" name="comment" type="text" id = "addcommentinput-{{{$broadcastMessage->id}}}"> -->
							<!-- <input type="button" value="Add Comment" onclick="addComment({{{$broadcastMessage->id}}})"></input> -->
						
					</div>
				</div>
				</div>		
			</div>
			
			@endforeach
			@endif
		</div>
	</div>
</div>

<div id="signUpForm" class="container" title="Sign Up Form">
	<ul id="registrationError" class="btn-danger">
		
	</ul>
	<form action="/" id="registrationForm">
		 <input class="form-control" placeholder="User Name" name="username" type="text">
		 <input class="form-control" placeholder="Role Name" name="rolename" type="text">
		 <input class="form-control" placeholder="Email Address" name="email" type="text"> 
		 <input class="form-control" placeholder="Password" name="password" type="password" value="">
		 <input class="form-control" placeholder="Confirm Password" name="password_confirmation" type="password" value=""> 
	</form>
</div>


<div id="loginForm" class="container" title="Login Form">
	<ul id="loginError" class="btn-danger">
	</ul>
	<form action="/" id="loginPostForm">
		<input class="form-control" placeholder="Email Address" name="email" type="text">   
		<input class="form-control" placeholder="Password" name="password" type="password" value=""> 
		<!-- <input class="btn btn-large btn-primary btn-block" type="submit" value="Login"> -->
	</form>
</div>

<div id="msgBroadcast" class="container" title="Broadcast Message">
	<ul id="broadcastError" class="btn-danger">
	
	</ul>
	
	<form action="/" id="messageForm">
		<textarea class="form-control" id="message" name="message" id="message" rows="5" cols="100" maxlength="200"></textarea>       
	</form>
</div>

	<script type="text/javascript">// <![CDATA[
            
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


    console.log('Div is created');
    console.log(divMessage);
    $('#messsageWrapperDiv').prepend(divMessage);        
    //console.log('Div is appended to the parent Div !!!!');
      });
});

        
// ]]></script>
</body>
</html>
