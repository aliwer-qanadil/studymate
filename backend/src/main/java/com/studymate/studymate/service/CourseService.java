package com.studymate.studymate.service;

import com.studymate.studymate.entity.Course;
import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.CourseRepository;
import com.studymate.studymate.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(
            CourseRepository courseRepository,
            UserRepository userRepository) {

        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByUser(Long userId) {
        return courseRepository.findByUserId(userId);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course createCourse(Long userId, Course course) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        course.setUser(user);

        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Long currentUserId, Course updatedCourse) {

        Course course = getOwnCourse(id, currentUserId);

        course.setName(updatedCourse.getName());
        course.setDescription(updatedCourse.getDescription());

        return courseRepository.save(course);
    }

    public void deleteCourse(Long id, Long currentUserId) {

        Course course = getOwnCourse(id, currentUserId);

        courseRepository.delete(course);
    }

    private Course getOwnCourse(Long id, Long currentUserId) {

        Course course = getCourseById(id);

        if (course.getUser() == null || !course.getUser().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change your own courses.");
        }

        return course;
    }
}
