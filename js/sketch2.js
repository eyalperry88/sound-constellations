let mic, recorder, soundFile, amplitude;

let clouds;
let loading;
let loaded = false;
let state = 0;

let maxParticles = 200;
let buttonRadius = 100;
let tinyStarRadius = 2;
let recordX, recordY, playX, playY, uploadX, uploadY;

let t = 0;
let tStartRecord = 0;
let tStartIntro = 0;
let tFinishRecord = 0;
let tLastStartAdded = 0;
let myDream = "";

let myDreamHash;

let fetchedRecords = [];
let fetchedRecordsIdx = 0;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// this class describes the properties of a single particle.
class Particle {
// setting the co-ordinates, radius and the
// speed of a particle in both the co-ordinates axes.
  constructor(x, y, xSpeed, ySpeed, dream, tOffset){
    this.x = x;
    this.y = y;
    this.r = random(5,12);
    this.freq = random(0.1,0.6);
    this.xSpeed = xSpeed; //random(-0.2,0.2);
    this.ySpeed = ySpeed; //random(-0.1,0.15);
    this.dream = dream;
    this.dreamPlaying = 0;
    this.tOffset = tOffset;
    this.sound = null;
  }

// creation of a particle.
  createParticle(t) {
    noStroke();
    let r;
    if (this.dreamPlaying == 0) {
      r = tinyStarRadius + this.r * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2);
      fill('rgba(200,200,200,0.5)');
    } else {
      r = 4 * tinyStarRadius + 2 * this.r * Math.pow(Math.sin(this.freq * (t - this.tOffset) * Math.PI), 2);
      fill('rgba(200,200,200,0.8)');
    }
    circle(this.x,this.y, r);
  }

// setting the particle in motion.
  moveParticle() {
    if(this.x < 0 || this.x > width)
      this.xSpeed*=-1;
    if(this.y < 0 || this.y > height)
      this.ySpeed*=-1;
    this.x+=this.xSpeed;
    this.y+=this.ySpeed;
  }

// this function creates the connections(lines)
// between particles which are less than a certain distance apart
  joinParticles(paraticles, micLevel) {
    particles.forEach(element =>{
      let dis = dist(this.x,this.y,element.x,element.y);
      if(dis < windowWidth / 15) {
        stroke('rgba(255,255,255,0.04)');
        line(this.x,this.y,element.x,element.y);
      }
    });
  }
}

// an array to add multiple particles
let particles = [];

function setup() {
  fetchRecords()
  let cnv =   createCanvas(windowWidth - 10, windowHeight - 10);
  //background(0);




  // TDO: add onLoad Callback


  textSize(50);
  fill(200);
  textAlign(CENTER, CENTER);
  loading = text("LOADING...", windowWidth / 2, windowHeight / 2);

  intro = loadSound('assets/intro.mp3');
  clouds = createVideo(['assets/clouds.mp4'], vidLoad);
  clouds.hide();

  mic = new p5.AudioIn();
  mic.start()

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // connect the mic to the recorder
  recorder.setInput(mic);

  // create an empty sound file that we will use to playback the recording
  soundFile = new p5.SoundFile();

  // amplitude = new p5.Amplitude();
  // amplitude.setInput(intro);
  // // amplitude.smooth(0.6);
}

function vidLoad() {
  if (!loaded) {
    loaded = true;
  }
}

function draw() {
  if (!loaded) {
    return;
  }
  background('#000'); // #000 ?
  t = millis() * 0.001;

  if (state == 0) {
    // START
    buttonRadius = 100 + 15 * Math.sin(0.5 * t * Math.PI)
    fill('rgba(200,200,200,0.8)');
    circle(windowWidth / 2, windowHeight / 2, buttonRadius)
  } else if (state == 1) {
    // WAITING TO RECORD
    buttonRadius = 100 + 15 * Math.sin(0.5 * t * Math.PI)
    fill('rgba(200,200,200,0.8)');
    circle(windowWidth / 2, windowHeight / 2, buttonRadius)
  } else if (state == 2) {
    // RECORDING
    fill('rgba(200,200,200,0.8)');
    circle(windowWidth / 2, windowHeight / 2, buttonRadius - 10)
  } else if (state == 3) {
    image(clouds, windowWidth / 2 - 960, windowHeight / 2 - 540, 1920, 1080);

    let p = Math.min(t - tFinishRecord, 11) / 11; // video is 11 seconds long
    let r = (1 - p) * buttonRadius + p * tinyStarRadius * 2;
    noStroke();
    fill('rgba(200,200,200,0.5)');
    circle(windowWidth / 2, windowHeight / 2, r);

    if (t - tFinishRecord > 12) {
      tLastStartAdded = t;
      state = 4;

      let x = windowWidth / 2;
      let y = windowHeight / 2;
      particles.push(new Particle(x, y, 0, -Math.sqrt(2) * 0.1, myDreamHash, t));
      particles.push(new Particle(x, y, 0.1, 0.1, myDreamHash, t));
      particles.push(new Particle(x, y, -0.1, 0.1, myDreamHash, t));
    }
  } else if (state == 4) {
    if (t - tLastStartAdded > 1 && particles.length < maxParticles && t - tFinishRecord > 13) {
      tLastStartAdded = t;

      fetchedRecordsIdx = getRandomInt(fetchedRecords.length - 1);

      particles.push(new Particle(
        random(0, windowWidth),
        random(0, windowHeight),
        random(-0.2,0.2),
        random(-0.1,0.15),
        fetchedRecords[fetchedRecordsIdx],
        t));
      particles.push(new Particle(
        random(0, windowWidth),
        random(0, windowHeight),
        random(-0.2,0.2),
        random(-0.1,0.15),
        fetchedRecords[fetchedRecordsIdx],
        t));
      particles.push(new Particle(
        random(0, windowWidth),
        random(0, windowHeight),
        random(-0.2,0.2),
        random(-0.1,0.15),
        fetchedRecords[fetchedRecordsIdx],
        t));

      fetchedRecordsIdx++;
      if (fetchedRecordsIdx >= fetchedRecords.length) {
        fetchedRecordsIdx = 0;
      }
    }

    for(let i = 0;i<particles.length;i++) {
      particles[i].createParticle(t);
      particles[i].moveParticle();
      particles[i].joinParticles(particles.slice(i));
    }

  }
}

// When the user clicks the mouse
function mousePressed() {
  // Check if mouse is inside the circle
  let t = millis() * 0.001;

  if (state == 0) {
    userStartAudio();
    fullscreen(true)
    let d = dist(mouseX, mouseY, windowWidth / 2, windowHeight / 2);
    if (d < buttonRadius && mic.enabled) {
      state = 1;
      // PLAY FIRST AUDIO INSTRUCTION
      if (!intro.isPlaying()) {
        intro.play();
        tStartIntro = millis() * 0.001;
      }
    }
  } else if (state == 1 && t - tStartIntro > 30) {
    let d = dist(mouseX, mouseY, windowWidth / 2, windowHeight / 2);
    if (d < buttonRadius) {
      state = 2;
      intro.stop();
      recorder.record(soundFile);
      tStartRecord = t;
    }
  } else if (state == 4) {
    let d = 0;
    for(let i = 0;i<particles.length;i++) {
      d = dist(mouseX, mouseY, particles[i].x, particles[i].y);
      if (d < particles[i].r + 5) {
        if (particles[i].dreamPlaying == 1){
          particles[i].dreamPlaying = 0;
          console.log("Pause dream:", particles[i].dream);
          if (particles[i].sound) {
            particles[i].sound.pause();
          }
        } else {
          particles[i].dreamPlaying = 1;
          console.log("Play dream:", particles[i].dream);
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
}

function mouseReleased() {
  if (state == 2) {
    // TODO: check time since press start record is at least X seconds
    tFinishRecord = millis() * 0.001;
    if (tFinishRecord - tStartRecord < 2) {
      state = 1;
      recorder.stop();
    } else {
      state = 3;
      recorder.stop();
      setTimeout(function() {
        uploadRecord(soundFile.getBlob());
      }, 200);
      //console.log(soundFile.getBlob())
      // console.log(t)
      clouds.play();
    }

  }
}

//-------------------------------------------------------

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBcWe42sioCcnpknigrdBL0gAEJtAK2JD0",
  authDomain: "ruangrupa.firebaseapp.com",
  databaseURL: "https://ruangrupa.firebaseio.com",
  projectId: "ruangrupa",
  storageBucket: "ruangrupa.appspot.com",
  messagingSenderId: "582756113281",
  appId: "1:582756113281:web:baa4620eae557cd828e680"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function uploadRecord (record) {
  var storageRef = firebase.storage().ref();
  var current_date = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  myDreamHash = current_date+random+'.wav';

  var recordRef = storageRef.child(myDreamHash);
  recordRef.put(record).then(function(snapshot, error) {
      console.log('Uploaded ', myDreamHash);
  }, function(error) {
      console.log(error)
  });

}

function fetchRecords () {
  let listRef = firebase.storage().ref();
  // Find all the prefixes and items.
  listRef.listAll().then(function(res) {
    res.items.forEach(function(itemRef) {
      console.log(itemRef.name);
        fetchedRecords.push(itemRef.name);
    });
    console.log(fetchedRecords.join('\n'))
  }).catch(function(error) {
    console.log(error)
  });
}

function downloadRecord (particle) {
  let storageRef = firebase.storage().ref();

  storageRef.child(particle.dream).getDownloadURL()
    .then((url) => {
      // `url` is the download URL for 'images/stars.jpg'

      // This can be downloaded directly:
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.open('GET', url, true);


      xhr.onload = function(oEvent) {
        var blob = xhr.response;
        console.log(blob);
        particle.sound = loadSound(blob, function() {
          particle.sound.play();
        });
        particle.sound.onended(function() {
          particle.dreamPlaying = 0;
        });
      };

      xhr.send();
    })
    .catch(function(error) {
        console.log(error);
    });
}
