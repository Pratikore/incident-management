package com.pm.incidentservice.repository;

import com.pm.incidentservice.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {

  /** Highest sequence assigned so far, or 0 when the table is empty. */
  @Query("select coalesce(max(i.sequence), 0) from Incident i")
  long findMaxSequence();
}
