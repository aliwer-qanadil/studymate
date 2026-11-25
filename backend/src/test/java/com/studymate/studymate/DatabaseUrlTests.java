package com.studymate.studymate;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

// DATABASE_URL from a cloud host -> Spring's JDBC settings
class DatabaseUrlTests {

    @Test
    void convertsAPostgresUrlWithUserPasswordAndOptions() {
        Map<String, String> settings = StudymateApplication.jdbcSettings(
                "postgres://mate:p%40ss+word@db.example.com:6543/studymate?sslmode=require");

        assertEquals("jdbc:postgresql://db.example.com:6543/studymate?sslmode=require", settings.get("spring.datasource.url"));
        assertEquals("mate", settings.get("spring.datasource.username"));
        assertEquals("p@ss+word", settings.get("spring.datasource.password"));
    }

    @Test
    void usesPort5432WhenNoneIsGiven() {
        Map<String, String> settings = StudymateApplication.jdbcSettings("postgresql://u:p@host/db");
        assertEquals("jdbc:postgresql://host:5432/db", settings.get("spring.datasource.url"));
    }

    @Test
    void refusesOtherDatabases() {
        assertThrows(IllegalArgumentException.class, () -> StudymateApplication.jdbcSettings("mysql://u:p@host/db"));
    }
}
