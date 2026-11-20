package com.studymate.studymate.config;

import com.studymate.studymate.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

// Runs before every protected endpoint (see WebConfig):
// - no valid token                          -> 401 "Please log in again."
// - /api/users/{userId}/... for someone else -> 403
// Otherwise it stores the signed-in user's id in the request as "currentUserId".
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String CURRENT_USER_ID = "currentUserId";

    private final SessionService sessionService;

    public AuthInterceptor(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS preflight requests never carry the token
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        String token = tokenFrom(request);
        Long currentUserId = token == null ? null : sessionService.findUserId(token).orElse(null);
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }

        String userIdInUrl = pathVariables(request).get("userId");
        if (userIdInUrl != null && !userIdInUrl.equals(currentUserId.toString())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only do this for your own account.");
        }

        request.setAttribute(CURRENT_USER_ID, currentUserId);
        return true;
    }

    // "Authorization: Bearer abc" -> "abc"
    public static String tokenFrom(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring("Bearer ".length()).trim();
        return token.isEmpty() ? null : token;
    }

    // Values like {userId} from the matched URL, filled in by Spring before interceptors run
    @SuppressWarnings("unchecked")
    private Map<String, String> pathVariables(HttpServletRequest request) {
        Object variables = request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        return variables instanceof Map ? (Map<String, String>) variables : Map.of();
    }
}
