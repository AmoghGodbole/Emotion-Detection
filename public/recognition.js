document.getElementById("myBtn").addEventListener("click", (event) => {
  console.log("Button Clicked");
  speechToEmotion();
});
const conclusion = document.getElementById("conclusion");

function speechToEmotion() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;

  recognition.onresult = function (event) {
    const results = event.results;
    const transcript = results[results.length - 1][0].transcript;

    console.log("Results " + results);
    console.log("Transcript " + transcript);
    console.log("Transcript type" + typeof transcript);

    fetch(`/listen/${transcript}`, {
      method: "POST",
      // body: JSON.stringify(transcript),
    }).then((res) => {
      // conclusion.value = transcript;
      console.log("Request complete! response:", res);
      // console.log("res.body: " + res.body);
      window.location.href = `http://localhost:3000/conclusion/${transcript}`;
      // console.log(window.location.href);
    });
    // $.ajax(`/listen/${transcript}`, {
    //   method: "POST",
    //   success: function (res) {
    //     if (res.code == 200) {
    //       console.log("Success");
    //       window.location.href = "localhost:3000/conclusion";
    //     } else {
    //       alert(res.code);
    //     }
    //   },
    // });
    recognition.stop();
  };

  recognition.onerror = function (event) {
    console.error("Recognition error -> ", event.error);
  };

  recognition.onaudiostart = function () {
    console.log("On audioStart");
  };

  recognition.onend = function () {
    console.log("On end");
  };

  recognition.start();
}
