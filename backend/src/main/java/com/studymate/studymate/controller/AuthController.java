package com.studymate.studymate.controller;

import com.studymate.studymate.config.AuthInterceptor;
import com.studymate.studymate.config.SendCodeRateLimiter;
import com.studymate.studymate.dto.auth.LoginResponse;
import com.studymate.studymate.dto.auth.SendCodeRequest;
import com.studymate.studymate.dto.auth.VerifyCodeRequest;
import com.studymate.studymate.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SendCodeRateLimiter rateLimiter;

    public AuthController(AuthService authService, SendCodeRateLimiter rateLimiter) {
        this.authService = authService;
        this.rateLimiter = rateLimiter;
    }

    // Emails a one-time code to the student's SDU address.
    // getRemoteAddr() is the visitor's address: the app trusts X-Forwarded-For from the proxy.
    @PostMapping("/send-code")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendCode(@Valid @RequestBody SendCodeRequest request, HttpServletRequest httpRequest) {
        rateLimiter.check(httpRequest.getRemoteAddr(), request.studentId());
        authService.sendCode(request);
    }

    // Logs in with that code and returns the session token
    @PostMapping("/verify-code")
    public LoginResponse verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        return authService.verifyCode(request);
    }

    // Ends the session of the token in the Authorization header (if any)
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        String token = AuthInterceptor.tokenFrom(request);
        if (token != null) {
            authService.logout(token);
        }
    }
}
