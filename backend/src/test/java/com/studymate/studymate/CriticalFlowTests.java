package com.studymate.studymate;

import com.jayway.jsonpath.JsonPath;
import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.UserRepository;
import com.studymate.studymate.service.LoginCodeMailer;
import com.studymate.studymate.service.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// The three most important flows, through the real HTTP endpoints and a real database:
// 1. sign in with an emailed code (US-01, US-02)
// 2. apply to a group and get a compatibility score (US-10, US-11, US-17)
// 3. the organizer accepts or rejects, and only once (US-13, US-14, US-15)
@SpringBootTest
class CriticalFlowTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // No real email in tests: we catch the code the server would have sent
    @MockitoBean
    private LoginCodeMailer mailer;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    // ---------- 1. Sign in ----------

    @Test
    void signInWithTheEmailedCodeCreatesTheAccountAndAToken() throws Exception {
        String studentId = newStudentId();

        mvc.perform(post("/api/auth/send-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":\"" + studentId + "\"}"))
                .andExpect(status().isNoContent());

        ArgumentCaptor<String> code = ArgumentCaptor.forClass(String.class);
        verify(mailer).send(eq(studentId + "@sdu.edu.kz"), code.capture(), anyInt());

        String body = mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":\"" + studentId + "\",\"code\":\"" + code.getValue() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(studentId))
                .andReturn().getResponse().getContentAsString();

        // The token works for this user's own data
        Integer id = JsonPath.read(body, "$.id");
        String token = JsonPath.read(body, "$.token");
        mvc.perform(get("/api/users/{id}/profile", id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(studentId + "@sdu.edu.kz"));

        // The code can't be used a second time
        mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":\"" + studentId + "\",\"code\":\"" + code.getValue() + "\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void wrongCodeAndWrongFormatAreRefused() throws Exception {
        String studentId = newStudentId();
        mvc.perform(post("/api/auth/send-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":\"" + studentId + "\"}"))
                .andExpect(status().isNoContent());

        ArgumentCaptor<String> code = ArgumentCaptor.forClass(String.class);
        verify(mailer).send(eq(studentId + "@sdu.edu.kz"), code.capture(), anyInt());
        String wrong = code.getValue().equals("000000") ? "111111" : "000000";

        mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":\"" + studentId + "\",\"code\":\"" + wrong + "\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Wrong code. Check your email and try again."));

        mvc.perform(post("/api/auth/send-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":\"12345678\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.studentId").value("must be a 9-digit student ID"));
    }

    // ---------- 2. Apply ----------

    @Test
    void applyingSavesOnePendingRequestWithTheScore() throws Exception {
        User organizer = newUser();
        User applicant = newUser();
        long groupId = createGroup(organizer);

        // Same subject and time, two levels apart, no shared preferences: 40 + 30 + 0 + 0 = 70 (SRS US-17)
        mvc.perform(post("/api/users/{id}/groups/{groupId}/requests", applicant.getId(), groupId)
                        .header("Authorization", bearer(applicant))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answers("ADVANCED", "[]")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.score").value(70))
                .andExpect(jsonPath("$.breakdown.subject").value(100))
                .andExpect(jsonPath("$.breakdown.time").value(100))
                .andExpect(jsonPath("$.breakdown.level").value(0))
                .andExpect(jsonPath("$.breakdown.preferences").value(0));

        // A second application to the same group is refused
        mvc.perform(post("/api/users/{id}/groups/{groupId}/requests", applicant.getId(), groupId)
                        .header("Authorization", bearer(applicant))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answers("ADVANCED", "[]")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("You have already applied to this study group"));
    }

    @Test
    void theDatabaseRefusesASecondActiveRequestForTheSameGroup() throws Exception {
        User organizer = newUser();
        User applicant = newUser();
        long groupId = createGroup(organizer);
        apply(applicant, groupId);

        // Skips the service check, as a second request arriving at the same instant would
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                "INSERT INTO join_requests (group_id, applicant_id, course_code, level, available_from, available_to, "
                        + "score, subject_score, time_score, level_score, preference_score, status, created_at) "
                        + "VALUES (?, ?, 'MATH 161', 'BEGINNER', '15:00', '19:00', 100, 100, 100, 100, 100, 'PENDING', now())",
                groupId, applicant.getId()));
    }

    @Test
    void emptyAnswersAndOwnGroupAreRefused() throws Exception {
        User organizer = newUser();
        long groupId = createGroup(organizer);
        User applicant = newUser();

        mvc.perform(post("/api/users/{id}/groups/{groupId}/requests", applicant.getId(), groupId)
                        .header("Authorization", bearer(applicant))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseCode\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.courseCode").exists())
                .andExpect(jsonPath("$.errors.level").exists())
                .andExpect(jsonPath("$.errors.availableFrom").exists());

        mvc.perform(post("/api/users/{id}/groups/{groupId}/requests", organizer.getId(), groupId)
                        .header("Authorization", bearer(organizer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answers("BEGINNER", "[]")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("You cannot apply to your own study group"));
    }

    // ---------- 3. Organizer decision ----------

    @Test
    void organizerAcceptsOnceAndOthersCannotSeeOrDecide() throws Exception {
        User organizer = newUser();
        User applicant = newUser();
        User stranger = newUser();
        long groupId = createGroup(organizer);
        long requestId = apply(applicant, groupId);

        // Someone else can't see the applicants (US-13) or decide for the organizer
        mvc.perform(get("/api/users/{id}/groups/{groupId}/requests", stranger.getId(), groupId)
                        .header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/users/{id}/requests/{requestId}/accept", organizer.getId(), requestId)
                        .header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());

        mvc.perform(get("/api/users/{id}/groups/{groupId}/requests", organizer.getId(), groupId)
                        .header("Authorization", bearer(organizer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].applicant.id").value(applicant.getId()))
                .andExpect(jsonPath("$[0].score").value(100));

        mvc.perform(patch("/api/users/{id}/requests/{requestId}/accept", organizer.getId(), requestId)
                        .header("Authorization", bearer(organizer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        // Accepting again doesn't add a second member (US-14)
        mvc.perform(patch("/api/users/{id}/requests/{requestId}/accept", organizer.getId(), requestId)
                        .header("Authorization", bearer(organizer)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Join request is already accepted"));

        mvc.perform(get("/api/users/{id}/groups/{groupId}", organizer.getId(), groupId)
                        .header("Authorization", bearer(organizer)))
                .andExpect(jsonPath("$.memberCount").value(1));
    }

    @Test
    void rejectedApplicantIsNotAdded() throws Exception {
        User organizer = newUser();
        User applicant = newUser();
        long groupId = createGroup(organizer);
        long requestId = apply(applicant, groupId);

        mvc.perform(patch("/api/users/{id}/requests/{requestId}/reject", organizer.getId(), requestId)
                        .header("Authorization", bearer(organizer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        mvc.perform(get("/api/users/{id}/requests", applicant.getId())
                        .header("Authorization", bearer(applicant)))
                .andExpect(jsonPath("$[0].status").value("REJECTED"));
        mvc.perform(get("/api/users/{id}/groups/{groupId}", organizer.getId(), groupId)
                        .header("Authorization", bearer(organizer)))
                .andExpect(jsonPath("$.memberCount").value(0));
    }

    @Test
    void groupInThePastIsRefused() throws Exception {
        User organizer = newUser();
        String body = groupJson(LocalDate.now().minusDays(1));

        mvc.perform(post("/api/users/{id}/groups", organizer.getId())
                        .header("Authorization", bearer(organizer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.meetingDate").exists());
    }

    // ---------- helpers ----------

    // A BEGINNER-level MATH 161 group tomorrow 16:00-18:00 that wants quiet work
    private long createGroup(User organizer) throws Exception {
        String body = mvc.perform(post("/api/users/{id}/groups", organizer.getId())
                        .header("Authorization", bearer(organizer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(groupJson(LocalDate.now().plusDays(1))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    private String groupJson(LocalDate date) {
        return "{\"title\":\"Test group\",\"description\":\"Practice set\",\"subjectName\":\"Calculus II\","
                + "\"courseCode\":\"MATH 161\",\"place\":\"LIBRARY\",\"meetingDate\":\"" + date + "\","
                + "\"startTime\":\"16:00\",\"endTime\":\"18:00\",\"level\":\"BEGINNER\","
                + "\"preferences\":[\"QUIET_WORK\"],\"groupSize\":4}";
    }

    // A perfect match: same course, free the whole meeting, same level, same preference
    private long apply(User applicant, long groupId) throws Exception {
        String body = mvc.perform(post("/api/users/{id}/groups/{groupId}/requests", applicant.getId(), groupId)
                        .header("Authorization", bearer(applicant))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answers("BEGINNER", "[\"QUIET_WORK\"]")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    private String answers(String level, String preferences) {
        return "{\"courseCode\":\"math 161\",\"level\":\"" + level + "\",\"availableFrom\":\"15:00\","
                + "\"availableTo\":\"19:00\",\"preferences\":" + preferences + ",\"note\":\"Hi\"}";
    }

    private String bearer(User user) {
        return "Bearer " + sessionService.start(user.getId());
    }

    private User newUser() {
        String studentId = newStudentId();
        return userRepository.save(new User("test-" + studentId, studentId + "@sdu.edu.kz"));
    }

    // Unique 9-digit IDs so the tests can run against a database that already has data
    private String newStudentId() {
        return String.valueOf(100_000_000 + Math.floorMod(UUID.randomUUID().hashCode(), 900_000_000));
    }
}
