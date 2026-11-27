package com.studymate.studymate.dto.profile;

import com.studymate.studymate.entity.StudyPlace;
import com.studymate.studymate.entity.StudyPreference;

import java.util.List;
import java.util.Set;

// What other signed-in students see on someone's profile, e.g. an organizer looking at an applicant.
// No email, student ID, free time or list of sessions: those would tell strangers where and when to find someone.
public record PublicProfileResponse(
        Long id,
        String name,
        List<ProfileSubjectDto> subjects,
        StudyPreference studyStyle,
        Set<StudyPlace> favouritePlaces,
        int sessionsJoined,
        int groupsOrganized,
        int studentsMet
) {
}
