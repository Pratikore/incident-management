package com.pm.incidentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IncidentManagementApplication {

  public static void main(String[] args) {
    SpringApplication.run(IncidentManagementApplication.class, args);
  }
}
