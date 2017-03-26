<?PHP

/**
 * The date!
 */
date_default_timezone_set('America/New_York');

/**
 * Headers
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,PUT,POST,DELETE,OPTIONS");
header("Access-Control-Allow-Headers: origin, x-pg-sessionid, x-pg-userid, content-type, accept");
header("Access-Control-Max-Age: 10");
header('Content-type: application/json');

if ("OPTIONS" == $_SERVER['REQUEST_METHOD']) {
    exit(0);
}

/**
 * We need this
 */
require 'Slim/Slim.php';

define("DB_HOST", "something.com");
define("DB_NAME", "social_classifieds");
define("DB_USER", "sweng500");
define("DB_PASS", "passwordt");
//define("API_KEY", "49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d");

//Register Slim autoloader
\Slim\Slim::registerAutoloader();

//Init Slim
$app = new \Slim\Slim();

// ************************
//
//       API Routing
//
// ************************
//
// SlimPHP is an opensource REST framework
// It handles routing of API requests with different HTTP verbs

//classifieds
$app->get("/api/1/ad/all/", "classifiedAd_getAll");
$app->get("/api/1/ad/tag/:adId/", "classifiedAd_getTags");
$app->get("/api/1/ad/:adId/", "classifiedAd_get");
$app->get("/api/1/user/ad/:userId/", "classifiedAd_getUserAds");
$app->put("/api/1/user/ad/", "classifiedAd_create");
$app->delete("/api/1/user/ad/:adID/", "delete_ad");

//User
$app->get("/api/1/user/tag/:userID/", "user_getTags");
$app->get("/api/1/user/friends/:userID/", "user_getFriends");
$app->get("/api/1/user/friends/pending/:userID/", "user_getPendingFriends");
$app->get("/api/1/user/findFriends/:userID/", "user_findFriends");
//This needs to be the last GET with /api/1/user/, otherwise it will pick up 'findFriends' for instance and try to use it as a :userID
$app->get("/api/1/user/:userID/", "get_user");

$app->put("/api/1/user/", "create_user");
$app->put("/api/1/user/profile/", "user_updateProfile");
$app->put("/api/1/user/friends/reject/:friendUserID/", "user_rejectRequest");
$app->put("/api/1/user/friends/:friendUserID/", "user_acceptRequest");
$app->put("/api/1/user/friends/requests/:friendUserID/", "user_addFriend");

$app->post("/api/1/user/login/", "user_login");
$app->post("/api/1/user/tag/", "user_addTag");
$app->post("/api/1/user/photo/", "user_photo_upload");
$app->post("/api/1/user/:userID/", "update_user");

$app->delete("/api/1/user/:userID/", "delete_user");
$app->delete("/api/1/user/friends/requests/:userID/", "delete_contact");
$app->delete("/api/1/user/friends/:userID/", "delete_contact");

//Temp
$app->post("/api/1/temp/photo/", "temp_photo_upload");

//Extra
$app->get("/api/1/fun/distance/:zip1/:zip2/", "fun_calcDistance");

/**
 * [create_user description]
 *
 * @return [type] [description]
 */
function create_user()
{
    $response = checkPut();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userName"   => "",
        "password"   => "",
        "firstName"  => "",
        "middleName" => null,
        "lastName"   => "",
        "email"      => "",
        "address1"   => null,
        "address2"   => null,
        "city"       => null,
        "state"      => null,
        "zip"        => null,
        "phone1"     => null,
        "phone2"     => null
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        //Insert into DB
        $pdh = initPDO();
        $pdh->beginTransaction();

        try {
            $stmtUser = $pdh->prepare(
                "INSERT INTO USER
                    (USERNAME, PASSWORD, FIRST_NAME, MIDDLE_NAME, LAST_NAME, EMAIL)
                VALUES
                    (:user, :pass, :fName, :mName, :lName, :email)"
            );

            $stmtContact = $pdh->prepare(
                "INSERT INTO CONTACT_INFO
                    (USER_ID, ADDRESS1, ADDRESS2, CITY, STATE, ZIP, PHONE1, PHONE2)
                VALUES
                    (:userId, :address1, :address2, :city, :state, :zip, :phone1, :phone2)"
            );

            $stmtUser->bindParam(":user", $params["userName"]);
            $stmtUser->bindParam(":pass", password_hash($params["password"], PASSWORD_DEFAULT));
            $stmtUser->bindParam(":fName", $params["firstName"]);
            $stmtUser->bindParam(":mName", $params["middleName"]);
            $stmtUser->bindParam(":lName", $params["lastName"]);
            $stmtUser->bindParam(":email", $params["email"]);

            $stmtUser->execute();

            $userID = $pdh->lastInsertId();
            $stmtContact->bindParam(":userId", $userID);
            $stmtContact->bindParam(":address1", $params["address1"]);
            $stmtContact->bindParam(":address2", $params["address2"]);
            $stmtContact->bindParam(":city", $params["city"]);
            $stmtContact->bindParam(":state", $params["state"]);
            $stmtContact->bindParam(":zip", $params["zip"]);
            $stmtContact->bindParam(":phone1", $params["phone1"]);
            $stmtContact->bindParam(":phone2", $params["phone2"]);

            $stmtContact->execute();

            $pdh->commit();

        } catch (\PDOException $e) {
            $pdh->rollBack();
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }

    echo json_encode($response);
    exit;
}

/**
 * [update_user description]
 *
 * @return [type] [description]
 */
function update_user($userID)
{
    $response = checkPost();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userName"        => "",
        "password"        => "",
        "firstName"       => "",
        "middleName"      => null,
        "lastName"        => "",
        "email"           => "",
        "address1"        => null,
        "address2"        => null,
        "city"            => null,
        "state"           => null,
        "zip"             => null,
        "phone1"          => null,
        "phone2"          => null
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        $pdh = initPDO();

        $pdh->beginTransaction();

        try {
            $stmtUser = $pdh->prepare(
                "UPDATE
                  USER
                SET
                  USERNAME=:user, PASSWORD=:pass, FIRST_NAME=:fName, MIDDLE_NAME=:mName, LAST_NAME=:lName, EMAIL=:email
                WHERE
                  ID=:user_id"
            );

            $stmtContact = $pdh->prepare(
                "UPDATE
                    CONTACT_INFO
                 SET
                    ADDRESS1=:address1, ADDRESS2=:address2, CITY=:city, STATE=:state, ZIP=:zip, PHONE1=:phone1, PHONE2=:phone2
                 WHERE
                    USER_ID=:user_id"
            );

            $stmtUser->bindParam(":user_id", $userID);
            $stmtUser->bindParam(":user", $params["userName"]);
            $stmtUser->bindParam(":pass", password_hash($params["password"], PASSWORD_DEFAULT));
            $stmtUser->bindParam(":fName", $params["firstName"]);
            $stmtUser->bindParam(":mName", $params["middleName"]);
            $stmtUser->bindParam(":lName", $params["lastName"]);
            $stmtUser->bindParam(":email", $params["email"]);

            $stmtUser->execute();

            $stmtContact->bindParam(":user_id", $userID);
            $stmtContact->bindParam(":address1", $params["address1"]);
            $stmtContact->bindParam(":address2", $params["address2"]);
            $stmtContact->bindParam(":city", $params["city"]);
            $stmtContact->bindParam(":state", $params["state"]);
            $stmtContact->bindParam(":zip", $params["zip"]);
            $stmtContact->bindParam(":phone1", $params["phone1"]);
            $stmtContact->bindParam(":phone2", $params["phone2"]);

            $stmtContact->execute();

            $pdh->commit();

        } catch (\PDOException $e) {
            $pdh-> rollBack();

            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }

    echo json_encode($response);
    exit;
}

function user_updateProfile()
{
    $response = checkPut();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => "",
        "bio"    => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }


        if ($response["status"] !== "error") {
            //Insert into DB
            $pdh = initPDO();
            try {
                $profileStmt = $pdh->prepare(
                    "
                    INSERT INTO PROFILE (USER_ID, BIO) VALUES(:userId, :bio)
                    ON DUPLICATE KEY UPDATE BIO=:bio
                    "
                );
                
                $profileStmt->bindParam(":userId", $params["userId"]);
                $profileStmt->bindParam(":bio", $params["bio"]);
                $profileStmt->execute();
            } catch (\PDOException $e) {
                $response["status"] = "error";
                $response["message"] = "Database error";
            }
        }
    }

    echo json_encode($response);
    exit;
}

/**
 * [authenticate_user description]
 *
 * @return [type] [description]
 */
function user_login()
{
    $response = checkPost();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userName"   => "",
        "password"   => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdh = initPDO();

            $stmt = $pdh->prepare(
                "SELECT
                    ID, USERNAME, PASSWORD
                FROM
                    USER
                WHERE USERNAME = :user"
            );

            $stmt->bindParam(":user", $params["userName"]);

            $results = $stmt->execute();

            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($row === false) {
                $response["status"]  = "error";
                $response["message"] = "user not found";
            } else {
                if (password_verify($params["password"], $row["PASSWORD"])) {
                    $response["status"]  = "ok";
                    $response["message"] = "User authenticated";
                    $response["userID"]  = $row["ID"];
                } else {
                    $response["status"]  = "error";
                    $response["message"] = "Incorrect password";
                }
            }

            //var_dump($results);
        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }

    echo json_encode($response);
    exit;
}
/**
 * [delete_ad description]
 *
 * @return [type] [description]
 */
function delete_ad($adID)
{
    $response = checkDelete();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if ("" === $suppliedParams || null === $suppliedParams) {
        $suppliedParams = $_GET;
    }
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdh = initPDO();

            //get tag id
            $stmtDeleteAd = $pdh->prepare(
                "DELETE FROM AD WHERE ID=:adID AND USER_ID=:userID"
            );

            $stmtDeleteAd->bindParam(":adID", $adID);
            $stmtDeleteAd->bindParam(":userID", $params["userId"]);
            $stmtDeleteAd->execute();

        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }
    echo json_encode($response);
    exit;
}
/**
 * [delete_user description]
 *
 * @return [type] [description]
 */
function delete_user($userID)
{
    $response = checkDelete();

    if ("error" === $response["status"]) {
        echo json_encode($response);
            exit;
    }

        // $requiredParams = array(
        //     "password" => ""
        // );

        // $suppliedParams = @json_decode(file_get_contents("php://input"), true);
        // if (!checkAPIKey($suppliedParams)) {
        //     $response["status"]  = "error";
        //     $response["message"] = "Invalid something";
        // } else {
        //     $params = checkParams($requiredParams, $suppliedParams);

        //     if (false === $params) {
        //         $response["status"] = "error";
        //         $response["message"] = "invalid params";
        //     }
        // }

    if ($response["status"] !== "error") {
        try {
            $pdh = initPDO();

            //get tag id
            $stmtDeleteUser = $pdh->prepare(
                "
                DELETE FROM USER WHERE ID=:userID
                "
            );

            $stmtDeleteUser->bindParam(":userID", $userID);
            //$stmtDeleteUser->bindParam(":pass", password_hash($params["password"], PASSWORD_DEFAULT));
            $stmtDeleteUser->execute();

            //echo json_encode($stmtDeleteUser->errorInfo());

        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }
    //echo password_hash("05a671c66aefea124cc08b76ea6d30bb", PASSWORD_DEFAULT);
    echo json_encode($response);
    exit;
}

/**
 * [user_cancelFriendRequest description]
 *
 * @param [type] $userId [description]
 *
 * @return [type] [description]
 */
function delete_friendRequest($delUserID)
{
    $response = checkDelete();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (empty($suppliedParams) || "" === $suppliedParams) {
        $suppliedParams = $_GET;
    }
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdh = initPDO();

            $stmtDelFriend = $pdh->prepare(
                "
                DELETE FROM USER_CONNECTION
                WHERE
                    SENDER_USER_ID = :senderID
                AND
                    SENDEE_USER_ID = :sendeeID
                "
            );

            $stmtDelFriend->bindParam(":sendeeID", $delUserID);
            $stmtDelFriend->bindParam(":senderID", $params["userId"]);
            $stmtDelFriend->execute();
        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMessage();
        }
    }
    echo json_encode($response);
    exit;
}

/**
 * [user_cancelFriendRequest description]
 *
 * @param [type] $userId [description]
 *
 * @return [type] [description]
 */
function delete_contact($delUserID)
{
    $response = checkDelete();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (empty($suppliedParams) || "" === $suppliedParams) {
        $suppliedParams = $_GET;
    }
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdh = initPDO();

            $stmtDelFriend = $pdh->prepare(
                "
                DELETE FROM USER_CONNECTION WHERE SENDER_USER_ID = :senderID AND SENDEE_USER_ID = :sendeeID;
                DELETE FROM USER_CONNECTION WHERE SENDEE_USER_ID = :senderID AND SENDER_USER_ID = :sendeeID;
                "
            );

            $stmtDelFriend->bindParam(":sendeeID", $delUserID);
            $stmtDelFriend->bindParam(":senderID", $params["userId"]);
            $stmtDelFriend->execute();
        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMessage();
        }
    }
    echo json_encode($response);
    exit;
}

/**
 * [user_getFriends description]
 *
 * @param [type] $userId [description]
 *
 * @return [type] [description]
 */
function user_getFriends($userId)
{
    $response = array(
        "status" => "ok",
        "message" => "Success",
        "friends" => array()
    );

    $pdh = initPDO();

    try {
        //Get send requests
        $sentStmt = $pdh->prepare(
            "
            SELECT
                USER.ID as userID, USER.USERNAME as user, PROFILE.BIO as bio, CONTACT_INFO.*
            FROM
                USER
            LEFT JOIN CONTACT_INFO ON CONTACT_INFO.USER_ID = USER.ID
            LEFT JOIN PROFILE ON PROFILE.USER_ID = USER.ID
            WHERE
                (:userId IN (SELECT SENDEE_USER_ID FROM USER_CONNECTION WHERE USER_CONNECTION.SENDER_USER_ID = USER.ID AND STATUS = 1)
            OR
                :userId IN (SELECT SENDER_USER_ID FROM USER_CONNECTION WHERE USER_CONNECTION.SENDEE_USER_ID = USER.ID AND STATUS = 1))
            "
        );
        $sentStmt->bindParam(":userId", $userId);
        $sentStmt->execute();

        $sentRows = $sentStmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($sentRows as $row) {
            $row["requestType"]    = "Sender";
            $response["friends"][] = $row;
        }

        //Get our ZIP
        $calcDist = true;
        $zipQuery = "SELECT ZIP FROM CONTACT_INFO WHERE USER_ID LIKE :userID";
        $zipStmt = $pdh->prepare($zipQuery);
        $zipStmt->bindParam(":userID", $userId);
        $zipStmt->execute();

        $zipRow = $zipStmt->fetch(\PDO::FETCH_ASSOC);
        if (false === $zipRow) {
            //No ZIP is available. Oh well
            $calcDist = false;
        }

        if ($calcDist) {
            $response["friends"] = calcDistance($response["friends"], $zipRow["ZIP"]);
        }
    } catch (\PDOException $e) {
        $response["status"] = "error";
        $response["message"] = "Failed to retrieve data";
    }

    echo json_encode($response);
    exit;
}

/**
 * [user_getPendingFriends description]
 *
 * @param [type] $userId [description]
 *
 * @return [type] [description]
 */
function user_getPendingFriends($userId)
{
    $response = array(
        "status" => "ok",
        "message" => "Success",
        "friends" => array()
    );

    $pdh = initPDO();

    try {
        //Get send requests
        $sentStmt = $pdh->prepare(
            "
            SELECT
                USER.ID as userID, USER.USERNAME as user, PROFILE.BIO, CONTACT_INFO.*
            FROM
                USER_CONNECTION
            LEFT JOIN USER on USER.ID = USER_CONNECTION.SENDEE_USER_ID
            LEFT JOIN CONTACT_INFO ON CONTACT_INFO.USER_ID = USER.ID
            LEFT JOIN PROFILE ON PROFILE.USER_ID = USER.ID
            WHERE
                USER_CONNECTION.SENDER_USER_ID = :userId
            AND
                USER_CONNECTION.STATUS = 0
            "
        );
        $sentStmt->bindParam(":userId", $userId);
        $sentStmt->execute();

        $sentRows = $sentStmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($sentRows as $row) {
            $row["requestType"]    = "Sender";
            $response["friends"][] = $row;
        }

        //Get received requests
        $recStmt = $pdh->prepare(
            "
            SELECT
                USER.ID as userID, USER.USERNAME as user, PROFILE.BIO, CONTACT_INFO.*
            FROM
                USER_CONNECTION
            LEFT JOIN USER on USER.ID = USER_CONNECTION.SENDER_USER_ID
            LEFT JOIN CONTACT_INFO ON CONTACT_INFO.USER_ID = USER.ID
            LEFT JOIN PROFILE ON PROFILE.USER_ID = USER.ID
            WHERE
                USER_CONNECTION.SENDEE_USER_ID = :userId
            AND
                USER_CONNECTION.STATUS = 0
            "
        );
        $recStmt->bindParam(":userId", $userId);
        $recStmt->execute();

        $recRows = $recStmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($recRows as $row) {
            $row["requestType"]    = "Sendee";
            $response["friends"][] = $row;
        }

        //Get our ZIP
        $calcDist = true;
        $zipQuery = "SELECT ZIP FROM CONTACT_INFO WHERE USER_ID LIKE :userID";
        $zipStmt = $pdh->prepare($zipQuery);
        $zipStmt->bindParam(":userID", $userId);
        $zipStmt->execute();

        $zipRow = $zipStmt->fetch(\PDO::FETCH_ASSOC);
        if (false === $zipRow) {
            //No ZIP is available. Oh well
            $calcDist = false;
        }

        if ($calcDist) {
            $response["friends"] = calcDistance($response["friends"], $zipRow["ZIP"]);
        }
    } catch (\PDOException $e) {
        $response["status"] = "error";
        $response["message"] = "Failed to retrieve data";
    }

    echo json_encode($response);
    exit;
}

/**
 * [user_findFriends description]
 *
 * @return [type] [description]
 */
function user_findFriends($userId)
{
    $response = array(
        "status"  => "ok",
        "message" =>"Success",
        "friends" => array()
    );

    $calcDist   = true;
    $pdh        = initPDO();

    try {
        $stmt = $pdh->prepare(
            "SELECT
                TAG_ID
            FROM
                USER_TAGS
            WHERE USER_ID = :userId"
        );

        $stmt->bindParam(":userId", $userId);
        $stmt->execute();
        $rows = $stmt->fetchAll(\PDO::FETCH_NUM);
        $tags = array();

        foreach ($rows as $row) {
            $tags[] = $row[0];
        }

        $queryString = implode(",", $tags);

        $stmtGetUserMatches = $pdh->prepare(
            "SELECT
                USER.ID as userID, USERNAME as user, PROFILE.BIO, CONTACT_INFO.*, COUNT(USER_TAGS.USER_ID) as matchCount
            FROM
                USER_TAGS, USER
            LEFT JOIN CONTACT_INFO on USER.ID = CONTACT_INFO.USER_ID
            LEFT JOIN PROFILE ON PROFILE.USER_ID = USER.ID
            WHERE
                USER_TAGS.TAG_ID IN ({$queryString})
            AND
                USER.ID = USER_TAGS.USER_ID
            AND
                :userId NOT IN (SELECT SENDEE_USER_ID FROM USER_CONNECTION WHERE USER_CONNECTION.SENDER_USER_ID = USER.ID)
            AND
                :userId NOT IN (SELECT SENDER_USER_ID FROM USER_CONNECTION WHERE USER_CONNECTION.SENDEE_USER_ID = USER.ID)
            AND
                USER_TAGS.USER_ID <> :userId
            GROUP BY USER_TAGS.USER_ID
            ORDER BY matchCount DESC"
        );

        $stmtGetUserMatches->bindParam(":userId", $userId);
        $stmtGetUserMatches->execute();

        $friendRows = $stmtGetUserMatches->fetchAll(\PDO::FETCH_ASSOC);

        //Get our ZIP
        $zipQuery = "SELECT ZIP FROM CONTACT_INFO WHERE USER_ID LIKE :userID";
        $zipStmt = $pdh->prepare($zipQuery);
        $zipStmt->bindParam(":userID", $userId);
        $zipStmt->execute();

        $zipRow = $zipStmt->fetch(\PDO::FETCH_ASSOC);
        if (false === $zipRow) {
            //No ZIP is available. Oh well
            $calcDist = false;
        }

        if ($calcDist) {
            $friendRows = calcDistance($friendRows, $zipRow["ZIP"]);
        }


        $response["status"]  = "ok";
        $response["friends"] = $friendRows;

    } catch (\PDOException $e) {
        $response["status"] = "ok";
        $response["message"] = $e->getMEssage();
    }

    echo json_encode($response);
    exit;

}

/**
 * [user_addTag description]
 *
 * @return [type] [description]
 */
function user_addTag()
{
    $response = checkPost();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => "",
        "tag"    => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdh = initPDO();

            //check if tag exists
            $stmtTagExist = $pdh->prepare(
                "SELECT
                    ID
                FROM
                    TAG
                WHERE
                    NAME=:tag
                UNION SELECT
                    ID
                FROM
                    TAG_PENDING
                WHERE
                  NAME=:tag"
            );

            $stmtTagExist->bindParam(":tag", $params["tag"]);
            $stmtTagExist->execute();
            $existingTag = $stmtTagExist->fetch();

            //check if need to create tag
            if ($existingTag !== false) {
                $newTagId = $existingTag["ID"];
            } else {
                $stmtCreateTag = $pdh->prepare(
                    "INSERT INTO TAG_PENDING
                        (NAME)
                    VALUES
                        (:tag)"
                );

                $stmtCreateTag->bindParam(":tag", $params["tag"]);
                $stmtCreateTag->execute();

                $newTagId = $pdh->lastInsertId();
            }


            //link tag to user
            $stmtAddUserTag = $pdh->prepare(
                "INSERT INTO USER_TAGS
                    (USER_ID, TAG_ID)
                VALUES
                    (:userId, :tagId)
                ON DUPLICATE KEY UPDATE
                  USER_ID=:userId, TAG_ID=:tagId"
            );
            $response["message"] = $params["userId"];
            $stmtAddUserTag->bindParam(":userId", $params["userId"]);
            $stmtAddUserTag->bindParam(":tagId", $newTagId);

            $stmtAddUserTag->execute();

        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }

    echo json_encode($response);
    exit;

}

/**
 * [user_removeTag description]
 *
 * @return [type] [description]
 */
function user_removeTag()
{
    $response = checkPost();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => "",
        "tag"    => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        //Insert into DB
        $dbUser = "root";
        $dbPass = "";
        $dbHost = "localhost";
        $dbPort = "3306";
        $dbDb   = "sweng500";

        try {
            $pdh = initPDO();

            //get tag id
            $stmtTagExist = $pdh->prepare(
                "SELECT
                    ID
                FROM
                    TAG
                WHERE
                    NAME=:tag
                UNION SELECT
                    ID
                FROM
                    TAG_PENDING
                WHERE
                    NAME=:tag"
            );

            $stmtTagExist->bindParam(":tag", $params["tag"]);
            $stmtTagExist->execute();
            $existingTag = $stmtTagExist->fetch();

            $tagId= $existingTag["ID"];

            //remove tag from user
            $stmtRemoveUserTag = $pdh->prepare(
                "DELETE FROM USER_TAGS WHERE
                    USER_ID = :userId AND TAG_ID = :tagId"
            );

            $stmtRemoveUserTag->bindParam(":userId", $params["userId"]);
            $stmtRemoveUserTag->bindParam(":tagId", $tagId);

            $stmtRemoveUserTag->execute();

            echo json_encode($stmtRemoveUserTag->errorInfo());

        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }

    echo json_encode($response);
    exit;
}

/**
 * [user_getTags description]
 *
 * @return [type] [description]
 */
function user_getTags($userID)
{
    $response = array(
        "status" => "ok",
        "message" => "Success"
    );

    try {
        $pdh = initPDO();

        //check if tag exists
        $stmt = $pdh->prepare(
            "SELECT
              TAG_PENDING.NAME
            FROM
                USER_TAGS
            JOIN TAG_PENDING ON
              USER_TAGS.TAG_ID = TAG_PENDING.ID
            WHERE
                USER_TAGS.USER_ID=:userId
            "
        );

        $stmt->bindParam(":userId", $userID);
        $stmt->execute();
        $sqlResult = $stmt->fetchAll();
        $userTags = array();
        if ($sqlResult !== false &&  count($sqlResult) > 0) {
            foreach ($sqlResult as $r) {
                $userTags[] = $r["NAME"];
            }

            array_push($response, $userTags);
        }

    } catch (\PDOException $e) {
        $response["status"] = "ok";
        $response["message"] = $e->getMEssage();
    }

    echo json_encode($response);
    exit;
}

/**
 * [get_user description]
 *
 * @return [type] [description]
 */
function get_user($userID)
{
    $response = array("status" => "ok", "message" => "Success");

    try {
        $pdh = initPDO();

        if (is_numeric($userID)) {
            $stmt = $pdh->prepare(
                "SELECT
                    USER.ID as userID, USER.USERNAME, USER.FIRST_NAME, USER.MIDDLE_NAME,
                    USER.LAST_NAME, USER.EMAIL, CONTACT_INFO.*, USER_IMAGE.*, IMAGE.*, PROFILE.*
                FROM
                    USER
                LEFT JOIN CONTACT_INFO on CONTACT_INFO.USER_ID = USER.ID
                LEFT JOIN USER_IMAGE on USER_IMAGE.USER_ID = USER.ID
                LEFT JOIN IMAGE on IMAGE.ID = USER_IMAGE.IMAGE_ID
                LEFT JOIN PROFILE on PROFILE.USER_ID = USER.ID
                WHERE
                    USER.ID = :userName
                ORDER BY IMAGE.ID DESC"
            );
        } else {
            $stmt = $pdh->prepare(
                "SELECT
                    USER.ID as userID, USER.USERNAME, USER.FIRST_NAME, USER.MIDDLE_NAME,
                    USER.LAST_NAME, USER.EMAIL, CONTACT_INFO.*, USER_IMAGE.*, IMAGE.*, PROFILE.*
                FROM
                    USER
                LEFT JOIN CONTACT_INFO on CONTACT_INFO.USER_ID = USER.ID
                LEFT JOIN USER_IMAGE on USER_IMAGE.USER_ID = USER.ID
                LEFT JOIN IMAGE on IMAGE.ID = USER_IMAGE.IMAGE_ID
                LEFT JOIN PROFILE on PROFILE.USER_ID = USER.ID
                WHERE
                    USER.USERNAME = :userName
                ORDER BY IMAGE.ID DESC"
            );
        }

        $stmt->bindParam(":userName", $userID);

        $results = $stmt->execute();

        $row = $stmt->fetch();

        if ($row === false) {
            $response["status"] = "ok";
            $response["message"] = "user not found";
        } else {
            $response["status"]  = "ok";
            $response["message"] = "user found";
            $user = array(
                "id"         => $row["userID"],
                "userName"   => $row["USERNAME"],
                "firstName"  => $row["FIRST_NAME"],
                "middleName" => $row["MIDDLE_NAME"],
                "lastName"   => $row["LAST_NAME"],
                "email"      => $row["EMAIL"],
                "address1"   => $row["ADDRESS1"],
                "address2"   => $row["ADDRESS2"],
                "city"       => $row["CITY"],
                "state"      => $row["STATE"],
                "zip"        => $row["ZIP"],
                "phone"      => $row["PHONE1"],
                "bio"        => $row["BIO"],
                "imgPath"    => $row["PATH"],
            );
        }

        $response["user"] = $user;

    } catch (\PDOException $e) {
        $response["status"] = "error";
        $response["message"] = $e->getMEssage();
    }

    echo json_encode($response);
    exit;
}


/**
 * [classifiedAd_getTags description]
 *
 * @param [type] $adId [description]
 *
 * @return [type] [description]
 */
function classifiedAd_getTags($adId)
{
    $response = array(
        "status" => "ok",
        "message" => "Success"
    );

    try {
        $pdh = initPDO();

        //check if tag exists
        $stmt = $pdh->prepare(
            "SELECT
              TAG_PENDING.NAME
            FROM
                AD_TAG
            JOIN TAG_PENDING ON
              AD_TAG.TAG_ID = TAG_PENDING.ID
            WHERE
                AD_TAG.AD_ID=:adId
            "
        );

        $stmt->bindParam(":adId", $adId);
        $stmt->execute();
        $sqlResult = $stmt->fetchAll();
        $userTags = array();
        if ($sqlResult !== false &&  count($sqlResult) > 0) {
            foreach ($sqlResult as $r) {
                $userTags[] = $r["NAME"];
            }

            $response["tags"] = $userTags;
        }

    } catch (\PDOException $e) {
        $response["status"] = "ok";
        $response["message"] = $e->getMEssage();
    }

    echo json_encode($response);
    exit;
}


/**
 * [classifiedAd_getUserAds description]
 *
 * @return [type] [description]
 */
function classifiedAd_getAll()
{
    $response = array(
        "status" => "ok",
        "message" => "Success"
    );
    try {
        $pdh = initPDO();

        $stmt = $pdh->prepare(
            "SELECT
                AD.*, USER.USERNAME, IMAGE.PATH
            FROM
                AD
            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_ID = AD.ID
            LEFT JOIN IMAGE ON IMAGE.ID = AD_IMAGE.IMAGE_ID
            LEFT JOIN USER ON USER.ID = AD.USER_ID"
        );

        $stmt->bindParam(":user", $userId);
        $results = $stmt->execute();

        $row = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        if ($row == false) {
            $response["message"] = "Ads for this user do not exist";
            echo json_encode($response);
            exit;
        }

        $response["classifieds"] = array();
        foreach ($row as $r) {
            $serviceQuery = "SELECT * FROM SERVICE WHERE SERVICE.AD_ID = :adID";
            $productQuery = "SELECT * FROM PRODUCT WHERE PRODUCT.AD_ID = :adID";

            //Check service first
            $serviceStmt = $pdh->prepare($serviceQuery);
            $serviceStmt->bindParam(":adID", $r["ID"]);
            $serviceRow = $serviceStmt->execute();
            $serviceResp = $serviceStmt->fetch(\PDO::FETCH_ASSOC);

            if ($serviceResp !== false) {
                $serviceData = array("AD_TYPE" => "Service");
                $serviceData = array_merge($serviceData, $r);
                $serviceData = array_merge($serviceData, $serviceResp);

                $response["classifieds"][] = $serviceData;
                continue;
            }

            //Check product
            $productStmt = $pdh->prepare($productQuery);
            $productStmt->bindParam(":adID", $r["ID"]);
            $productRow = $productStmt->execute();
            $productResp = $productStmt->fetch(\PDO::FETCH_ASSOC);
            if ($productResp !== false) {
                $productData = array("AD_TYPE" => "Product");
                $productData = array_merge($productData, $r);
                $productData = array_merge($productData, $productResp);

                $response["classifieds"][] = $productData;
                continue;
            }
        }

    } catch (\PDOException $e) {
        $response["status"] = "ok";
        $response["message"] = $e->getMEssage();
    }

    echo json_encode($response);
    exit;
}

/**
 * [classifiedAd_getUserAds description]
 *
 * @return [type] [description]
 */
function classifiedAd_get($adId)
{
    $response = array(
        "status" => "ok",
        "message" => "Success"
    );
    try {
        $pdh = initPDO();

        $stmt = $pdh->prepare(
            "SELECT
                USER.USERNAME, AD.*, IMAGE.PATH
            FROM
                AD
            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_ID = AD.ID
            LEFT JOIN IMAGE ON IMAGE.ID = AD_IMAGE.IMAGE_ID
            LEFT JOIN USER ON USER.ID = AD.USER_ID
            WHERE
                AD.ID = :adId"
        );

        $stmt->bindParam(":adId", $adId);
        $results = $stmt->execute();

        $row = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        if ($row == false) {
            $response["message"] = "This ad does not exist";
            echo json_encode($response);
            exit;
        }

        $response["ad"] = array();
        foreach ($row as $r) {
            $serviceQuery = "SELECT * FROM SERVICE WHERE SERVICE.AD_ID = :adID";
            $productQuery = "SELECT * FROM PRODUCT WHERE PRODUCT.AD_ID = :adID";

            //Check service first
            $serviceStmt = $pdh->prepare($serviceQuery);
            $serviceStmt->bindParam(":adID", $adId);
            $serviceRow  = $serviceStmt->execute();
            $serviceResp = $serviceStmt->fetch(\PDO::FETCH_ASSOC);

            if ($serviceResp !== false) {
                $serviceData = array("AD_TYPE" => "Service");
                $serviceData = array_merge($serviceData, $r);
                $serviceData = array_merge($serviceData, $serviceResp);

                $response["ad"] = $serviceData;
                continue;
            }

            //Check product
            $productStmt = $pdh->prepare($productQuery);
            $productStmt->bindParam(":adID", $adId);
            $productRow = $productStmt->execute();
            $productResp = $productStmt->fetch(\PDO::FETCH_ASSOC);
            if ($productResp !== false) {
                $productData = array("AD_TYPE" => "Product");
                $productData = array_merge($productData, $r);
                $productData = array_merge($productData, $productResp);

                $response["ad"] = $productData;
                continue;
            }
        }

    } catch (\PDOException $e) {
        $response["status"] = "ok";
        $response["message"] = $e->getMEssage();
    }

    echo json_encode($response);
    exit;
}

/**
 * [classifiedAd_getUserAds description]
 *
 * @return [type] [description]
 */
function classifiedAd_getUserAds($userId)
{
    $response = array(
        "status" => "ok",
        "message" => "Success"
    );
    try {
        $pdh = initPDO();

        $stmt = $pdh->prepare(
            "SELECT
                AD.*, USER.USERNAME, IMAGE.PATH
            FROM
                AD
            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_ID = AD.ID
            LEFT JOIN IMAGE ON IMAGE.ID = AD_IMAGE.IMAGE_ID
            LEFT JOIN USER ON USER.ID = AD.USER_ID
            WHERE
                AD.USER_ID = :user"
        );

        $stmt->bindParam(":user", $userId);
        $results = $stmt->execute();

        $row = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        if ($row == false) {
            $response["message"] = "Ads for this user do not exist";
            echo json_encode($response);
            exit;
        }

        $response["classifieds"] = array();
        foreach ($row as $r) {
            $serviceQuery = "SELECT * FROM SERVICE WHERE SERVICE.AD_ID = :adID";
            $productQuery = "SELECT * FROM PRODUCT WHERE PRODUCT.AD_ID = :adID";

            //Check service first
            $serviceStmt = $pdh->prepare($serviceQuery);
            $serviceStmt->bindParam(":adID", $r["ID"]);
            $serviceRow = $serviceStmt->execute();
            $serviceResp = $serviceStmt->fetch(\PDO::FETCH_ASSOC);

            if ($serviceResp !== false) {
                $serviceData = array("AD_TYPE" => "Service");
                $serviceData = array_merge($serviceData, $r);
                $serviceData = array_merge($serviceData, $serviceResp);

                $response["classifieds"][] = $serviceData;
                continue;
            }

            //Check product
            $productStmt = $pdh->prepare($productQuery);
            $productStmt->bindParam(":adID", $r["ID"]);
            $productRow = $productStmt->execute();
            $productResp = $productStmt->fetch(\PDO::FETCH_ASSOC);
            if ($productResp !== false) {
                $productData = array("AD_TYPE" => "Product");
                $productData = array_merge($productData, $r);
                $productData = array_merge($productData, $productResp);

                $response["classifieds"][] = $productData;
                continue;
            }
        }

    } catch (\PDOException $e) {
        $response["status"] = "ok";
        $response["message"] = $e->getMEssage();
    }

    echo json_encode($response);
    exit;
}

/**
 * [classifiedAd_create description]
 *
 * @return [type] [description]
 */
function classifiedAd_create()
{
    $response = checkPut();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "postType"       => "",
        "title"          => "",
        "body"           => "",
        "creationDate"   => "",
        "expiration"     => "",
        "price"          => null,
        "quantity"       => null,
        "userId"         => null,
        "streetAddress1" => null,
        "streetAddress2" => null,
        "city"           => null,
        "state"          => null,
        "zip"            => null,
        "phone"          => null,
        "email"          => null,
        "tags"           => null
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdh = initPDO();

            $stmt = $pdh->prepare(
                "INSERT INTO
                  AD (TITLE, BODY, USER_ID, CREATED, EXPIRES,
                      ADDRESS1, ADDRESS2, CITY, STATE, ZIP,
                      PHONE, EMAIL )
                VALUES
                  (:title, :body, :userId, :created, :expires,
                   :address1, :address2, :city, :state, :zip,
                   :phone, :email)"
            );

            $stmt->bindParam(":title", $params["title"]);
            $stmt->bindParam(":body", $params["body"]);
            $stmt->bindParam(":userId", $params["userId"]);

            $stmt->bindParam(":created", $params["creationDate"]);
            $stmt->bindParam(":expires", $params["expiration"]);
            $stmt->bindParam(":address1", $params["streetAddress1"]);
            $stmt->bindParam(":address2", $params["streetAddress2"]);
            $stmt->bindParam(":city", $params["city"]);
            $stmt->bindParam(":state", $params["state"]);
            $stmt->bindParam(":zip", $params["zip"]);
            $stmt->bindParam(":phone", $params["phone"]);
            $stmt->bindParam(":email", $params["email"]);

            $stmt->execute();

            $newTagId = $pdh->lastInsertId();

            if (strcasecmp($params["postType"], "Product") === 0) {
                $stmt = $pdh->prepare(
                    "INSERT INTO
                        PRODUCT (AD_ID, QUANTITY, RATE)
                    VALUES
                        (:adId, :quantity, :price)"
                );

                $stmt->bindParam(":adId", $newTagId);
                $stmt->bindParam(":quantity", $params["quantity"]);
                $stmt->bindParam(":price", $params["price"]);
            } else {
                $stmt = $pdh->prepare(
                    "INSERT INTO
                        SERVICE (AD_ID, QUANTITY, RATE)
                    VALUES
                        (:adId, :quantity, :price)"
                );

                $stmt->bindParam(":adId", $newTagId);
                $stmt->bindParam(":quantity", $params["quantity"]);
                $stmt->bindParam(":price", $params["price"]);
            }

            $result = $stmt->execute();

            //Check if an image was set
            if (isset($suppliedParams["image"]["tempPath"])) {
                $file    = $suppliedParams["image"]["tempPath"];
                $dirTemp = md5(strtotime("now") . $newTagId . $file);
                $dir1    = substr($dirTemp, 0, 2);
                $dir2    = substr($dirTemp, 2, 2);

                $brokenFile = explode("_", $file);
                $filename   = str_replace($brokenFile[1], "{$newTagId}_{$brokenFile[1]}", str_replace("/media/temp/", "", $file));
                $imgBaseDir = "/home/sweng500/sweng500.saltosk.com/media/{$dir1}/{$dir2}/";
                $path       = "/media/{$dir1}/{$dir2}/{$filename}";

                if (!is_dir($imgBaseDir)) {
                    mkdir($imgBaseDir, 0755, true);
                }

                rename("/home/sweng500/sweng500.saltosk.com/{$file}", "{$imgBaseDir}/{$filename}");

                $query = "INSERT INTO IMAGE (PATH) VALUES(:path)";
                $imgStmt = $pdh->prepare($query);
                $imgStmt->bindParam(":path", $path);
                $imgStmt->execute();

                $imgID = $pdh->lastInsertId();
                $uImgQuery = "INSERT INTO AD_IMAGE (AD_ID, IMAGE_ID) VALUES(:adID, :imageID)";
                $uImgStmt = $pdh->prepare($uImgQuery);
                $uImgStmt->bindParam(":adID", $newTagId);
                $uImgStmt->bindParam(":imageID", $imgID);
                $uImgStmt->execute();
            }

            //Check if tags were set
            if (null !== $params["tags"] && is_array($params["tags"])) {
                //Get any tags that already exist
                $tagIDs = array();
                foreach ($params["tags"] as $tag) {
                    $tag = $tag["text"];
                    $tagStmt = $pdh->prepare("SELECT * FROM TAG_PENDING WHERE NAME LIKE :tag");
                    $tagStmt->bindParam(":tag", $tag);
                    $tagResult = $tagStmt->execute();
                    if (!$tagResult) {
                        $tagIDs[$tag] = "";
                        continue;
                    }

                    $tagRow = $tagStmt->fetch(\PDO::FETCH_ASSOC);
                    $tagIDs[$tag] = @$tagRow["ID"];

                    if ($tagIDs[$tag] == "") {
                        //Insert tag
                        $newTagStmt = $pdh->prepare("INSERT INTO TAG_PENDING (NAME) VALUES(:tag)");
                        $newTagStmt->bindParam(":tag", $tag);
                        $newTagStmt->execute();
                        $tagIDs[$tag] = @$pdh->lastInsertId();
                    }
                }

                $query = "INSERT INTO AD_TAG (AD_ID, TAG_ID) VALUES";
                $tagData = "";
                foreach ($tagIDs as $tag => $id) {
                    $tagData .= "(:adID, {$id}),";
                }
                $tagData = rtrim($tagData, ",");

                $tagStmt = $pdh->prepare($query . $tagData);
                $tagStmt->bindParam(":adID", $newTagId);
                $tagStmt->execute();
            }

        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }

    echo json_encode($response);
    exit;
}

/**
 * [user_acceptRequest description]
 *
 * @param [type] $friendUserID [description]
 *
 * @return [type] [description]
 */
function user_acceptRequest($friendUserID)
{
    $response = checkPut();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdi = initPDO();

            $stmtAddFriend = $pdi->prepare(
                "UPDATE
                    USER_CONNECTION
                SET STATUS = 1
                WHERE
                    SENDEE_USER_ID = :sendeeID
                AND
                    SENDER_USER_ID = :senderID
                "
            );

            $stmtAddFriend->bindParam(":senderID", $friendUserID);
            $stmtAddFriend->bindParam(":sendeeID", $params["userId"]);
            $stmtAddFriend->execute();

        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }
    echo json_encode($response);
    exit;
}

/**
 * [user_rejectRequest description]
 *
 * @param [type] $friendUserID [description]
 *
 * @return [type] [description]
 */
function user_rejectRequest($friendUserID)
{
    $response = checkPut();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdi = initPDO();

            $stmtRejectFriend = $pdi->prepare(
                "UPDATE
                    USER_CONNECTION
                SET STATUS = 2
                WHERE
                    SENDEE_USER_ID = :sendeeID
                AND
                    SENDER_USER_ID = :senderID
                "
            );

            $stmtRejectFriend->bindParam(":senderID", $friendUserID);
            $stmtRejectFriend->bindParam(":sendeeID", $params["userId"]);
            $stmtRejectFriend->execute();

        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }
    echo json_encode($response);
    exit;
}

/**
 * [user_addFriend description]
 *
 * @return [type] [description]
 */
function user_addFriend($friendUserID)
{
    $response = checkPut();

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    $requiredParams = array(
        "userId" => ""
    );

    $suppliedParams = @json_decode(file_get_contents("php://input"), true);
    if (!checkAPIKey($suppliedParams)) {
        $response["status"]  = "error";
        $response["message"] = "Invalid something";
    } else {
        $params = checkParams($requiredParams, $suppliedParams);

        if (false === $params) {
            $response["status"] = "error";
            $response["message"] = "invalid params";
        }
    }

    if ($response["status"] !== "error") {
        try {
            $pdi = initPDO();

            //get tag id
            //INSERT INTO `USER_CONNECTION_PENDING` (`ID`, `SENDEE_USER_ID`, `SENDER_USER_ID`) VALUES ('', '26', '24');
            $stmtAddFriend = $pdi->prepare(
                "INSERT INTO USER_CONNECTION (SENDEE_USER_ID, SENDER_USER_ID,STATUS) VALUES(:sendeeID,:senderID,'0')"
            );

            $stmtAddFriend->bindParam(":sendeeID", $friendUserID);
            $stmtAddFriend->bindParam(":senderID", $params["userId"]);
            $stmtAddFriend->execute();

        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }
    echo json_encode($response);
    exit;
}
/**
 * [photo_upload description]
 *
 * @return [type] [description]
 */
function user_photo_upload()
{
    $response = checkPost();

    if (!isset($_POST["userID"])) {
        $response["status"] = "error";
        $response["message"] = "Invalid POST";
    }

    if (!isset($_FILES["file"])) {
        $response["status"] = "error";
        $response["message"] = "Invalid POST";
    }

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    if ("error" !== $response["status"]) {
        //Insert into DB
        $dbUser = "root";
        $dbPass = "barbbarb";
        $dbHost = "sweng500db.cbxye1hmuzfy.us-west-2.rds.amazonaws.com";
        $dbPort = "3306";
        $dbDb   = "social_classifieds";

        try {
            $pdh = initPDO();

            // //set some stuff
            $dirTemp = md5(strtotime("now") . $userID . $filename);
            $dir1 = substr($dirTemp, 0, 2);
            $dir2 = substr($dirTemp, 2, 2);

            $userID     = $_POST["userID"];
            $filename   = $userID . "_" . $_FILES["file"]["name"];
            $imgBaseDir = "/home/sweng500/sweng500.saltosk.com/media/{$dir1}/{$dir2}/";
            $path       = "/media/{$dir1}/{$dir2}/{$filename}";
            $remoteDir  = "https://sweng500.saltosk.com/media/{$dir1}/{$dir2}";

            if (!is_dir($imgBaseDir)) {
                mkdir($imgBaseDir, 0755, true);
            }

            move_uploaded_file($_FILES["file"]["tmp_name"], "{$imgBaseDir}/{$filename}");

            $query = "INSERT INTO IMAGE (PATH) VALUES(:path)";
            $imgStmt = $pdh->prepare($query);
            $imgStmt->bindParam(":path", $path);
            $imgStmt->execute();

            $imgID = $pdh->lastInsertId();
            $uImgQuery = "INSERT INTO USER_IMAGE (USER_ID, IMAGE_ID) VALUES(:userID, :imageID)";
            $uImgStmt = $pdh->prepare($uImgQuery);
            $uImgStmt->bindParam(":userID", $userID);
            $uImgStmt->bindParam(":imageID", $imgID);
            $uImgStmt->execute();

            $response["link"] = "{$remoteDir}/{$filename}";
        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }

    echo json_encode($response);
    exit;
}

/**
 * [temp_photo_upload description]
 *
 * @return [type] [description]
 */
function temp_photo_upload()
{
    $response = checkPost();

    if (!isset($_POST["userID"])) {
        $response["status"] = "error";
        $response["message"] = "Invalid POST";
    }

    if (!isset($_FILES["file"])) {
        $response["status"] = "error";
        $response["message"] = "Invalid POST";
    }

    if ("error" === $response["status"]) {
        echo json_encode($response);
        exit;
    }

    if ("error" !== $response["status"]) {
        //Insert into DB
        // $dbUser = "root";
        // $dbPass = "barbbarb";
        // $dbHost = "sweng500db.cbxye1hmuzfy.us-west-2.rds.amazonaws.com";
        // $dbPort = "3306";
        // $dbDb   = "social_classifieds";

        try {
            $tmp = "{$_POST["userID"]}_{$_FILES["file"]["name"]}";
            $tmp = explode("/", $tmp);
            $tmp = $tmp[count($tmp) - 1];
            $tmpDir = "/home/sweng500/sweng500.saltosk.com/media/temp/";
            move_uploaded_file($_FILES["file"]["tmp_name"], "{$tmpDir}/{$tmp}");

            $response["link"] = "/media/temp/{$tmp}";
        } catch (\PDOException $e) {
            $response["status"] = "ok";
            $response["message"] = $e->getMEssage();
        }
    }

    echo json_encode($response);
    exit;
}

/**
 * [fun_calcDistance description]
 *
 * @param [type] $zip1 [description]
 * @param [type] $zip2 [description]
 *
 * @return [type] [description]
 */
function fun_calcDistance($zip1, $zip2)
{
    $geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address=<ZIP>&sensor=false&‌components=country:US";
    //Get location for zip1
    $zip1Url  = str_replace("<ZIP>", $zip1, $geocodeURL);
    $zip1Data = json_decode(file_get_contents($zip1Url), true);
    $zip1Geo  = @$zip1Data["results"][0]["geometry"]["location"];
    //Zip2
    $zip2Url  = str_replace("<ZIP>", $zip2, $geocodeURL);
    $zip2Data = json_decode(file_get_contents($zip2Url), true);
    $zip2Geo  = @$zip2Data["results"][0]["geometry"]["location"];

    //Calc distance using Haversine formula
    $lat1         = $zip1Geo["lat"];
    $lon1         = $zip1Geo["lng"];
    $lat2         = $zip2Geo["lat"];
    $lon2         = $zip2Geo["lng"];
    $earthRad     = 3959;
    $lat1         = deg2rad($lat1);
    $lat2         = deg2rad($lat2);
    $lon1         = deg2rad($lon1);
    $lon2         = deg2rad($lon2);
    $deltaLat     = $lat2 - $lat1;
    $deltaLon     = $lon2 - $lon1;
    $angle        = 2 * asin(sqrt(pow(sin($deltaLat / 2), 2) + cos($lat1) * cos($lat2) * pow(sin($deltaLon / 2), 2)));
    $distance     = $earthRad * $angle;
    $distance     = round($distance, -1);

    echo json_encode(array("status" => "ok", "distance" => $distance));
    exit;
}

/**
 * [checkPost description]
 *
 * @return [type] [description]
 */
function checkPost()
{
    $jsonPost = "";
    $response = array("status" => "ok", "message" => "success");
    if ($_SERVER['REQUEST_METHOD'] === "POST") {
        return $response;
    } else {
        $response['status'] = "error";
        $response['message'] = "Not a valid POST";
    }

    return $response;
}

/**
 * [checkDelete description]
 *
 * @return [type] [description]
 */
function checkDelete()
{
    $jsonPost = "";
    $response = array("status" => "ok", "message" => "success");
    if ($_SERVER['REQUEST_METHOD'] === "DELETE") {
        return $response;
    } else {
        $response['status'] = "error";
        $response['message'] = "Not a valid DELETE";
    }

    return $response;
}
/**
 * [checkPut description]
 *
 * @return [type] [description]
 */
function checkPut()
{
    $jsonPost = "";
    $response = array("status" => "ok", "message" => "success");
    if ($_SERVER['REQUEST_METHOD'] === "PUT") {
        $jsonPost = @json_decode(file_get_contents("php://input"), true);
    } else {
        $response['status'] = "error";
        $response['message'] = "Not a valid POST";
    }

    if (null == $jsonPost || "" == $jsonPost) {
        $response['status']  = "error";
        $response['message'] = "Not a valid input";
    }

    return $response;
}

/**
 * Checks to see if the API Key is valid
 *
 * @param array $suppliedParams The supplied parameters
 *
 * @return bool True or false
 */
function checkAPIKey($suppliedParams)
{
    return true;
    // //Find api key
    // $apiKey = @$suppliedParams["api_key"];

    // if (API_KEY === $apiKey) {
    //     return true;
    // }

    // return false;
}

/**
 * Checks the parameters
 *
 * @param [type] $required [description]
 * @param [type] $supplied [description]
 *
 * @return [type] [description]
 */
function checkParams($required, $supplied)
{
    $params = array();
    $failed = false;
    foreach ($required as $key => $value) {
        if (!isset($supplied[$key]) && $value !== null) {
            $failed = true;
            break;
        }

        $params[$key] = @$supplied[$key];

        if ("" === $params[$key] && "" === $required[$key]) {
            $failed = true;
            $break;
        }
    }

    if ($failed) {
        return false;
    }

    return $params;
}

/**
 * [initPDO description]
 *
 * @return [type] [description]
 */
function initPDO()
{
    $dbHost = DB_HOST;
    $dbPort = 3306;
    $dbDb   = DB_NAME;
    $dbUser = DB_USER;
    $dbPass = DB_PASS;

    $pdh = new \PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbDb}", $dbUser, $dbPass);
    $pdh->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_WARNING);
    return $pdh;
}

/**
 * [calcDistance description]
 *
 * @param [type] $friendRows [description]
 * @param [type] $myZip      [description]
 *
 * @return [type] [description]
 */
function calcDistance($friendRows, $myZip)
{
    $geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address=<ZIP>&sensor=false&‌components=country:US";
    $myGeoURL   = str_replace("<ZIP>", $myZip, $geocodeURL);
    $myGeoData  = json_decode(file_get_contents($myGeoURL), true);
    $myLocation = @$myGeoData["results"][0]["geometry"]["location"];

    foreach ($friendRows as $index => $friend) {
        $zip         = $friend["ZIP"];
        $url         = str_replace("<ZIP>", $zip, $geocodeURL);
        $geocodeData = @json_decode(file_get_contents($url), true);
        $location    = $geocodeData["results"][0]["geometry"]["location"];

        //Calc distance using Haversine formula
        $lat1         = $myLocation["lat"];
        $lon1         = $myLocation["lng"];
        $lat2         = $location["lat"];
        $lon2         = $location["lng"];
        $earthRad     = 3959;
        $lat1         = deg2rad($lat1);
        $lat2         = deg2rad($lat2);
        $lon1         = deg2rad($lon1);
        $lon2         = deg2rad($lon2);
        $deltaLat     = $lat2 - $lat1;
        $deltaLon     = $lon2 - $lon1;
        $angle        = 2 * asin(sqrt(pow(sin($deltaLat / 2), 2) + cos($lat1) * cos($lat2) * pow(sin($deltaLon / 2), 2)));
        $distance     = $earthRad * $angle;
        $distance     = round($distance, -1);

        $friendRows[$index]["distance"] = "~ {$distance} miles";
    }

    return $friendRows;
}

//Run it!
$app->run();
