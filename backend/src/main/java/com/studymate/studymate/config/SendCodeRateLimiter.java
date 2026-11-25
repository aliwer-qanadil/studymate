package com.studymate.studymate.config;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Stops one address from sending login-code emails to many student IDs.
// Each student ID already has its own one-minute wait (AuthService); this limits the total per address.
// Kept in memory, so it resets when the server restarts. That is enough for one server.
@Component
public class SendCodeRateLimiter {

    static final int MAX_CODES = 10;
    static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, Deque<Instant>> sentByAddress = new ConcurrentHashMap<>();

    public void check(String address) {
        Instant now = Instant.now();
        Deque<Instant> sent = sentByAddress.computeIfAbsent(address, key -> new ArrayDeque<>());

        synchronized (sent) {
            while (!sent.isEmpty() && sent.peekFirst().isBefore(now.minus(WINDOW))) {
                sent.pollFirst();
            }
            if (sent.size() >= MAX_CODES) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Too many login codes from this network. Try again in 15 minutes.");
            }
            sent.addLast(now);
        }

        // Forget addresses that have been quiet for a while, so the map doesn't grow forever
        if (sentByAddress.size() > 10_000) {
            sentByAddress.entrySet().removeIf(entry -> {
                synchronized (entry.getValue()) {
                    return entry.getValue().isEmpty() || entry.getValue().peekLast().isBefore(now.minus(WINDOW));
                }
            });
        }
    }
}
