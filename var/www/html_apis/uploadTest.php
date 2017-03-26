<?php

header("Access-Control-Allow-Origin: *");
header("Content-type: application/json");

$url = $_FILES["file"]["tmp_name"];

echo json_encode(array("status" => "ok", "url" => $url));
