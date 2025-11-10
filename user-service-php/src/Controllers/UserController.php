<?php

namespace UserService\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use UserService\Services\UserService;
use UserService\Models\Role;
use RuntimeException;
use InvalidArgumentException;
use Throwable;

class UserController
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function getAllUsers(Request $request, Response $response): Response
    {
        try {
            $users = $this->userService->getAllUsers();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $users,
                'count' => count($users)
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getUserById(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int) $args['id'];
            $user = $this->userService->getUserById($id);
            
            if (!$user) {
                return $this->errorResponse($response, 'User not found', 404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $user
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getUserByUsername(Request $request, Response $response, array $args): Response
    {
        try {
            $username = $args['username'];
            $user = $this->userService->getUserByUsername($username);
            
            if (!$user) {
                return $this->errorResponse($response, 'User not found', 404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $user
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getUsersByRole(Request $request, Response $response, array $args): Response
    {
        try {
            $role = Role::fromString($args['role']);
            $users = $this->userService->getUsersByRole($role);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $users,
                'count' => count($users),
                'role' => $role->value
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($response, 'Invalid role: ' . $args['role'], 400);
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getActiveUsers(Request $request, Response $response): Response
    {
        try {
            $users = $this->userService->getActiveUsers();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $users,
                'count' => count($users)
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function searchUsers(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $name = $queryParams['name'] ?? '';
            
            if (empty($name)) {
                return $this->errorResponse($response, 'Name parameter is required', 400);
            }
            
            $users = $this->userService->searchUsersByName($name);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $users,
                'count' => count($users),
                'searchTerm' => $name
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function createUser(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            if (!$data) {
                return $this->errorResponse($response, 'Invalid JSON data', 400);
            }
            
            $user = $this->userService->createUser($data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(201);
                
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($response, $e->getMessage(), 400);
        } catch (RuntimeException $e) {
            return $this->errorResponse($response, $e->getMessage(), 409);
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function updateUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int) $args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            if (!$data) {
                return $this->errorResponse($response, 'Invalid JSON data', 400);
            }
            
            $user = $this->userService->updateUser($id, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($response, $e->getMessage(), 400);
        } catch (RuntimeException $e) {
            return $this->errorResponse($response, $e->getMessage(), 404);
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function deleteUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int) $args['id'];
            $deleted = $this->userService->deleteUser($id);
            
            if (!$deleted) {
                return $this->errorResponse($response, 'Failed to delete user', 500);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (RuntimeException $e) {
            return $this->errorResponse($response, $e->getMessage(), 404);
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function activateUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int) $args['id'];
            $user = $this->userService->activateUser($id);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'User activated successfully',
                'data' => $user
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (RuntimeException $e) {
            return $this->errorResponse($response, $e->getMessage(), 404);
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function deactivateUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int) $args['id'];
            $user = $this->userService->deactivateUser($id);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'User deactivated successfully',
                'data' => $user
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (RuntimeException $e) {
            return $this->errorResponse($response, $e->getMessage(), 404);
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function countUsersByRole(Request $request, Response $response, array $args): Response
    {
        try {
            $role = Role::fromString($args['role']);
            $count = $this->userService->countActiveUsersByRole($role);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => [
                    'role' => $role->value,
                    'count' => $count
                ]
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($response, 'Invalid role: ' . $args['role'], 400);
        } catch (Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    private function errorResponse(Response $response, string $message, int $statusCode): Response
    {
        $response->getBody()->write(json_encode([
            'success' => false,
            'error' => $message
        ]));
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }
}
