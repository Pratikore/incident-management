package com.pm.incidentservice.repository;

import com.pm.incidentservice.model.Incident;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
* Thread-safe in-memory store for incidents. Data lives for the lifetime of the
* application process only.
*/
@Repository
public class IncidentRepository {

  private final ConcurrentMap<UUID, Incident> store = new ConcurrentHashMap<>();

  public Incident save(Incident incident) {
    store.put(incident.getId(), incident);
    return incident;
  }

  public Optional<Incident> findById(UUID id) {
    return Optional.ofNullable(store.get(id));
  }

  public List<Incident> findAll() {
    return new ArrayList<>(store.values());
  }

  public boolean existsById(UUID id) {
    return store.containsKey(id);
  }
}
