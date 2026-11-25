package com.studymate.studymate;

import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.UserRepository;
import com.studymate.studymate.service.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Checks that /api/users/{userId}/... only works with that user's session token (issue #6)
@SpringBootTest
class AuthInterceptorTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionService sessionService;

    private MockMvc mvc;
    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
        alice = newUser();
        bob = newUser();
    }

    @Test
    void withoutTokenUserEndpointsAnswer401() throws Exception {
        mvc.perform(get("/api/users/{id}/profile", alice.getId()))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/{id}/profile", alice.getId()).header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/users/{id}/requests/{requestId}/accept", alice.getId(), 1))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ownTokenWorks() throws Exception {
        String token = sessionService.start(alice.getId());

        mvc.perform(get("/api/users/{id}/profile", alice.getId()).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void someoneElsesUserIdAnswers403() throws Exception {
        String bobsToken = sessionService.start(bob.getId());

        mvc.perform(get("/api/users/{id}/profile", alice.getId()).header("Authorization", "Bearer " + bobsToken))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/users/{id}/groups", alice.getId()).header("Authorization", "Bearer " + bobsToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void logoutEndsTheSession() throws Exception {
        String token = sessionService.start(alice.getId());

        mvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/users/{id}/profile", alice.getId()).header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void browsingGroupsStaysPublic() throws Exception {
        mvc.perform(get("/api/groups"))
                .andExpect(status().isOk());
    }

    // Unique student IDs so the test can run against a database that already has data
    private User newUser() {
        String studentId = String.valueOf(100_000_000 + Math.floorMod(UUID.randomUUID().hashCode(), 900_000_000));
        return userRepository.save(new User("test-" + studentId, studentId + "@sdu.edu.kz"));
    }
}
