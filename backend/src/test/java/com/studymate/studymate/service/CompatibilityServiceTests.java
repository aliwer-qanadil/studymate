package com.studymate.studymate.service;

import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.EnumSet;
import java.util.Set;

import com.studymate.studymate.entity.StudyPreference;

import static org.junit.jupiter.api.Assertions.assertEquals;

// The parts of the compatibility score (each 0-100); the weights 40/30/20/10 are in CompatibilityScore
class CompatibilityServiceTests {

    private final CompatibilityService service = new CompatibilityService();

    @Test
    void subjectMatchesIgnoringSpacesAndCase() {
        assertEquals(100, service.subjectScore("MATH 161", "math161"));
        assertEquals(50, service.subjectScore("MATH 161", "MATH 162"));
        assertEquals(0, service.subjectScore("MATH 161", "CSS 204"));
    }

    @Test
    void timeIsTheShareOfTheMeetingInsideTheFreeWindow() {
        LocalTime start = LocalTime.of(16, 0);
        LocalTime end = LocalTime.of(18, 0);
        assertEquals(100, service.timeScore(start, end, LocalTime.of(15, 0), LocalTime.of(19, 0)));
        assertEquals(50, service.timeScore(start, end, LocalTime.of(17, 0), LocalTime.of(19, 0)));
        assertEquals(0, service.timeScore(start, end, LocalTime.of(9, 0), LocalTime.of(12, 0)));
    }

    @Test
    void preferencesAreTheShareOfTheGroupsWishesTheApplicantShares() {
        Set<StudyPreference> group = EnumSet.of(StudyPreference.QUIET_WORK, StudyPreference.SAME_YEAR);
        assertEquals(50, service.preferenceScore(group, Set.of(StudyPreference.QUIET_WORK)));
        assertEquals(100, service.preferenceScore(Set.of(), Set.of()));
        assertEquals(100, service.preferenceScore(Set.of(StudyPreference.ANY_LEVEL), Set.of()));
    }
}
