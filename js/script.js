const PARTICLES_PER_RECORDING = 4;
const TINY_STAR_RADIUS = 2;

let t = 0;

let particles = [];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// this class describes the properties of a single particle.
class Particle {
// setting the co-ordinates, radius and the
// speed of a particle in both the co-ordinates axes.
  constructor(x, y, xSpeed, ySpeed, audio, tOffset){
    this.x = x;
    this.y = y;
    this.r = random(5,12);
    this.freq = random(0.1,0.6);
    this.xSpeed = xSpeed; //random(-0.2,0.2);
    this.ySpeed = ySpeed; //random(-0.1,0.15);
    this.audio = audio;
    this.isPlaying = 0;
    this.tOffset = tOffset;
    this.sound = null;
  }

// draw of a particle.
  drawParticle(t) {
    noStroke();
    let r;
    if (this.isPlaying == 0) {
      r = TINY_STAR_RADIUS + this.r * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2);
      fill('rgba(200,200,200,0.6)');
    } else {
      r = 4 * TINY_STAR_RADIUS + 2 * this.r * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2);
      fill('rgba(200,200,200,0.9)');
    }
    circle(this.x,this.y, r);
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
      if(dis < windowWidth / 20) {
        stroke('rgba(255,255,255,0.08)');
        line(this.x,this.y,element.x,element.y);
      }
    });
  }
}



function setup() {
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
function mousePressed() {
  // Check if mouse is inside the circle
    let t = millis() * 0.001;

    userStartAudio();
    let d = 0;
    for(let i = 0;i<particles.length;i++) {
        d = dist(mouseX, mouseY, particles[i].x, particles[i].y);
        if (d < particles[i].r + 5) {
        if (particles[i].isPlaying == 1){
            particles[i].isPlaying = 0;
            console.log("Pause audio:", particles[i].audio);
            if (particles[i].sound) {
                particles[i].sound.pause();
            }
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
