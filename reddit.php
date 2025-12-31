<?php
// Basit Reddit JSON proxy
header('Content-Type: application/json; charset=utf-8');

$sub = $_GET['sub'] ?? null;
$sort = $_GET['sort'] ?? 'hot';
$limit = $_GET['limit'] ?? 50;

if (!$sub) {
    http_response_code(400);
    echo json_encode(['error'=>'sub gerekli']);
    exit;
}

$url = "https://www.reddit.com/r/" . urlencode($sub) . "/$sort.json?limit=" . intval($limit);

// Reddit'e User-Agent ile istekte bulun
$options = [
    "http" => [
        "header" => "User-Agent: Ranmem v0.1 by /u/yasirovic\r\n"
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response === FALSE) {
    http_response_code(500);
    echo json_encode(['error'=>'reddit_fetch_error']);
    exit;
}

echo $response;
