package com.studymate.studymate.service;

import com.studymate.studymate.entity.LoginSession;
import com.studymate.studymate.repository.LoginSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

// Creates, checks and ends login sessions. The token is what the browser sends
// in the "Authorization: Bearer <token>" header to prove who it is.
@Service
public class SessionService {

    private static final Duration VALID_FOR = Duration.ofDays(30);

    private final LoginSessionRepository sessionRepository;
    private final SecureRandom random = new SecureRandom();

    public SessionService(LoginSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    // Starts a session for the user and returns the token (shown only this once)
    @Transactional
    public String start(Long userId) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        sessionRepository.save(new LoginSession(hash(token), userId, Instant.now().plus(VALID_FOR)));
        return token;
    }

    // The user behind a token, or empty if the token is unknown or expired
    @Transactional
    public Optional<Long> findUserId(String token) {
        Optional<LoginSession> found = sessionRepository.findByTokenHash(hash(token));
        if (found.isEmpty()) {
            return Optional.empty();
        }

        LoginSession session = found.get();
        if (session.getExpiresAt().isBefore(Instant.now())) {
            sessionRepository.delete(session);
            return Optional.empty();
        }
        return Optional.of(session.getUserId());
    }

    // Logout: the token stops working
    @Transactional
    public void end(String token) {
        sessionRepository.findByTokenHash(hash(token)).ifPresent(sessionRepository::delete);
    }

    // Tokens are 32 random bytes, so a plain SHA-256 is enough (no bcrypt needed) and lets us look them up
    private String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is missing from this Java runtime", e);
        }
    }
}
