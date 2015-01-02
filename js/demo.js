var isRecording = false;
var canvas = document.getElementById("canvas");
var video = null;
var rafId = 0;
var frames = [];
var flash_interval = 0;
var flash_image_pos = 0;
var flash_image = [];

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
	swffile: "swf/jscam_canvas_only.swf",
	quality: 85,
	onSave: flashCapture,
	onCapture: function()
	{
		window.webcam.save();
	},
	onTick: function(timer)
	{
	}
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
		console.log(window.webcam);
	}
}

function onError(error)
{
	alert('No camera available.');
	
	if (typeof(error.code) != 'undefined')
		console.error('An error occurred: [CODE ' + error.code + ']');
}

function startRecording()
{
	isRecording = true;
	$('#captureVideo').text('Stop capture');
	
	if (options.context == 'webrtc')
	{
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext('2d').drawImage(video, 0, 0);

		var url = canvas.toDataURL('image/webp', 1);
		
		rafId = window.requestAnimationFrame(drawVideoFrame);
	}
	else
	{
		// Flash
		window.webcam = this.options;
		window.webcam.capture();
	}
}

function stopRecording()
{
	isRecording = false;
	$('#captureVideo').text('3. Capture video');
	
	if (options.context == 'webrtc')
	{
		var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);
		var fileType = 'video';
		//window.location.href = window.URL.createObjectURL(webmBlob);
	}
	else
	{
		var webmBlob = frames.join('|');
		var fileType = 'images';
	}

	var fd = new FormData();
	fd.append('fname', 'video.webm');
	fd.append('data', webmBlob);
	fd.append('ftype', fileType);
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

// FLASH
function flashCapture(data)
{
	flash_image.push(data);
	
	flash_image_pos += 4 * 320;
	
	if (flash_image_pos >= 4 * 320 * 240) {
		frames.push(flash_image.join('-----'));
		flash_image = [];
		flash_image_pos = 0;
	}
}


/////////////////////////////////////////////////////////////////////////////////
// INITIALISATION
/////////////////////////////////////////////////////////////////////////////////
getUserMedia(options, onSuccess, onError);

// Initialize webcam options for fallback
//window.webcam = this.options;

$('#captureVideo').on('click', function()
{
	if (isRecording)
		stopRecording();
	else
		startRecording();
	
	/*
	switch(options.context)
	{
		case 'webrtc':
			
		break;

		case 'flash':
			
		break;

		default:
			alert('No context was supplied to getSnapshot()');
	}
	*/
});