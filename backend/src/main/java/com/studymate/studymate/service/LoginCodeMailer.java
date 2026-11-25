package com.studymate.studymate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;

// Sends the login code. MAIL_PROVIDER picks how:
//   auto  (default) - smtp when an SMTP username is set, otherwise log (handy for a first local run)
//   smtp            - any SMTP server, e.g. Gmail with an app password (MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD)
//   brevo           - Brevo's HTTPS API (BREVO_API_KEY). Use it where the host blocks SMTP ports,
//                     as many free cloud plans do.
//   log             - writes the code to the server log instead of emailing it. Only for local
//                     runs and private test servers: whoever reads the log can sign in as anyone.
@Service
public class LoginCodeMailer {

    private static final Logger log = LoggerFactory.getLogger(LoginCodeMailer.class);
    private static final URI BREVO_URL = URI.create("https://api.brevo.com/v3/smtp/email");

    private final JavaMailSender mailSender;
    private final String provider;
    private final String from;
    private final String brevoApiKey;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public LoginCodeMailer(
            JavaMailSender mailSender,
            @Value("${studymate.mail.provider}") String provider,
            @Value("${studymate.mail.from}") String from,
            @Value("${studymate.mail.brevo-api-key}") String brevoApiKey) {

        this.mailSender = mailSender;
        String chosen = provider.trim().toLowerCase(Locale.ROOT);
        if (chosen.equals("auto")) {
            chosen = from.isBlank() ? "log" : "smtp";
        }
        this.provider = chosen;
        this.from = from.trim();
        this.brevoApiKey = brevoApiKey.trim();

        if (this.provider.equals("log")) {
            log.warn("Email is not set up (MAIL_PROVIDER={}): login codes are written to this log instead of being emailed. "
                    + "Do not use this on a public server.", provider);
        }
    }

    // If sending fails, the error goes back to the student and AuthService rolls back,
    // so no unused code stays in the database.
    public void send(String email, String code, int minutesValid) {
        String subject = "Your Study Mate login code: " + code;
        String text = "Your Study Mate login code is " + code + ".\n\n"
                + "It works for " + minutesValid + " minutes. If you didn't try to log in, you can ignore this email.";

        switch (provider) {
            case "log" -> log.info("Login code for {}: {}", email, code);
            case "brevo" -> sendWithBrevo(email, subject, text);
            default -> sendWithSmtp(email, subject, text);
        }
    }

    private void sendWithSmtp(String email, String subject, String text) {
        if (from.isBlank()) {
            log.error("Can't send the login code: set MAIL_USERNAME and MAIL_PASSWORD "
                    + "(or GMAIL_USER and GMAIL_APP_PASSWORD).");
            throw notSetUp();
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject(subject);
        message.setText(text);

        try {
            mailSender.send(message);
        } catch (MailException e) {
            log.error("Could not send the login code to {}", email, e);
            throw sendFailed();
        }
    }

    private void sendWithBrevo(String email, String subject, String text) {
        if (brevoApiKey.isBlank() || from.isBlank()) {
            log.error("Can't send the login code: MAIL_PROVIDER=brevo needs BREVO_API_KEY and MAIL_FROM.");
            throw notSetUp();
        }

        String body = "{\"sender\":{\"name\":\"Study Mate\",\"email\":" + json(from) + "},"
                + "\"to\":[{\"email\":" + json(email) + "}],"
                + "\"subject\":" + json(subject) + ","
                + "\"textContent\":" + json(text) + "}";

        HttpRequest request = HttpRequest.newBuilder(BREVO_URL)
                .timeout(Duration.ofSeconds(10))
                .header("api-key", brevoApiKey)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.error("Brevo refused the login code email to {}: HTTP {} {}", email, response.statusCode(), response.body());
                throw sendFailed();
            }
        } catch (IOException e) {
            log.error("Could not reach Brevo to send the login code to {}", email, e);
            throw sendFailed();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw sendFailed();
        }
    }

    // A JSON string with quotes, backslashes and control characters escaped
    static String json(String value) {
        StringBuilder out = new StringBuilder("\"");
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> {
                    if (c < 0x20) {
                        out.append(String.format("\\u%04x", (int) c));
                    } else {
                        out.append(c);
                    }
                }
            }
        }
        return out.append('"').toString();
    }

    private ResponseStatusException notSetUp() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email sending is not set up on the server yet.");
    }

    private ResponseStatusException sendFailed() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "We couldn't send the email. Please try again in a moment.");
    }
}
