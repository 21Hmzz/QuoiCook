function $_GET(param) {
  var vars = {};
  window.location.href.replace(location.hash, "").replace(
    /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
    function (m, key, value) {
      // callback
      vars[key] = value !== undefined ? value : "";
    }
  );

  if (param) {
    return vars[param] ? vars[param] : null;
  }
  return vars;
}


var recettesJson;

// function chargerRecette() {
//   var xobj = new XMLHttpRequest();
//   xobj.overrideMimeType("application/json");
//   xobj.open("GET", "../assets/js/recette.json", true);
//   xobj.onreadystatechange = function () {
//     if (xobj.readyState == 4 && xobj.status == "200") {
//       recettesJson = JSON.parse(xobj.responseText);
//       return recettesJson;
//     }
//   };
//   xobj.send(null);
// }
//xhr to load json and assign to variable

let id_recette = $_GET("id");
var recettesJson = (function () {
  var json = null;
  $.ajax({
    async: false,
    global: false,
    url: "../assets/js/recette.json",
    dataType: "json",
    success: function (data) {
      json = data;
    },
  });
  return json;
})();
$('#step').hide();
var loadingVoice = document.getElementById("loadingVoice");

var loadingVoice2 = $("#loadingVoice");
loadingVoice.style.display = "none";

let recettediv = document.getElementById("step");
let etapediv = document.getElementById("titleStep");


const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var recognition = new SpeechRecognition();
recognition.lang = "fr-FR";
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.continiuous = false;

import vision from "https://cdn.skypack.dev/@mediapipe/tasks-vision@latest";
const { GestureRecognizer, FilesetResolver } = vision;
const demosSection = document.getElementById("demos");

let gestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
let videodiv = document.getElementById("webcamviewer");
let retour = document.getElementById("retourText");

const videoHeight = 500;
const videoWidth = 300;

const trad = {
  None: "Aucun geste reconnu",
  Thumb_Up: "Pouce en l'air",
  Thumb_Down: "Pouce en bas",
  Closed_Fist: "Poing fermé",
  Open_Palm: "Paume ouverte",
  Pointing_Up: "Pointe le ciel",
  Victory: "En V",
  ILoveYou: "ROOOOOOCK",
};
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureOutput = document.getElementById("gesture_output");

let btn = document.getElementById("off");
var localstream;
let camoff = document.getElementById("camoff");
let camon = document.getElementById("camon");
let micon = document.getElementById("micon");
let micoff = document.getElementById("micoff");
var etat_mic = false;

camoff.style.display = "none";
camon.style.display = "block";
micoff.style.display = "none";
micon.style.display = "block";
console.log("mode : " + $_GET("mode"));


let sizeOfArray = function (array) {
  // A variable to store
  // the size of arrays
  let size = 0;

  // Traversing the array
  for (let key in array) {
    // Checking if key is present
    // in arrays or not
    if (array.hasOwnProperty(key)) {
      size++;
    }
  }

  // Return the size
  return size;
};

let recette = {
  1: "Ajouter 150ml d'eau dans un bol",
  2: "Ajouter 150ml de lait dans le meme bol",
  3: "Ajouter 200g de farine",
  4: "Ajouter 1 cuillère à soupe de beurre fondu",
  5: "Mélanger le tout",
  6: "Ajouter 1 cuillère à soupe de vanille liquide",
  7: "Mélanger le tout",
  8: "Votre Tacos 3 viandes est prêt !",
};

var camera = false;
recognition.onresult = function (event) {
  var sentence = event.results[0][0].transcript;
  console.log("Resultat : " + sentence + ".");
  console.log("Indice de confiance : " + event.results[0][0].confidence);

  for ( var i = 0; i < sizeOfArray(recette); i++) {
    if (sentence.indexOf(i) > -1) {
      y = i;
      EtapeSuivante(y);
      retour.innerHTML = sentence[0].toUpperCase() + sentence.slice(1) + ". ";

    }
  }

  if (sentence.indexOf("suivant") > -1 || sentence.indexOf("prochain") > -1 || sentence.indexOf("étape suivante") > -1 ) {
    y++;
    if (y > sizeOfArray(recette)) {
      y = sizeOfArray(recette);
    }
    EtapeSuivante(y);
    loadingVoice.style.display = "none";
    retour.innerHTML = "Etape suivante";
    setTimeout(function () {
      retour.innerHTML = "";
      loadingVoice.style.display = "flex";
    }, 5000);
  } else if (sentence.indexOf("précédent") > -1 || sentence.indexOf("étape précédente") > -1 || sentence.indexOf("précédente") > -1) {
    y--;
    EtapePrecedente(y);
    loadingVoice.style.display = "none";
    retour.innerHTML = "Etape précédente";
    setTimeout(function () {
      retour.innerHTML = "";
      loadingVoice.style.display = "flex";
    }, 5000);
  }else if (sentence.indexOf("recommencer") > -1 || sentence.indexOf("recommence") > -1 || sentence.indexOf("recommencez") > -1) {
    y=1;
    EtapeSuivante(y);
    loadingVoice.style.display = "none";
    retour.innerHTML = "Recette recommencée";
    setTimeout(function () {
      retour.innerHTML = "";
      loadingVoice.style.display = "flex";
    }, 5000);
  }else if (sentence.indexOf("stop") > -1 || sentence.indexOf("arrête") > -1 || sentence.indexOf("arrêtez") > -1) {
    window.speechSynthesis.pause();
    loadingVoice.style.display = "none";
    retour.innerHTML = "Recette en pause";
    setTimeout(function () {
      retour.innerHTML = "";
      loadingVoice.style.display = "flex";
    }, 5000);
  }else if (sentence.indexOf("reprendre") > -1 || sentence.indexOf("continuer") > -1 || sentence.indexOf("reprend") > -1) {
    window.speechSynthesis.resume();
    loadingVoice.style.display = "none";
    retour.innerHTML = "Reprise de la recette";
    setTimeout(function () {
      retour.innerHTML = "";
      loadingVoice.style.display = "flex";
    }, 5000);
  }
  else if (sentence.indexOf("active la caméra") > -1 || sentence.indexOf("active la webcam") > -1){
      console.log(camera)
      if (camera == false){
        enableCam();
      }
      retour.innerHTML = "Caméra activée";
      loadingVoice.style.display = "none";
      setTimeout(function () {
        retour.innerHTML = "";
        loadingVoice.style.display = "flex";
      }, 5000);

  }
  else if (sentence.indexOf("éteins la caméra") > -1 || sentence.indexOf("désactive la webcam") > -1){
      console.log(camera)
      if (camera){
        enableCam();
      }
      loadingVoice.style.display = "none";
      retour.innerHTML = "Caméra éteinte";
      setTimeout(function () {
        retour.innerHTML = "";
        loadingVoice.style.display = "flex";
      }, 5000);
  }

  else {
    loadingVoice.style.display = "none";
    retour.innerHTML = "Je n'ai pas compris :(";
    setTimeout(function () {
      retour.innerHTML = "";
      loadingVoice.style.display = "flex";
    }, 5000);
  }


};



recognition.onerror = function (event) {
  console.log("Erreur : " + event.error);
};

recognition.onend = function () {
if (etat_mic){
  recognition.start();
  // loadingVoice.style.display = "flex";

}else{
  recognition.stop();
}
};

async function runDemo() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
    },
    runningMode: runningMode,
  });
  demosSection.classList.remove("invisible");
}
runDemo();


micon.addEventListener("click", function () {
  micoff.style.display = "block";
  micon.style.display = "none";

  loadingVoice.style.display = "flex";
  recognition.start();
  etat_mic = true;
  console.log("micon");
});
micoff.addEventListener("click", function () {
  micoff.style.display = "none";
  micon.style.display = "block";

  loadingVoice.style.display = "none";
  etat_mic = false;
  recognition.abort();
  console.log("micoff");
});

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("camon");
  enableWebcamButton.addEventListener("click", enableCam);
  let camoffBTN = document.getElementById("camoff");
  camoffBTN.addEventListener("click", enableCam);
} else {
  console.warn("Application non supporté par votre navigateur");
}
// Enable the live webcam view and start detection.
let iconNoCam = document.getElementById("nocam");
function enableCam(event) {
  if (!gestureRecognizer) {
    alert("Chargement du module de reconnaissance en cours...");
    return;
  }
  if (webcamRunning) {
    camera = false;
    webcamRunning = false;
    camon.style.display = "block";
    const video = document.querySelector("video");
    const mediaStream = video.srcObject;
    const tracks = mediaStream.getTracks();
    tracks[0].stop();
    videodiv.style.display = "none";
    camoff.style.display = "none";
    iconNoCam.style.display = "block";
  } else {
    camera = true;
    webcamRunning = true;

    videodiv.style.display = "block";
    camon.style.display = "none";
    camoff.style.display = "block";
    iconNoCam.style.display = "none";
  }
  // getUsermedia parameters.
  const constraints = {
    video: true,
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}
var prediction_on = true;
var demande = "";

var y = 0;
async function predictWebcam() {
  if (prediction_on == false) {
    if (demande == "suivant") {
      y++;
      if (y > sizeOfArray(recette)) {
        y = sizeOfArray(recette);
      }
      EtapeSuivante(y);
    } else if (demande == "precedent") {
      if (y > 1) {
        y--;
      } else {
        y = 1;
      }
      EtapePrecedente(y);
    }
    else if (demande == "activer micro"){
      micon.click();

    }
    setTimeout(function () {
      prediction_on = true;
      predictWebcam();
    }, 2000);
  } else {
    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await gestureRecognizer.setOptions({ runningMode: runningMode });
    }
    let nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;

    canvasCtx.restore();
    if (results.gestures.length > 0) {
      gestureOutput.style.display = "block";
      gestureOutput.style.width = videoWidth;
      if (trad[results.gestures[0][0].categoryName] == "Pouce en l'air") {
        prediction_on = false;
        demande = "suivant";
      } else if (trad[results.gestures[0][0].categoryName] == "Pouce en bas") {
        prediction_on = false;
        demande = "precedent";
      } else if (trad[results.gestures[0][0].categoryName] == "Poing fermé") {
        prediction_on = false;
        demande = "activer micro";
      }
    } else {
      gestureOutput.style.display = "none";
    }

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }
}

etapediv.innerText = "Etape " + y + "/" + sizeOfArray(recettesJson[id_recette].etapes);
function EtapeSuivante(y) {
  window.speechSynthesis.cancel();
  let max_y = sizeOfArray(recettesJson[id_recette].etapes);

  if (y >= max_y) {
    y = max_y;
    
  }

  let etape = recettesJson[id_recette].etapes[y];

  recettediv.innerText = "";
  recettediv.innerText = etape;
  etapediv.innerText = "Etape " + y + "/" + max_y;
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(etape));
}
function EtapePrecedente(y) {
  window.speechSynthesis.cancel();
  let max_y = sizeOfArray(recettesJson[id_recette].etapes);
  if (y <= 1) {
    y = 1;
  }
  let etape = recettesJson[id_recette].etapes[y];
  recettediv.innerText = "";
  recettediv.innerText = etape;
  etapediv.innerText = "Etape " + y + "/" + max_y;
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(etape));
}

if($_GET("mode") == "all" ){

  var loadingbar = $(".bar");
  
  loadingbar.animate({
    width: "100%"
  }, 5000, function(){
    loadingbar.css("display", "none");
    $(".loading").css("display", "none");
    $('#step').css("display", "block");
  });
  console.log("tout est allumé");
  micon.click();
  setTimeout(function(){
    camon.click();
  }
  , 5000);
}