var nope_buttons = document.querySelectorAll('.nope');
var match_buttons = document.querySelectorAll('.match');

var slides = document.querySelectorAll('.slide');
let currentSlide = 0;

slides[currentSlide].style.display = '';

function nextSlide() {
   // current slide becomes hidden
   slides[currentSlide].style.display = 'none';
   // set the current slide as the next one
   currentSlide = (currentSlide + 1) % slides.length
   // add the class showing to the slide to make it visible
   slides[currentSlide].style.display = '';
 }


function match(userid){

   

   nextSlide();
}