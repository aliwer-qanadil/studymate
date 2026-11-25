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
            limiter.check("10.0.0.1");
        }
        assertThrows(ResponseStatusException.class, () -> limiter.check("10.0.0.1"));
        assertDoesNotThrow(() -> limiter.check("10.0.0.2"));
    }
}
