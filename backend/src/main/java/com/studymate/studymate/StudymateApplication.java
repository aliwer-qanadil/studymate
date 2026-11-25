package com.studymate.studymate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class StudymateApplication {

	// "Today" and "already started" checks use the campus time, not the server's.
	// Cloud servers usually run on UTC, which is 5 hours behind Almaty.
	public static final String DEFAULT_TIME_ZONE = "Asia/Almaty";

	public static void main(String[] args) {
		String zone = System.getenv().getOrDefault("APP_TIME_ZONE", DEFAULT_TIME_ZONE);
		TimeZone.setDefault(TimeZone.getTimeZone(zone));
		SpringApplication.run(StudymateApplication.class, args);
	}

}
