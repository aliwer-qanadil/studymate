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

// Limits how many login-code emails can be sent:
// - per address: stops one network from sending codes to many student IDs
// - per student ID: stops anyone from flooding one student's inbox. The address can be faked with an
//   X-Forwarded-For header, the student ID can't, so this limit always holds.
// Each student ID also has its own one-minute wait (AuthService).
// Kept in memory, so it resets when the server restarts. That is enough for one server.
@Component
public class SendCodeRateLimiter {

    static final int MAX_CODES = 10;
    static final Duration WINDOW = Duration.ofMinutes(15);

    static final int MAX_CODES_PER_STUDENT = 10;
    static final Duration STUDENT_WINDOW = Duration.ofDays(1);

    private final Map<String, Deque<Instant>> sentByAddress = new ConcurrentHashMap<>();
    private final Map<String, Deque<Instant>> sentByStudent = new ConcurrentHashMap<>();

    public void check(String address, String studentId) {
        Instant now = Instant.now();
        // The student limit is checked first, so a refused student doesn't use up the address's quota
        if (!allowed(sentByStudent, studentId, MAX_CODES_PER_STUDENT, STUDENT_WINDOW, now)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many login codes for this student ID today. Try again tomorrow.");
        }
        if (!allowed(sentByAddress, address, MAX_CODES, WINDOW, now)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many login codes from this network. Try again in 15 minutes.");
        }
    }

    // Counts this send if the key is still under its limit
    private boolean allowed(Map<String, Deque<Instant>> sentByKey, String key, int max, Duration window, Instant now) {
        Deque<Instant> sent = sentByKey.computeIfAbsent(key, k -> new ArrayDeque<>());

        boolean ok;
        synchronized (sent) {
            while (!sent.isEmpty() && sent.peekFirst().isBefore(now.minus(window))) {
                sent.pollFirst();
            }
            ok = sent.size() < max;
            if (ok) {
                sent.addLast(now);
            }
        }

        // Forget keys that have been quiet for a while, so the map doesn't grow forever
        if (sentByKey.size() > 10_000) {
            sentByKey.entrySet().removeIf(entry -> {
                synchronized (entry.getValue()) {
                    return entry.getValue().isEmpty() || entry.getValue().peekLast().isBefore(now.minus(window));
                }
            });
        }
        return ok;
    }
}
