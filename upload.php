<?php

if (isset($_FILES["data"])) {
	move_uploaded_file($_FILES["data"]["tmp_name"], 'video.webm');
}