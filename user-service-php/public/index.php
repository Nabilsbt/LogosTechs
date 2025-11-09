<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Middleware\ErrorMiddleware;
use Dotenv\Dotenv;
use UserService\Controllers\UserController;
use UserService\Services\UserService;
use UserService\Repositories\UserRepository;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Create Slim app
$app = AppFactory::create();

// Add error middleware
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// CORS Middleware
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', $_ENV['CORS_ORIGINS'])
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// Handle preflight requests
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Database connection
$dbConfig = require __DIR__ . '/../config/database.php';
$connection = $dbConfig();

// Dependencies
$userRepository = new UserRepository($connection);
$userService = new UserService($userRepository);
$userController = new UserController($userService);

// Routes
$app->group('/api/users', function ($group) use ($userController) {
    
    // GET routes
    $group->get('', [$userController, 'getAllUsers']);
    $group->get('/active', [$userController, 'getActiveUsers']);
    $group->get('/search', [$userController, 'searchUsers']);
    $group->get('/{id:[0-9]+}', [$userController, 'getUserById']);
    $group->get('/username/{username}', [$userController, 'getUserByUsername']);
    $group->get('/role/{role}', [$userController, 'getUsersByRole']);
    $group->get('/count/role/{role}', [$userController, 'countUsersByRole']);
    
    // POST routes
    $group->post('', [$userController, 'createUser']);
    
    // PUT routes
    $group->put('/{id:[0-9]+}', [$userController, 'updateUser']);
    $group->put('/{id:[0-9]+}/activate', [$userController, 'activateUser']);
    $group->put('/{id:[0-9]+}/deactivate', [$userController, 'deactivateUser']);
    
    // DELETE routes
    $group->delete('/{id:[0-9]+}', [$userController, 'deleteUser']);
});

// Health check endpoint
$app->get('/health', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'status' => 'healthy',
        'service' => 'user-service-php',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0'
    ]));
    
    return $response->withHeader('Content-Type', 'application/json');
});

// Root endpoint
$app->get('/', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'message' => 'User Service API - LogosTech Hospital Management',
        'version' => '1.0.0',
        'endpoints' => [
            'GET /api/users' => 'Get all users',
            'GET /api/users/{id}' => 'Get user by ID',
            'GET /api/users/username/{username}' => 'Get user by username',
            'GET /api/users/role/{role}' => 'Get users by role',
            'GET /api/users/active' => 'Get active users',
            'GET /api/users/search?name={name}' => 'Search users by name',
            'POST /api/users' => 'Create new user',
            'PUT /api/users/{id}' => 'Update user',
            'DELETE /api/users/{id}' => 'Delete user',
            'PUT /api/users/{id}/activate' => 'Activate user',
            'PUT /api/users/{id}/deactivate' => 'Deactivate user',
            'GET /health' => 'Health check'
        ]
    ]));
    
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();
