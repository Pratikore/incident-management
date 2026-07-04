package com.pm.incidentservice.config;

import com.pm.incidentservice.model.Role;
import com.pm.incidentservice.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
* Seeds a default admin account the first time the application starts so there
* is always a way to log in. Credentials are configurable via properties.
*/
@Component
public class DataInitializer implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

  private final UserService userService;
  private final String defaultUsername;
  private final String defaultPassword;
  private final String defaultEmail;

  public DataInitializer(UserService userService,
             @Value("${app.default-admin.username:admin}") String defaultUsername,
             @Value("${app.default-admin.password:admin123}") String defaultPassword,
             @Value("${app.default-admin.email:admin@incident.local}") String defaultEmail) {
    this.userService = userService;
    this.defaultUsername = defaultUsername;
    this.defaultPassword = defaultPassword;
    this.defaultEmail = defaultEmail;
  }

  @Override
  public void run(String... args) {
    if (userService.count() == 0) {
      userService.create(defaultUsername, defaultPassword, defaultEmail, Role.ADMIN);
      log.info("Seeded default admin user '{}' (change the password after first login).", defaultUsername);
    }
  }
}
