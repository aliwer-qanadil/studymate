package com.studymate.studymate.service;

import com.studymate.studymate.dto.request.JoinRequestCreateRequest;
import com.studymate.studymate.dto.request.JoinRequestResponse;
import com.studymate.studymate.entity.CompatibilityScore;
import com.studymate.studymate.entity.GroupStatus;
import com.studymate.studymate.entity.JoinRequest;
import com.studymate.studymate.entity.JoinRequestStatus;
import com.studymate.studymate.entity.StudyGroup;
import com.studymate.studymate.entity.StudyPreference;
import com.studymate.studymate.entity.User;
import com.studymate.studymate.exception.BusinessRuleException;
import com.studymate.studymate.exception.ResourceNotFoundException;
import com.studymate.studymate.mapper.JoinRequestMapper;
import com.studymate.studymate.repository.JoinRequestRepository;
import com.studymate.studymate.repository.StudyGroupRepository;
import com.studymate.studymate.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class JoinRequestServiceImpl implements JoinRequestService {

    private final JoinRequestRepository requestRepository;
    private final StudyGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final CompatibilityService compatibilityService;
    private final JoinRequestMapper requestMapper;

    public JoinRequestServiceImpl(
            JoinRequestRepository requestRepository,
            StudyGroupRepository groupRepository,
            UserRepository userRepository,
            CompatibilityService compatibilityService,
            JoinRequestMapper requestMapper) {

        this.requestRepository = requestRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.compatibilityService = compatibilityService;
        this.requestMapper = requestMapper;
    }

    @Override
    @Transactional
    public JoinRequestResponse apply(Long userId, Long groupId, JoinRequestCreateRequest request) {
        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Study group", groupId));

        if (group.isOrganizer(userId)) {
            throw new BusinessRuleException("You cannot apply to your own study group");
        }
        ensureOpen(group);
        ensureNotOver(group);
        if (requestRepository.existsByGroupIdAndApplicantIdAndStatusNot(groupId, userId, JoinRequestStatus.CANCELLED)) {
            throw new BusinessRuleException("You have already applied to this study group");
        }

        Set<StudyPreference> preferences = request.preferences() != null ? request.preferences() : Set.of();
        String courseCode = request.courseCode().trim().toUpperCase(Locale.ROOT);

        CompatibilityScore compatibility = compatibilityService.calculate(
                group,
                courseCode,
                request.level(),
                request.availableFrom(),
                request.availableTo(),
                preferences
        );

        JoinRequest joinRequest = new JoinRequest(
                group,
                applicant,
                courseCode,
                request.level(),
                request.availableFrom(),
                request.availableTo(),
                preferences,
                request.note(),
                compatibility
        );

        return requestMapper.toResponse(requestRepository.save(joinRequest));
    }

    @Override
    public List<JoinRequestResponse> getGroupRequests(Long userId, Long groupId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Study group", groupId));
        // The group itself is public, but its applicants are only for the organizer (US-13)
        if (!group.isOrganizer(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can see the requests for this group.");
        }

        return requestRepository.findByGroupIdOrderByScoreDescCreatedAtAsc(group.getId()).stream()
                .map(requestMapper::toResponse)
                .toList();
    }

    @Override
    public List<JoinRequestResponse> getMyRequests(Long userId) {
        return requestRepository.findByApplicantIdOrderByCreatedAtDesc(userId).stream()
                .map(requestMapper::toResponse)
                .toList();
    }

    // Accepts a waiting applicant, or takes back an earlier decline
    @Override
    @Transactional
    public JoinRequestResponse accept(Long userId, Long requestId) {
        JoinRequest request = findOrganizerRequest(userId, requestId);
        if (request.getStatus() != JoinRequestStatus.PENDING && request.getStatus() != JoinRequestStatus.REJECTED) {
            throw alreadyDecided(request);
        }
        ensureOpen(request.getGroup());
        ensureNotOver(request.getGroup());

        request.accept();
        request.getGroup().addMember();

        return requestMapper.toResponse(request);
    }

    // Declines a waiting applicant, or removes someone who was accepted (their seat opens again)
    @Override
    @Transactional
    public JoinRequestResponse reject(Long userId, Long requestId) {
        JoinRequest request = findOrganizerRequest(userId, requestId);
        if (request.getStatus() == JoinRequestStatus.ACCEPTED) {
            ensureNotOver(request.getGroup());
            request.getGroup().removeMember();
        } else if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw alreadyDecided(request);
        }

        request.reject();

        return requestMapper.toResponse(request);
    }

    // The applicant takes back a waiting request, or leaves a group they were accepted into
    @Override
    @Transactional
    public JoinRequestResponse cancel(Long userId, Long requestId) {
        JoinRequest request = requestRepository.findByIdAndApplicantId(requestId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request", requestId));
        if (request.getStatus() == JoinRequestStatus.ACCEPTED) {
            ensureNotOver(request.getGroup());
            request.getGroup().removeMember();
        } else if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw alreadyDecided(request);
        }

        request.cancel();

        return requestMapper.toResponse(request);
    }

    private JoinRequest findOrganizerRequest(Long userId, Long requestId) {
        return requestRepository.findByIdAndGroupOrganizerId(requestId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request", requestId));
    }

    private BusinessRuleException alreadyDecided(JoinRequest request) {
        return new BusinessRuleException("Join request is already " + request.getStatus().name().toLowerCase(Locale.ROOT));
    }

    // Who is in the group can't change once the meeting is over
    private void ensureNotOver(StudyGroup group) {
        if (group.isOver()) {
            throw new BusinessRuleException("This meeting has already taken place");
        }
    }

    private void ensureOpen(StudyGroup group) {
        if (group.getStatus() == GroupStatus.FULL) {
            throw new BusinessRuleException("Study group is full");
        }
        if (group.getStatus() == GroupStatus.CANCELLED) {
            throw new BusinessRuleException("Study group was cancelled");
        }
    }
}
