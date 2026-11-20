package com.studymate.studymate.controller;

import com.studymate.studymate.config.AuthInterceptor;
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
@CrossOrigin(originPatterns = {"http://localhost:5173", "https://*.trycloudflare.com"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Emails a one-time code to the student's SDU address
    @PostMapping("/send-code")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendCode(@Valid @RequestBody SendCodeRequest request) {
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
