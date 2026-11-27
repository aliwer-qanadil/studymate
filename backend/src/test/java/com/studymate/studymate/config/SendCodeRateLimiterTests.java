package com.studymate.studymate.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SendCodeRateLimiterTests {

    @Test
    void allowsTenCodesPerAddressThenRefuses() {
        SendCodeRateLimiter limiter = new SendCodeRateLimiter();
        for (int i = 0; i < SendCodeRateLimiter.MAX_CODES; i++) {
            limiter.check("10.0.0.1", "25011800" + i);
        }
        assertThrows(ResponseStatusException.class, () -> limiter.check("10.0.0.1", "250118099"));
        assertDoesNotThrow(() -> limiter.check("10.0.0.2", "250118099"));
    }

    // A faked X-Forwarded-For gives a new address on every call, but the student ID stays the same
    @Test
    void limitsOneStudentIdEvenFromChangingAddresses() {
        SendCodeRateLimiter limiter = new SendCodeRateLimiter();
        for (int i = 0; i < SendCodeRateLimiter.MAX_CODES_PER_STUDENT; i++) {
            limiter.check("10.0.1." + i, "250118021");
        }
        assertThrows(ResponseStatusException.class, () -> limiter.check("10.0.2.1", "250118021"));
        assertDoesNotThrow(() -> limiter.check("10.0.2.1", "250118022"));
    }
}
