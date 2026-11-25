package com.studymate.studymate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TimeZone;

@SpringBootApplication
public class StudymateApplication {

	// "Today" and "already started" checks use the campus time, not the server's.
	// Cloud servers usually run on UTC, which is 5 hours behind Almaty.
	public static final String DEFAULT_TIME_ZONE = "Asia/Almaty";

	public static void main(String[] args) {
		Map<String, String> env = System.getenv();
		TimeZone.setDefault(TimeZone.getTimeZone(env.getOrDefault("APP_TIME_ZONE", DEFAULT_TIME_ZONE)));
		useDatabaseUrl(env.get("DATABASE_URL"), env.get("SPRING_DATASOURCE_URL"));
		SpringApplication.run(StudymateApplication.class, args);
	}

	// Cloud hosts give the database as DATABASE_URL=postgres://user:password@host:5432/name?sslmode=require.
	// Spring needs jdbc:postgresql://host:5432/name plus a separate user and password.
	// SPRING_DATASOURCE_URL, if set, wins.
	static void useDatabaseUrl(String databaseUrl, String springUrl) {
		if (databaseUrl == null || databaseUrl.isBlank() || (springUrl != null && !springUrl.isBlank())) {
			return;
		}
		Map<String, String> settings = jdbcSettings(databaseUrl);
		settings.forEach(System::setProperty);
	}

	static Map<String, String> jdbcSettings(String databaseUrl) {
		URI uri = URI.create(databaseUrl.trim());
		String scheme = uri.getScheme();
		if (!"postgres".equals(scheme) && !"postgresql".equals(scheme)) {
			throw new IllegalArgumentException("DATABASE_URL must start with postgres:// or postgresql://");
		}

		int port = uri.getPort() == -1 ? 5432 : uri.getPort();
		String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getRawPath()
				+ (uri.getRawQuery() != null ? "?" + uri.getRawQuery() : "");

		String userInfo = uri.getRawUserInfo();
		if (userInfo == null) {
			return Map.of("spring.datasource.url", jdbcUrl);
		}
		int colon = userInfo.indexOf(':');
		String user = decode(colon < 0 ? userInfo : userInfo.substring(0, colon));
		String password = colon < 0 ? "" : decode(userInfo.substring(colon + 1));
		return Map.of(
				"spring.datasource.url", jdbcUrl,
				"spring.datasource.username", user,
				"spring.datasource.password", password);
	}

	private static String decode(String value) {
		// "+" is a literal plus in the user and password part, not a space
		return URLDecoder.decode(value.replace("+", "%2B"), StandardCharsets.UTF_8);
	}

}
