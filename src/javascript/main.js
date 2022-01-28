// initialize database
const db = firebase.database();
const audio = new Audio('./src/sound/Pop Up Sms Tone.mp3');

var showLastMsg = 200;
var username = 'user';

scrollToBottom = () => {
  $('body').scrollTo('100%', { interrupt: true, duration: 1000, queue: true })
}


AOS.init({
  mirror: true
});

document.getElementById("message-form").addEventListener("submit", sendMessage);

// send message to db
function sendMessage(e) {
  e.preventDefault();

  // get values to be submitted
  var localTimestamp = moment.tz("Asia/Taipei").format("x");

  var message = $('#message-input').val();
  console.log(message);
  scrollToBottom();


  db.ref("messages/" + localTimestamp).set({
    username,
    message,
    localTimestamp,
    serverTimestamp: firebase.database.ServerValue.TIMESTAMP
  });

  $('#message-input').val('');
}

db.ref("/messages").on("value", function (data) {
  $("#ttl-msg").html(data.val().length);
  $("#ttl-msg").html('n/a');
});

// display the messages
// reference the collection created earlier
const fetchChat = db.ref("messages/");

// check for new messages using the onChildAdded event listener
fetchChat.limitToLast(showLastMsg).on("child_added", function (data) {

  console.log('new msg recived');
  hideLoader();
  audio.play();

  try {

    let messagesData = data.val();

    let senderName = filterXSS(messagesData.username);
    let senderMessage = linkifyStr(filterXSS(messagesData.message));
    let type = (username.toLowerCase() === senderName.toLowerCase() ? "send" : "receive");

    let sendingTimeLocal = messagesData.localTimestamp;
    let sendingTimeServer = messagesData.serverTimestamp;
    // let relativeSendingTime = moment(sendingTime, "x").fromNow();
    let relativeSendingTime = moment(sendingTimeServer).format('MMMM Do YYYY, h:mm:ss a');


    const message = `
      <div class="message ${type}" data-aos="zoom-in" data-aos-anchor-placement="bottom">
          <p class="username">${senderName}</p>
          <p class="msg-text">${senderMessage}</p>
          <p class="msg-time">${relativeSendingTime}</p>
      </div>
  `;

    document.querySelector('.message-container').innerHTML += message;
  } catch (error) {
    console.log(error);
  }

});


//Cookies System

if (Cookies.get('username')) {

  username = Cookies.get('username');
  // alert(`Welcome Back ${username}`);

} else {
  setUsername()
}

function setUsername() {
  username = prompt("Enter Your Name");

  try {
    if (username == null) {
      alert("Please to fill your name");
      setUsername();
    } else if (username.length > 3) {
      Cookies.set('username', capitalizeFirstLetter(username), { expires: 365 })
    } else {
      alert("Please enter real Name.");
      setUsername();
    }
  } catch (error) {
    console.log(error);
  }


}

function capitalizeFirstLetter(str) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}

hideLoader = () => {
  if (($(".loader").css('display')) != 'none') {
    $(".loader").hide();
  }
}

// fetch('https://server8299.000webhostapp.com/server/chat/');

db.ref("totalHits").on("value", (snapshot) => {
  $("#ttl-view").html(snapshot.val());
});

db.ref("totalHits").transaction(
  (totalHits) => totalHits + 1,
  (error) => {
    if (error) {
      console.log(error);
    }
  }
);

setTimeout(() => {
  scrollToBottom();
  $('#message-input').attr('placeholder', `Send message as ${username}`);
}, 4000);

setInterval(() => {
  $("#crt-time").html(moment().format('HH : mm : ss '))
}, 1000);

gsap.to('.scrollbar', {
  scrollTrigger: {
    trigger: 'body',
    start: "top 0px",
    end: "bottom 100%",
    markers: false,
    scrub: true
  },
  ease: 'none',
  width: '100%'
});

toogleInfo = () => {

  if (($("#info").css('left')) == '0px') {
    gsap.to('#info', {
      ease: 'bounce',
      left: '100%',
      duration: 1.5
    });
  } else {
    gsap.to('#info', {
      ease: 'bounce',
      left: '0%',
      duration: 1.5

    });
  }

}