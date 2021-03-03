<?php /* Template Name: Blank Page Template */ ?> 

<html class="no-js" lang="en">

<head>

	<meta charset="utf-8">

	<title>David Gallo / Monkeydg</title>

	<meta name="HandheldFriendly" content="True">
	<meta name="MobileOptimized" content="320">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<!-- For all browsers -->
	<link rel="stylesheet" type="text/css" href="https://www.dgallo.ca/wp-content/themes/oceanwp/assets/css/homepage.css">

	<!-- JavaScript -->
	<script src="https://www.adhamdannaway.com/wp-content/themes/dannaway/js/modernizr-2.5.3-min.js"></script>
	
	<link rel="shortcut icon" href="/favicon.ico">

	<meta http-equiv="cleartype" content="on">

	<link rel="pingback" href="https://www.dgallo.ca/xmlrpc.php" />

	<script type="text/javascript">

      // Eliminate FOUC
      document.documentElement.className = 'js';

    </script>


<link rel='dns-prefetch' href='//ajax.googleapis.com' />
<link rel='dns-prefetch' href='//s.w.org' />
<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.min.js?ver=5.6.2' id='jquery-js'></script>
<link rel="wlwmanifest" type="application/wlwmanifest+xml" href="https://www.dgallo.ca/wp-includes/wlwmanifest.xml" /> 
<meta name="generator" content="WordPress 5.6.2" />
<link rel='shortlink' href='https://www.dgallo.ca/' />

</head>

<body id="body" class="clearfix">

	<header id="header">

		<div class="row">
			
			<div class="col-12">

				<a id="logo" class="logo" href="https://www.dgallo.ca/">David Gallo</a>
				<div class="icon-nav">navigation</div>
				
				<nav>
					<ul id="nav"  >
						<li class="page_item page-item-2"><a href="https://www.dgallo.ca/about">about</a></li>
						<li class="page_item page-item-5"><a href="https://www.dgallo.ca/professional">professional</a></li>
						<li class="page_item page-item-7"><a href="https://www.dgallo.ca/creative">creative</a></li>
						<li class="page_item page-item-11"><a href="https://www.dgallo.ca/contact">contact</a></li>
 
						<li>
							<ul class="social">
								<li class="github"><a href="https://www.github.com/monkeydg" title="Check out my Github" target="_blank">github</a></li>
								<li class="linkedin"><a href="https://linkedin.com/in/davidgallo747" title="Connect with me on Linkedin" target="_blank">linkedin</a></li>
							</ul>
						</li>

					</ul>

				</nav>

			</div>

		</div>

	</header>  

	<div id="content" class="content clearfix home">

		<section id="section" class="light nopad-t nopad-b">

			<div class="row">
		
				<div class="col-12">
					
					<div id="face" class="face">

						<a href="/professional">
							<div id="designer" class="designer">
								<div id="designer-desc" class="description">
									<h1>professional portfolio</h1>
									<p><mark>Technology consultant driving real business value with data & AI</mark></p>
								</div>
							</div>
						</a>

						<a href="/creative">
							<div id="coder" class="coder">
								<div id="coder-desc" class="description">
									<h1>creative portfolio</h1>
									<p><mark>Musician, maker, and part-time coder that loves to tinker</mark></p>
								</div>
							</div>
						</a>

						<img id="face-img" class="face-img" src="https://www.adhamdannaway.com/wp-content/themes/dannaway/images/adham-dannaway-designer-coder.jpg" alt="David Gallo professional creative">

						<div id="designer-img" class="designer-img"></div>
						<div id="coder-img" class="coder-img"></div>
						<div id="designer-bg" class="designer-bg"></div>
						<div id="coder-bg" class="coder-bg"></div>

					</div>

				</div>

			</div>

		</section>
    
 </div>

<script type='text/javascript' src='https://www.adhamdannaway.com/wp-includes/js/wp-embed.min.js?ver=5.6.2' id='wp-embed-js'></script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script> 
<script>window.jQuery || document.write('<script src="js/jquery-1.7.2.min.js"><\/script>')</script> 
<script src="https://www.dgallo.ca/wp-content/themes/oceanwp/assets/js/script.js"></script>
<script type="text/javascript">
<!--

//If browser is IE8 or older we show IE specific page
if(ie < 9){
	ieMessage();
}

/*
* Call functions when dom is ready
*/
$(document).ready(function() {

	// Hide browser top bar in mobiles
	$('body').scrollTop(1);

	// Toggle Navigation for mobile devices
	$('.icon-nav').on('click', function(){
		$('header nav').slideToggle();
		$(this).toggleClass('active');
	});

	// Function to scroll to top
	$('a[href=#top]').click(function(){

        $('html, body').animate({scrollTop:0}, 1000, 'easeInOutQuad');
        return false;
    });

	// Function to fade in image sprites
  	$('.sprite').fadeSprite();

	// Function to animate when leaving page
	$('.transition, #nav .page_item a, #logo, #face a').leavePage();	

	// Animate the header on first			
	$('#header').stop().animate({'opacity': '1', 'top':'0'}, 1000);

	// Preload the page with jPreLoader
	$('body').jpreLoader({

		showSplash: true

	}, function() {	

		//Show the page once images are loaded	
				
			$('#face').animateHome();
			$('#face').resizeFace();

			
	});

});
-->
</script>

</body>
</html>