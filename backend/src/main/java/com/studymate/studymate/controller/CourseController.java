package com.studymate.studymate.controller;

import com.studymate.studymate.config.AuthInterceptor;
import com.studymate.studymate.entity.Course;
import com.studymate.studymate.service.CourseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/user/{userId}")
    public List<Course> getUserCourses(@PathVariable Long userId) {
        return courseService.getCoursesByUser(userId);
    }

    @GetMapping("/{id}")
    public Course getCourse(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }

    @PostMapping("/user/{userId}")
    public Course createCourse(
            @PathVariable Long userId,
            @RequestBody Course course) {

        return courseService.createCourse(userId, course);
    }

    // currentUserId is set by AuthInterceptor; only the course's owner may change or delete it
    @PutMapping("/{id}")
    public Course updateCourse(
            @PathVariable Long id,
            @RequestAttribute(AuthInterceptor.CURRENT_USER_ID) Long currentUserId,
            @RequestBody Course course) {

        return courseService.updateCourse(id, currentUserId, course);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(
            @PathVariable Long id,
            @RequestAttribute(AuthInterceptor.CURRENT_USER_ID) Long currentUserId) {

        courseService.deleteCourse(id, currentUserId);
    }
}
