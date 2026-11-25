package com.studymate.studymate.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

// Rules the database itself enforces, on top of the checks in the services.
// Hibernate can't create partial indexes, so they are added here after it has created the tables.
// "IF NOT EXISTS" makes this safe to run on every start.
@Component
@Order(0)
public class DatabaseConstraints implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConstraints.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseConstraints(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        // One waiting or accepted request per student and group, even when two arrive at once (NFR-07)
        create("""
                CREATE UNIQUE INDEX IF NOT EXISTS one_active_request_per_group
                ON join_requests (group_id, applicant_id)
                WHERE status IN ('PENDING', 'ACCEPTED')""");
        // Browse lists open upcoming groups by date
        create("CREATE INDEX IF NOT EXISTS study_groups_upcoming ON study_groups (status, meeting_date)");
        create("CREATE INDEX IF NOT EXISTS join_requests_by_group ON join_requests (group_id, status)");
    }

    private void create(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (DataAccessException e) {
            // Existing duplicate data would stop the index; the app still works with the service checks
            log.warn("Could not add a database index; the service checks still apply: {}", e.getMostSpecificCause().getMessage());
        }
    }
}
