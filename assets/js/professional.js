//Slideshow
// Master DOManipulator v2 ------------------------------------------------------------
const items = document.querySelectorAll('.item'),
  controls = document.querySelectorAll('.control'),
  headerItems = document.querySelectorAll('.item-header'),
  descriptionItems = document.querySelectorAll('.item-description'),
  activeDelay = .76,
  interval = 10000;

let current = 0;

const slider = {
  init: () => {
    controls.forEach(control => control.addEventListener('click', (e) => { slider.clickedControl(e) }));
    controls[current].classList.add('active');
    items[current].classList.add('active');
  },
  nextSlide: () => { // Increment current slide and add active class
    slider.reset();
    if (current === items.length - 1) current = -1; // Check if current slide is last in array
    current++;
    controls[current].classList.add('active');
    items[current].classList.add('active');
    slider.transitionDelay(headerItems);
    slider.transitionDelay(descriptionItems);
  },
  clickedControl: (e) => { // Add active class to clicked control and corresponding slide
    slider.reset();
    clearInterval(intervalF);

    const control = e.target,
      dataIndex = Number(control.dataset.index);

    control.classList.add('active');
    items.forEach((item, index) => { 
      if (index === dataIndex) { // Add active class to corresponding slide
        item.classList.add('active');
      }
    })
    current = dataIndex; // Update current slide
    slider.transitionDelay(headerItems);
    slider.transitionDelay(descriptionItems);
    intervalF = setInterval(slider.nextSlide, interval);
  },
  reset: () => { // Remove active classes
    items.forEach(item => item.classList.remove('active'));
    controls.forEach(control => control.classList.remove('active'));
  },
  transitionDelay: (items) => { // Set incrementing css transition-delay for .item-header & .item-description, .vertical-part, b elements
    let seconds;
    
    items.forEach(item => {
      const children = item.childNodes; // .vertical-part(s)
      let count = 1,
        delay;
      
      item.classList.value === 'item-header' ? seconds = .015 : seconds = .007;

      children.forEach(child => { // iterate through .vertical-part(s) and style b element
        if (child.classList) {
          item.parentNode.classList.contains('active') ? delay = count * seconds + activeDelay : delay = count * seconds;
          child.firstElementChild.style.transitionDelay = `${delay}s`; // b element
          count++;
        }
      })
    })
  },
}

let intervalF = setInterval(slider.nextSlide, interval);
slider.init();

<<<<<<< Updated upstream
// animations for elements easing in:
function callbackFunc(entries, observer)
{
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target == document.getElementById('trig1')) {
        if (document.getElementById('ani1').classList.contains("in-progress") == false) {
            document.getElementById('ani1').style.display = "block";
            document.getElementById('ani1').classList.add("in-progress");
        }
    } else if (entry.isIntersecting && entry.target == document.getElementById('trig2')) {
        if (document.getElementById('thirdBlock').classList.contains("in-progress") == false) {
            document.getElementById('thirdBlock').classList.add("in-progress");
            }
    } else if (entry.isIntersecting && entry.target == document.getElementById('trig3')) {
        if (document.getElementById('fourthBlock').classList.contains("in-progress") == false) {
            document.getElementById('fourthBlock').classList.add("in-progress");
            }
    } else if (entry.isIntersecting && entry.target == document.getElementById('trig4')) {
        if (document.getElementById('fifthBlock').classList.contains("in-progress") == false) {
            document.getElementById('fifthBlock').classList.add("in-progress");
            }
        }
    });
}

let options = {
    root: document.getElementById("overlay"),
    rootMargin: '0px',
    threshold: 0.3
};

let observer = new IntersectionObserver(callbackFunc, options);

observer.observe(document.getElementById('trig1'));
observer.observe(document.getElementById('trig2'));
observer.observe(document.getElementById('trig3'));
observer.observe(document.getElementById('trig4'));
=======

// EMAIL FORM:
const form = document.querySelector('form')
form.addEventListener('submit', event => {
  // prevent the form submit from refreshing the page
  event.preventDefault()
 
  const { name, email, message } = event.target
  console.log('Name: ', name.value)
  console.log('email: ', email.value)
  console.log('Message: ', message.value)
  
})
>>>>>>> Stashed changes
