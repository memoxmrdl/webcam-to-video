var isRecording = false;
var canvas = document.getElementById("canvas");
var video = null;
var rafId = 0;
var frames = [];

var options = {
	"audio": false, //false: OTHERWISE FF nightlxy throws an NOT IMPLEMENTED error
	"video": true,
	el: "webcam",

	extern: null,
	append: true,

	// noFallback:true, use if you don't require a fallback

	width: 320, 
	height: 240, 

	mode: "callback",
	// callback | save | stream
	swffile: "../dist/fallback/jscam_canvas_only.swf",
	quality: 85
}

function onSuccess(stream)
{
	video = document.getElementsByTagName('video')[0];

	if (options.context === 'webrtc') {

		if ((typeof MediaStream !== "undefined" && MediaStream !== null) && stream instanceof MediaStream) {

			if (video.mozSrcObject !== undefined) { //FF18a
				video.mozSrcObject = stream;
			} else { //FF16a, 17a
				video.src = stream;
			}

			return video.play();

		} else {
			var vendorURL = window.URL || window.webkitURL;
			video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
		}

		video.onerror = function () {
			stream.stop();
			streamError();
		};

	} else{
		// flash context
	}
}

function onError(error)
{
	alert('No camera available.');
	console.error('An error occurred: [CODE ' + error.code + ']');
}

function startRecording()
{
	isRecording = true;
	$('#captureVideo').text('Stop capture');
 
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	canvas.getContext('2d').drawImage(video, 0, 0);

	var url = canvas.toDataURL('image/webp', 1);
	video = video;

	rafId = window.requestAnimationFrame(drawVideoFrame);
}

function stopRecording()
{
	isRecording = false;
	$('#captureVideo').text('3. Capture video');

	var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);
	//window.location.href = window.URL.createObjectURL(webmBlob);

	var fd = new FormData();
	fd.append('fname', 'video.webm');
	fd.append('data', webmBlob);
	$.ajax({
	    type: 'POST',
	    url: 'upload.php',
	    data: fd,
	    processData: false,
	    contentType: false
	}).done(function(data) {
		alert('upload ok');
	});
}

function drawVideoFrame(time)
{
	canvas.getContext('2d').drawImage(video, 0, 0);
	rafId = window.requestAnimationFrame(drawVideoFrame);
	frames.push(canvas.toDataURL('image/webp', 1));
}


/////////////////////////////////////////////////////////////////////////////////
// INITIALISATION
/////////////////////////////////////////////////////////////////////////////////
getUserMedia(options, onSuccess, onError);

// Initialize webcam options for fallback
//window.webcam = this.options;

$('#captureVideo').on('click', function()
{
	switch(options.context)
	{
		case 'webrtc':
			if (isRecording)
				stopRecording();
			else
				startRecording();
		break;

		case 'flash':
		break;

		default:
			alert('No context was supplied to getSnapshot()');
	}
});