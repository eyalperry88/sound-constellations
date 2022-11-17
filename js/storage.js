
// // Your web app's Firebase configuration
// var firebaseConfig = {
//   apiKey: "AIzaSyBcWe42sioCcnpknigrdBL0gAEJtAK2JD0",
//   authDomain: "ruangrupa.firebaseapp.com",
//   databaseURL: "https://ruangrupa.firebaseio.com",
//   projectId: "ruangrupa",
//   storageBucket: "ruangrupa.appspot.com",
//   messagingSenderId: "582756113281",
//   appId: "1:582756113281:web:baa4620eae557cd828e680"
// };

const firebaseConfig = {
  apiKey: "AIzaSyA0uLhGZHEW5fbGCNI2E8yImHjNegAa5-4",
  authDomain: "nine-nine-f-sounds.firebaseapp.com",
  projectId: "nine-nine-f-sounds",
  storageBucket: "nine-nine-f-sounds.appspot.com",
  messagingSenderId: "1044592267977",
  appId: "1:1044592267977:web:ab48b3afb6d2bcb8817318"
};
// // Initialize Firebase
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

function fetchRecords (callback) {
  let listRef = firebase.storage().ref();
  let fetchedRecords = [];
  // Find all the prefixes and items.
  listRef.listAll().then(function(res) {
    res.items.forEach(function(itemRef) {
      //console.log(itemRef.name);
        fetchedRecords.push(itemRef.name);
    });
    console.log(fetchedRecords.join('\n'))
    callback(fetchedRecords);
  }).catch(function(error) {
    console.log(error)
  });
}

function downloadRecord (particle) {
  let storageRef = firebase.storage().ref();

  storageRef.child(particle.audio).getDownloadURL()
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
          particle.isPlaying = 0;
        });
      };

      xhr.send();
    })
    .catch(function(error) {
        console.log(error);
    });
}
