package com.veeresh.volunteers.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.veeresh.volunteers.model.Volunteer;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
}