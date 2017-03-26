<?php

/**
 * Time
 */
date_default_timezone_set("America/New_York");

//Run Tests
//testCreateUser();
//testAuth();
uploadPhoto();
//deleteTest();
//insertAd();


function insertAd()
{
    $url = "http://sweng500api.saltosk.com/api/1/user/ad/";
    $postFields = array(
        // "api_key"   => "49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d",
        "postType"       => "Service",
        "title"          => "Test",
        "body"           => "Test",
        "creationDate"   => "2016-07-28",
        "expiration"     => "2016-08-28",
        "price"          => 0,
        "quantity"       => 999,
        "userId"         => 6,
        "streetAddress1" => "1",
        "streetAddress2" => null,
        "city"           => "PGH",
        "state"          => "PA",
        "zip"            => "1",
        "phone"          => "1",
        "email"          => "thefirelink@gmail.com"
    );

    $ch = curl_init();
    $chOpts = array(
        CURLOPT_URL             =>  $url,
        CURLOPT_RETURNTRANSFER  =>  1,
        CURLOPT_POSTFIELDS      =>  json_encode($postFields),
        CURLOPT_CUSTOMREQUEST   =>  "PUT",
        CURLOPT_SSL_VERIFYPEER  =>  0,
        CURLOPT_SSL_VERIFYHOST  =>  0,
        CURLOPT_FOLLOWLOCATION  =>  1,
        CURLOPT_HTTPHEADER      =>  array('Content-type: application/json',
                                         'Content-length: ' . strlen(json_encode($postFields)))
    );

    curl_setopt_array($ch, $chOpts);
    $result = curl_exec($ch);
    curl_close($ch);

    echo $result;
}

function deleteTest()
{
    $url = "http://ec2-52-41-112-29.us-west-2.compute.amazonaws.com:8888/api/1/classified/cheese/";
    // $postFields = array(
    //     "name"    => "something",
    //     "file"    => new CurlFile(realpath("./testImage.jpg"))
    // );

    //var_dump($postFields);

    $ch = curl_init();
    $chOpts = array(
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => 1,
        //CURLOPT_POSTFIELDS     => $postFields,
        CURLOPT_CUSTOMREQUEST  => "DELETE",
        //CURLOPT_HTTPHEADER     => array('Content-type: multipart/form-data'),
        //CURLOPT_SSL_VERIFYPEER => 0,
        //CURLOPT_VERBOSE        => 1,
    );

    curl_setopt_array($ch, $chOpts);
    $result = curl_exec($ch);
    echo $result . "\n";
    //print_r(curl_getinfo($ch));

    curl_close($ch);
}
/**
 * [testCreateUser description]
 *
 * @return [type] [description]
 */
function testCreateUser()
{
    $url = "http://sweng500api.saltosk.com/api/1/user/";
    $postFields = array(
        // "api_key"   => "49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d",
        "userName"   => "someGuy",
        "password"   => "1123581321",
        "firstName"  => "Some",
        "middleName" => "Dude",
        "lastName"   => "Guy",
        "email"      => "someguy@gmail.com",
        "address1"   => "123 Some Guy Drive.",
        "address2"   => null,
        "city"       => "Pittsburgh",
        "state"      => "PA",
        "zip"        => "15211",
        "phone1"     => "4121221122",
        "phone2"     => null
    );

    $ch = curl_init();
    $chOpts = array(
        CURLOPT_URL             =>  $url,
        CURLOPT_RETURNTRANSFER  =>  1,
        CURLOPT_POSTFIELDS      =>  json_encode($postFields),
        CURLOPT_CUSTOMREQUEST   =>  "PUT",
        CURLOPT_SSL_VERIFYPEER  =>  0,
        CURLOPT_SSL_VERIFYHOST  =>  0,
        CURLOPT_FOLLOWLOCATION  =>  1,
        CURLOPT_HTTPHEADER      =>  array('Content-type: application/json',
                                         'Content-length: ' . strlen(json_encode($postFields)))
    );

    curl_setopt_array($ch, $chOpts);
    $result = curl_exec($ch);
    curl_close($ch);

    echo $result;
}

function testAuth()
{
    $url = "http://ec2-52-41-112-29.us-west-2.compute.amazonaws.com:8888/api/1/user/authenticate/";
    $postFields = array(
        "api_key"   => "49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d",
        "userName"   => "jsmith",
        "password"   => "1123581321"
    );

    $ch = curl_init();
    $chOpts = array(
        CURLOPT_URL             =>  $url,
        CURLOPT_RETURNTRANSFER  =>  1,
        CURLOPT_POSTFIELDS      =>  json_encode($postFields),
        CURLOPT_CUSTOMREQUEST   =>  "POST",
        CURLOPT_SSL_VERIFYPEER  =>  0,
        CURLOPT_SSL_VERIFYHOST  =>  0,
        CURLOPT_FOLLOWLOCATION  =>  1,
        CURLOPT_HTTPHEADER      =>  array('Content-type: application/json',
                                         'Content-length: ' . strlen(json_encode($postFields)))
    );

    curl_setopt_array($ch, $chOpts);
    $result = curl_exec($ch);
    curl_close($ch);

    echo $result;
}

function uploadPhoto()
{
    $url = "https://sweng500api.saltosk.com/api/1/user/photo/";
    $filename = realpath("/home/geo/testImage.jpg");
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $finfo = finfo_file($finfo, $filename);
    $cFile = new \CurlFile($filename, $finfo, basename($filename));
    $postFields = array(
        "file" => $cFile,
        "userID" => 6
    );

    $ch = curl_init();
    $chOpts = array(
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_POSTFIELDS     => $postFields,
        // CURLOPT_POST           => 1,
        // CURLOPT_HTTPHEADER     => array('Content-type: multipart/form-data'),
        // CURLOPT_SSL_VERIFYPEER => 1,
        CURLOPT_VERBOSE        => 1
    );

    curl_setopt_array($ch, $chOpts);
    $result = curl_exec($ch);
    echo $result . "\n";
    print_r(curl_getinfo($ch));

    curl_close($ch);
}
