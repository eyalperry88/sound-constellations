const PARTICLES_PER_RECORDING = 2;
//const TINY_STAR_RADIUS = 100;
const LARGE_STAR_RADIUS = 240;
let TINY_STAR_RADIUS = 100;

let t = 0;
let tinyR;

let particles = [];

let grad_1
let grad_2
let grad_3
let grad_4
let grad_5
let grad_6

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//visualization uses png files of gradients
//loads in pre-designed images for the out most rings
function preload(){
  grad_1 = loadImage('grad_1.png');
  grad_2 = loadImage('grad_2.png');
  grad_3 = loadImage('grad_3.png');
  grad_4 = loadImage('grad_4.png');
  grad_5 = loadImage('grad_5.png');
  grad_6 = loadImage('grad_6.png');
  
}

// this class describes the properties of a single particle.
class Particle {
// setting the co-ordinates, radius and the
// speed of a particle in both the co-ordinates axes.
  constructor(x, y, xSpeed, ySpeed, audio, tOffset){
    this.x = x;
    this.y = y;
    this.r = random(5,15); //previous value for radius, I think it's not used
    this.rr = random(60,90); //new value for radius
    this.freq = random(0.1,0.6);
    this.xSpeed = xSpeed; //random(-0.2,0.2);
    this.ySpeed = ySpeed; //random(-0.1,0.15);
    this.audio = audio;
    this.isPlaying = 0;
    this.tOffset = tOffset;
    this.sound = null;

    //picks random number to assign image file to the outer circles
    let flipCoin = random([1, 2, 3, 4, 5, 6]);
    if(flipCoin==1){
      this.imageFile = grad_1;
    }
    if(flipCoin==2){
      this.imageFile = grad_2;
    }
    if(flipCoin==3){
      this.imageFile = grad_3;
    }
    if(flipCoin==4){
      this.imageFile = grad_4;
    }
    if(flipCoin==5){
      this.imageFile = grad_5;
    }
    if(flipCoin==6){
      this.imageFile = grad_6;
    }
     //picks random number to assign some colour to the inner
    let flipCoin2 = random([1, 2, 3, 4, 5, 6]);
    if(flipCoin2==1){
      this.dotColor = color('#E6ED80');
    }
    if(flipCoin2==2){
      this.dotColor = color('#FFC9F0');
    }
    if(flipCoin2==3){
      this.dotColor = color('#53DDD8');
    }
    if(flipCoin2==4){
      this.dotColor = color('#FE9142');
    }
    if(flipCoin2==5){
      this.dotColor = color('#A68FFF');
    }
    if(flipCoin2==6){
      this.dotColor = color('#FFC9F0');
    }
  }

// draw a particle.
  drawParticle(t) {

    TINY_STAR_RADIUS = windowWidth/12;

    noStroke();
    let r;

    //non-clicked stars
    if (this.isPlaying == 0) {

        //shrinks the outter ring when it becomes unclicked
        if(this.rr > (30 + TINY_STAR_RADIUS)) {
            this.rr -= 4.5
          }

        //creates oscillation while dormant
        else{
          this.rr = 30 * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2)+TINY_STAR_RADIUS;
        }
    } 

    //Clicked stars
    else {

        //increases radius until it reaches large star radius
        if(this.rr < 3 * TINY_STAR_RADIUS) {
            this.rr += 10.5;
            this.tOffset = t;

        } else {
            this.rr = 3 * TINY_STAR_RADIUS + 3 * this.r * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2);
        }
    }

    //create dot for the centre of the blob
    //set sized relative to window width
    push();
    fill(this.dotColor);
    tint(255, 127);
    tinyR = windowWidth/100 + this.r;
    circle(this.x,this.y, tinyR);
    pop();
    //place image around centre of dot
    tint(255, 127);
    imageMode(CENTER);
    image(this.imageFile, this.x, this.y, this.rr, this.rr);
    
  }

// setting the particle in motion.
  moveParticle() {
    if(this.x < 0 || this.x > windowWidth)
      this.xSpeed*=-1;
    if(this.y < 0 || this.y > windowHeight)
      this.ySpeed*=-1;
    this.x+=this.xSpeed;
    this.y+=this.ySpeed;
  }

// this function creates the connections(lines)
// between particles which are less than a certain distance apart
// Not used currrently
  joinParticles(particles, micLevel) {
    particles.forEach(element =>{
      let dis = dist(this.x,this.y,element.x,element.y);
      if(dis < windowWidth / 60) {
        stroke('rgba(255,255,255,0.08)');
        line(this.x,this.y,element.x,element.y);
      }
    });
  }
}



function setup() {
    fullscreen(true);
    createCanvas(windowWidth - 10, windowHeight - 10);

    // load audio recordings
    fetchRecords(function (fetchedRecords) {
        print("got records");
        for (let i = 0; i < fetchedRecords.length; i++) {
            for (j = 0; j < PARTICLES_PER_RECORDING; j++) {

              //Particle constructor (x, y, xSpeed, ySpeed, audio, tOffset)
                particles.push(new Particle(
                    random(0, windowWidth),
                    random(0, windowHeight),
                    random(-0.5,0.5),
                    random(-0.3,0.35),
                    fetchedRecords[i],
                    10));
                }
            }
            
    });
    print(tinyR)
    print(windowWidth, windowHeight)
    print(windowWidth/10);
}


function draw() {

    background('#000'); // #000 ?
    t = millis() * 0.001;

    for(let i = 0;i<particles.length;i++) {
        particles[i].drawParticle(t);
        particles[i].moveParticle();
        particles[i].joinParticles(particles.slice(i));
    }
}

// When the user clicks the mouse
function touchStarted() {
  // Check if mouse is inside the circle
    let t = millis() * 0.001;

    userStartAudio();
    let d = 0;
    for(let i = 0;i<particles.length;i++) {
        d = dist(mouseX, mouseY, particles[i].x, particles[i].y);
        if (d < particles[i].r + 20) {
        if (particles[i].isPlaying == 1){
            // particles[i].isPlaying = 0;
            // console.log("Pause audio:", particles[i].audio);
            // if (particles[i].sound) {
            //     particles[i].sound.pause();
            // }
        } else {
            particles[i].isPlaying = 1;
            console.log("Play audio:", particles[i].audio);
            if (!particles[i].sound) {
                downloadRecord(particles[i]);
            } else {
                particles[i].sound.play();
            }
        }
        break;
        }
    }
}
//-------------------------------------------------------
