package com.studymate.studymate.dto.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.studymate.studymate.entity.StudyPlace;
import com.studymate.studymate.entity.StudyPreference;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;
import java.util.List;
import java.util.Set;

// The parts of the profile a student can edit (the username has its own request).
// availableFrom and availableTo are optional, but if one is given the other must be too.
public record ProfileUpdateRequest(
        @NotNull @Size(max = 12) List<@Valid ProfileSubjectDto> subjects,
        StudyPreference studyStyle,
        Set<StudyPlace> favouritePlaces,
        LocalTime availableFrom,
        LocalTime availableTo
) {

    @JsonIgnore
    @AssertTrue(message = "give both a start and an end time, with the end after the start")
    public boolean isAvailabilityValid() {
        if (availableFrom == null && availableTo == null) {
            return true;
        }
        return availableFrom != null && availableTo != null && availableTo.isAfter(availableFrom);
    }
}
