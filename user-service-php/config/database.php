<?php

use Doctrine\DBAL\DriverManager;
use Doctrine\DBAL\Configuration;

return function () {
    $config = new Configuration();
    
    $connectionParams = [
        'dbname' => $_ENV['DB_NAME'],
        'user' => $_ENV['DB_USER'],
        'password' => $_ENV['DB_PASSWORD'],
        'host' => $_ENV['DB_HOST'],
        'port' => $_ENV['DB_PORT'],
        'driver' => $_ENV['DB_DRIVER'],
    ];

    return DriverManager::getConnection($connectionParams, $config);
};
