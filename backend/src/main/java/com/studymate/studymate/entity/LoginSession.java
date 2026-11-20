package com.studymate.studymate.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

// A signed-in browser. The browser keeps a random token; we keep only its hash,
// so someone who reads the database still can't use the tokens.
@Entity
@Table(name = "login_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoginSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SHA-256 of the token, as 64 hex characters
    @Column(unique = true, nullable = false, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Instant expiresAt;

    public LoginSession(String tokenHash, Long userId, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.userId = userId;
        this.expiresAt = expiresAt;
    }
}
