package com.studymate.studymate.dto.auth;

// Sent back after a correct login code. The browser keeps the token and sends it
// as "Authorization: Bearer <token>" with every request for this user.
public record LoginResponse(Long id, String name, String token) {
}
