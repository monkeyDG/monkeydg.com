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

function trig1() {
  if (document.getElementById('about').classList.contains("in-progress") == false) {
    document.getElementById('about').classList.add("in-progress");
  }
}

function trig2() {
  if (document.getElementById('skills').classList.contains("in-progress") == false) {
    document.getElementById('skills').classList.add("in-progress");
  }
}

function trig3() {
  if (document.getElementById('text1').classList.contains("animate-progress-text") == false) {
    document.getElementById('text1').classList.add("animate-progress-text");
  }
  if (document.getElementById('text2').classList.contains("animate-progress-text") == false) {
    document.getElementById('text2').classList.add("animate-progress-text");
  }
  if (document.getElementById('text3').classList.contains("animate-progress-text") == false) {
    document.getElementById('text3').classList.add("animate-progress-text");
  }
  if (document.getElementById('text4').classList.contains("animate-progress-text") == false) {
    document.getElementById('text4').classList.add("animate-progress-text");
  }
  if (document.getElementById('text5').classList.contains("animate-progress-text") == false) {
    document.getElementById('text5').classList.add("animate-progress-text");
  }
  if (document.getElementById('text6').classList.contains("animate-progress-text") == false) {
    document.getElementById('text6').classList.add("animate-progress-text");
  }

  if (document.getElementById('span1').classList.contains("animate-progress-span") == false) {
    document.getElementById('span1').classList.add("animate-progress-span");
  }
  if (document.getElementById('span2').classList.contains("animate-progress-span") == false) {
    document.getElementById('span2').classList.add("animate-progress-span");
  }
  if (document.getElementById('span3').classList.contains("animate-progress-span") == false) {
    document.getElementById('span3').classList.add("animate-progress-span");
  }
  if (document.getElementById('span4').classList.contains("animate-progress-span") == false) {
    document.getElementById('span4').classList.add("animate-progress-span");
  }
  if (document.getElementById('span5').classList.contains("animate-progress-span") == false) {
    document.getElementById('span5').classList.add("animate-progress-span");
  }
  if (document.getElementById('span6').classList.contains("animate-progress-span") == false) {
    document.getElementById('span6').classList.add("animate-progress-span");
  }

  if (document.getElementById('line1').classList.contains("animate-progress-line") == false) {
    document.getElementById('line1').classList.add("animate-progress-line");
  }
  if (document.getElementById('line2').classList.contains("animate-progress-line") == false) {
    document.getElementById('line2').classList.add("animate-progress-line");
  }
  if (document.getElementById('line3').classList.contains("animate-progress-line") == false) {
    document.getElementById('line3').classList.add("animate-progress-line");
  }
  if (document.getElementById('line4').classList.contains("animate-progress-line") == false) {
    document.getElementById('line4').classList.add("animate-progress-line");
  }
  if (document.getElementById('line5').classList.contains("animate-progress-line") == false) {
    document.getElementById('line5').classList.add("animate-progress-line");
  }
  if (document.getElementById('line6').classList.contains("animate-progress-line") == false) {
    document.getElementById('line6').classList.add("animate-progress-line");
  }
}

function trig4() {
  if (document.getElementById('experience').classList.contains("in-progress") == false) {
    document.getElementById('experience').classList.add("in-progress");
  }
}

function trig5() {
  if (document.getElementById('timeline1').classList.contains("in-progress") == false) {
    document.getElementById('timeline1').classList.add("in-progress");
  }
  if (document.getElementById('dot1').classList.contains("opacity-1") == false) {
    document.getElementById('dot1').classList.add("opacity-1");
  }
}

function trig6() {
  if (document.getElementById('timeline2').classList.contains("in-progress") == false) {
    document.getElementById('timeline2').classList.add("in-progress");
  }
  if (document.getElementById('dot2').classList.contains("opacity-1") == false) {
    document.getElementById('dot2').classList.add("opacity-1");
  }
}

function trig7() {
  if (document.getElementById('timeline3').classList.contains("in-progress") == false) {
    document.getElementById('timeline3').classList.add("in-progress");
  }
  if (document.getElementById('dot3').classList.contains("opacity-1") == false) {
    document.getElementById('dot3').classList.add("opacity-1");
  }
}

function trig8() {
  if (document.getElementById('timeline4').classList.contains("in-progress") == false) {
    document.getElementById('timeline4').classList.add("in-progress");
  }
  if (document.getElementById('dot4').classList.contains("opacity-1") == false) {
    document.getElementById('dot4').classList.add("opacity-1");
  }
}

function trig9() {
  if (document.getElementById('timeline5').classList.contains("in-progress") == false) {
    document.getElementById('timeline5').classList.add("in-progress");
  }
  if (document.getElementById('dot5').classList.contains("opacity-1") == false) {
    document.getElementById('dot5').classList.add("opacity-1");
  }
}

function trig10() {
  if (document.getElementById('timeline6').classList.contains("in-progress") == false) {
    document.getElementById('timeline6').classList.add("in-progress");
  }
  if (document.getElementById('dot6').classList.contains("opacity-1") == false) {
    document.getElementById('dot6').classList.add("opacity-1");
  }
}

function trig11() {
  if (document.getElementById('container-full-tech').classList.contains("in-progress") == false) {
    document.getElementById('container-full-tech').classList.add("in-progress");
  }
}

function trig12() {
  if (document.getElementById('education').classList.contains("in-progress") == false) {
    document.getElementById('education').classList.add("in-progress");
  }
}

function trig13() {
  if (document.getElementById('edu-timeline1').classList.contains("in-progress") == false) {
    document.getElementById('edu-timeline1').classList.add("in-progress");
  }
  if (document.getElementById('edu-dot1').classList.contains("opacity-1") == false) {
    document.getElementById('edu-dot1').classList.add("opacity-1");
  }
}

function trig14() {
  if (document.getElementById('edu-timeline2').classList.contains("in-progress") == false) {
    document.getElementById('edu-timeline2').classList.add("in-progress");
  }
  if (document.getElementById('edu-dot2').classList.contains("opacity-1") == false) {
    document.getElementById('edu-dot2').classList.add("opacity-1");
  }
}

function trig15() {
  if (document.getElementById('awards').classList.contains("in-progress") == false) {
    document.getElementById('awards').classList.add("in-progress");
  }
}

function trig16() {
  if (document.getElementById('volunteering-full').classList.contains("in-progress") == false) {
    document.getElementById('volunteering-full').classList.add("in-progress");
  }
}

// animations for elements easing in:
function callbackFunc(entries, observer)
{
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target == document.getElementById('trig1')) {
      trig1();
    } 
    if (entry.isIntersecting && entry.target == document.getElementById('trig2')) {
      trig1();
      trig2();
    } 
    if (entry.isIntersecting && entry.target == document.getElementById('trig3')) {
      trig1();
      trig2();
      trig3();
    } 
    if (entry.isIntersecting && entry.target == document.getElementById('trig4')) {
      trig1();
      trig2();
      trig3();
      trig4();
    } 
    if (entry.isIntersecting && entry.target == document.getElementById('trig5')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig6')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
    } 
    if (entry.isIntersecting && entry.target == document.getElementById('trig7')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig8')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig9')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
      trig9();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig10')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
      trig9();
      trig10();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig11')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
      trig9();
      trig10();
      trig11();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig12')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
      trig9();
      trig10();
      trig11();
      trig12();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig13')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
      trig9();
      trig10();
      trig11();
      trig12();
      trig13();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig14')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
      trig9();
      trig10();
      trig11();
      trig12();
      trig13();
      trig14();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig15')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
      trig9();
      trig10();
      trig11();
      trig12();
      trig13();
      trig14();
      trig15();
    }
    if (entry.isIntersecting && entry.target == document.getElementById('trig16')) {
      trig1();
      trig2();
      trig3();
      trig4();
      trig5();
      trig6();
      trig7();
      trig8();
      trig9();
      trig10();
      trig11();
      trig12();
      trig13();
      trig14();
      trig15();
      trig16();
    }
  });
}

let options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3
};

let observer = new IntersectionObserver(callbackFunc, options);

observer.observe(document.getElementById('trig1'));
observer.observe(document.getElementById('trig2'));
observer.observe(document.getElementById('trig3'));
observer.observe(document.getElementById('trig4'));
observer.observe(document.getElementById('trig5'));
observer.observe(document.getElementById('trig6'));
observer.observe(document.getElementById('trig7'));
observer.observe(document.getElementById('trig8'));
observer.observe(document.getElementById('trig9'));
observer.observe(document.getElementById('trig10'));
observer.observe(document.getElementById('trig11'));
observer.observe(document.getElementById('trig12'));
observer.observe(document.getElementById('trig13'));
observer.observe(document.getElementById('trig14'));
observer.observe(document.getElementById('trig15'));
observer.observe(document.getElementById('trig16'));