const PARTICLES_PER_RECORDING = 4;
const TINY_STAR_RADIUS = 60;
const LARGE_STAR_RADIUS = 240;

let t = 0;

let particles = [];

let o_grad
let y_grad
let p_grad
let b_grad

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//loads in pre-designed images for the out most rings
function preload(){
  o_grad = loadImage('o_grad.png');
  y_grad = loadImage('y_grad.png');
  p_grad = loadImage('p_grad.png');
  b_grad = loadImage('b_grad.png');
  
}

// this class describes the properties of a single particle.
class Particle {
// setting the co-ordinates, radius and the
// speed of a particle in both the co-ordinates axes.
  constructor(x, y, xSpeed, ySpeed, audio, tOffset){
    this.x = x;
    this.y = y;
    this.r = random(10,20);
    this.rr = random(60,90); //new value for radius
    this.freq = random(0.1,0.6);
    this.xSpeed = xSpeed; //random(-0.2,0.2);
    this.ySpeed = ySpeed; //random(-0.1,0.15);
    this.audio = audio;
    this.isPlaying = 0;
    this.tOffset = tOffset;
    this.sound = null;

    //picks random number to assign some colour to the inner and outter circles
    let flipCoin = random([1, 2, 3, 4]);
    if(flipCoin==1){
      this.imageFile = o_grad;
    }
    if(flipCoin==2){
      this.imageFile = y_grad;
    }
    if(flipCoin==3){
      this.imageFile = b_grad;
    }
    if(flipCoin==4){
      this.imageFile = p_grad;
    }
    let flipCoin2 = random([1, 2, 3, 4]);
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
  }

// draw of a particle.
  drawParticle(t) {
    noStroke();
    let r;

    //non-clicked stars
    if (this.isPlaying == 0) {



                    //shrinks the outter ring
                    if(this.rr > (30 + TINY_STAR_RADIUS)) {
                        this.rr -= 4.5
                      }
      //r = TINY_STAR_RADIUS + this.r * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2);
      //fill('rgba(200,200,200,0.6)');
      else{
        this.rr = 30 * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2)+TINY_STAR_RADIUS;
      }


    } 

    //Clicked stars
    else {

        //increases radius until it reaches large star radius
        if(this.rr < 4 * TINY_STAR_RADIUS ) {
            this.rr += 4
        } else {
            this.rr = 4 * TINY_STAR_RADIUS + 6 * this.r * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2);
        }
      //
      //fill('rgba(200,200,200,0.9)');
    }
    push();
    fill(this.dotColor);
    tint(255, 127);
    circle(this.x,this.y, this.r-20);
    pop();
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
                particles.push(new Particle(
                    random(0, windowWidth),
                    random(0, windowHeight),
                    random(-0.2,0.2),
                    random(-0.1,0.15),
                    fetchedRecords[i],
                    10));
                }
            }
            
    });

    print(windowWidth, windowHeight)
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
