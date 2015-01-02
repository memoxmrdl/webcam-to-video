<?php

if (!empty($_POST['ftype']))
{
	switch($_POST['ftype'])
	{
		case 'video':
			if (isset($_FILES["data"])) {
				move_uploaded_file($_FILES["data"]["tmp_name"], 'video.webm');
			}
		break;
		
		case 'images':
		
			if (!empty($_POST['data']))
			{
				$im = imagecreatetruecolor(320, 240);
				$i = 0;
				
				foreach (explode('|', str_replace("\n", '', $_POST['data'])) as $image)
				{
					if (!empty($image))
					{
						foreach(explode('-----', $image) as $y => $csv)
						{
							$csv = trim($csv);
							
							if (!empty($csv))
							{
								foreach (explode(";", $csv) as $x => $color) {
									if (!empty($color))
										imagesetpixel($im, $x, $y, $color);
								}
							}
						}
						
						$i++;
						
						imagejpeg($im, 'img-'.$i.'.jpg');
					}
				}
			}
		break;
	}
}