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
        <script type="text/javascript" src="js/realtimeupdater.js"></script>
        <script type="text/javascript" src="js/resistence.js"></script>
	
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
					 </span><span class="icon-bar"></span></button> <a class="navbar-brand" style="font-size:x-large" href="{{{asset('/')}}}"><strong>The Resistence</strong></a>
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
																		<a >
                                                                        <img class="img-thumbnail img-approval"alt="approve" src="image/approve.png" onclick="approveMessage({{{$broadcastMessage->id}}})" >
                                                                       </a>
                                                                       <span id="messagereject-{{{$broadcastMessage->id}}}"> {{{$broadcastMessage->unlike or '0'}}} </span>
																	   <a >
																		<img class="img-thumbnail img-approval"alt="approve" src="image/reject.png"  onclick="rejectMessage({{{$broadcastMessage->id}}})">
																		</a>
														@endif			
														@endif
                                                                         
                                                                         <a id="showcommentbtn-{{{$broadcastMessage->id}}}"  class="btn" type="button" onclick="toggleComment({{{$broadcastMessage->id}}});">Show Comments</a>
								</div>
								<div class="col-md-1 column">
									
								</div>
								<div class="col-md-2 column">
									 
								</div>
								<div class="col-md-4 column">
                                                                    
                                                                @if(Session::has('loggedinUser.email'))
								<a  class="btn" type="button" onclick="showComment( {{{$broadcastMessage->id}}} ); " >Add Comment</a>
                                                                
                                                                
                                                                @if (isset($hideSaveMessage))
                                                                
                                                                @else                                                                
									 <a  class="btn" type="button" onclick="saveMessage({{{$broadcastMessage->id}}}); ">Save Message</a>
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


</body>
</html>
