package com.studymate.studymate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final String[] allowedOrigins;

    // CORS_ALLOWED_ORIGINS: comma-separated sites that may call the API from a browser,
    // e.g. "https://studymate.example.com". Patterns like "https://*.onrender.com" work too.
    // Not needed when the frontend's nginx forwards /api (same address, no CORS at all).
    public WebConfig(
            AuthInterceptor authInterceptor,
            @Value("${studymate.cors.allowed-origins}") String allowedOrigins) {

        this.authInterceptor = authInterceptor;
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }

    // Everything about one user (profile, groups they organize, requests) needs a login.
    // Browsing groups (/api/groups), logging in (/api/auth) and /api/health stay public.
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/users/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .maxAge(3600);
    }
}
