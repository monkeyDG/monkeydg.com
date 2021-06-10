mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
	mybutton.style.display = "block";
  } else {
	mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document -- Professional page
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// When the user clicks on the button, scroll to the top of the document -- Creative page
// Janky because the scroll snapping messes with the animation so we have to add a class that ignores the snapping during the scroll, then adds it back later.
// also, because we are using a custom scroll area in a div, we can't use traditional css scrolling
var box = document.getElementById('scroll-container'); // <-- Scroll area
targetElm = document.getElementById('js-header'); // <-- Scroll to here

document.getElementById('myBtn').addEventListener('click', function(){
  document.getElementById("scroll-container").classList.add('during-scroll');
  scrollToElm(box, targetElm , 1);
  setTimeout(function(){ document.getElementById("scroll-container").classList.remove('during-scroll'); }, 3000); //prevents the class from being removed before scrolling animation is finished
});

function scrollToElm(container, elm, duration){
  var pos = getRelativePos(elm);
  scrollTo( container, pos.top , duration);  // duration in seconds
}

function getRelativePos(elm){
  var pPos = elm.parentNode.getBoundingClientRect(), // parent pos
      cPos = elm.getBoundingClientRect(), // target pos
      pos = {};

  pos.top    = cPos.top    - pPos.top + elm.parentNode.scrollTop,
  pos.right  = cPos.right  - pPos.right,
  pos.bottom = cPos.bottom - pPos.bottom,
  pos.left   = cPos.left   - pPos.left;

  return pos;
}
    
function scrollTo(element, to, duration) {
    var start = element.scrollTop,
        change = to - start,
        startTime = performance.now(),
        val, now, elapsed, t;

    function animateScroll(){
        now = performance.now();
        elapsed = (now - startTime)/1000;
        t = (elapsed/duration);

        element.scrollTop = start + change * easeInOutQuad(t);

        if( t < 1 )
            window.requestAnimationFrame(animateScroll);
    };
    animateScroll();
}

function easeInOutQuad(t){ return t<.5 ? 2*t*t : -1+(4-2*t)*t } // scrolling animation