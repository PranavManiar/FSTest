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
						});
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				}			
			});
			
			$messageBroadcastDialog  = $( "#msgBroadcast" ).dialog({
				autoOpen: false,
				width: 500,
				modal: true,
				 buttons: {
					"Broadcast Message": function() {
						 $.ajax({
							type: "POST",
							url: "message/broadcast",
							data: $( "#messageForm" ).serialize(),
							statusCode: {
								403: function() {
									alert( "Access denied!! Please sign up" );
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
							alert('Successfully submitted the message');
							messageBroadcastDialog.dialog( "close" );
						});
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
		}
	
                function logOutUser(){
                     $.ajax({
                                        type: "GET",
                                        url: "register/logout"
                                        
                                }).done(function() {
                             //       alert("User is now logged out");
                                        //loginFormDialog.dialog( "close" );
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
					 </span><span class="icon-bar"></span></button> <a class="navbar-brand" href="#">The Resistence</a>
				</div>

				<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
					<ul class="nav navbar-nav navbar-right">
       
                             
                      @if(Session::has('loggedinUser.email'))   
                      
                      <li>
                          <span> {{{Session::get('loggedinUser.username') }}}</span>
                          
                        </li>

                      @else
                                                                                     <li>
                                <a href="#" onclick="showRegForm();">Sign Up for the resistence</a>
                        </li>
                        <li >
                                 <a href="#"  onclick="showLoginForm();" style="margin-right:15px;">Login</a>
                        </li>
                      @endif
                                                
                             
                      

					</ul>
				</div>
			</nav>
			
		</div>
	</div>
	<div class="row clearfix">
		<div class="col-md-2 column">
			<ul class="nav nav-pills nav-stacked">
				<li class="active">
						<a href="#" onclick="showMsgBroadcast();">Broadcast Message</a>
				</li>
				<li>
					
						<a href="#" >Saved Message</a>
					
				</li>
				<li>
					
						<a href="#" onclick="logOutUser();" >Logout</a>
					
				</li>
			</ul>	
		</div>
		<div class="col-md-10 column">
			<div class="row clearfix">
				<div class="col-md-2 column">
					<img class="img-thumbnail img-message"" alt="140x140" src="http://lorempixel.com/140/140/"  style="width:100px;height:100px;">
					<a id="modal-99092" href="#modal-container-99092" role="button" class="btn" data-toggle="modal">Launch demo modal</a>
				</div>
				<div class="col-md-10 column">
					<div class="row clearfix">
						<div class="col-md-12 column">
							<div class="row clearfix">
								<div class="col-md-8 column">
									 <a href="#" >
										John Connor </a>
										<span >Resistence Leader</span>
										
								</div>
								<div class="col-md-4 column">
									 <span >02 December 3014 at 12:02 a.m</span>
								</div>
							</div>
						</div>
					</div>
					<div class="row clearfix">
						<div class="col-md-12 column">
							<span>
								Sample text that is created for the testing purpose this text should be just above 200 characters to check that the div with the characters that takes more space how wil it look and what will happen in that case!!!
							</span>
						</div>
					</div>
					<div class="row clearfix">
						<div class="col-md-12 column">
							<div class="row clearfix">
								<div class="col-md-5 column">
									 <a href="#" class="btn" type="button">Like</a> <a href="#" class="btn" type="button">Dislike</a>
									  <a href="#" class="btn" type="button">Hide Comments</a>
								</div>
								<div class="col-md-1 column">
									
								</div>
								<div class="col-md-2 column">
									 
								</div>
								<div class="col-md-4 column">
								<a href="#" class="btn" type="button">Add Comment</a>
									 <a href="#" class="btn" type="button">Save Message</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="row clearfix">
				<div class="col-md-2 column">
				</div>
				<div class="col-md-2 column">
					<img class="img-thumbnail img-comment" alt="140x140" src="http://lorempixel.com/140/140/" >
				</div>
				<div class="col-md-8 column">
					<div class="row clearfix">
						<div class="col-md-12 column">
							<div class="row clearfix">
								<div class="col-md-9 column">
								<a href="#" >
										Will </a>
								<span >02 December 3014 at 12:02 a.m</span>
								</div>
								<div class="col-md-3 column">
								
								</div>
							</div>
						</div>
					</div>
					<div class="row clearfix">
						<div class="col-md-12 column">
							<span>
								Sample text that is created for the testing purpose this text should be just above 200 characters to check that the div with the characters that takes more space how wil it look and what will happen in that case!!!
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div id="signUpForm" class="container" title="Sign Up Form">
	<ul id="registrationError">
		
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
	<ul id="loginError">
	</ul>
	<form action="/" id="loginPostForm">
		<input class="form-control" placeholder="Email Address" name="email" type="text">   
		<input class="form-control" placeholder="Password" name="password" type="password" value=""> 
		<!-- <input class="btn btn-large btn-primary btn-block" type="submit" value="Login"> -->
	</form>
</div>

<div id="msgBroadcast" class="container" title="Broadcast Message">
	<form action="/" id="messageForm">
		<textarea class="form-control"  name="message"  rows="5" cols="100"></textarea>       
	</form>
</div>

</body>
</html>
