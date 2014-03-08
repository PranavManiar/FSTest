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
			
                        return false;
			
			
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
                
                
        