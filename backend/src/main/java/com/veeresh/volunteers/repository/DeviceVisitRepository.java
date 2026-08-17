package com.veeresh.volunteers.repository;

import com.veeresh.volunteers.model.DeviceVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceVisitRepository extends JpaRepository<DeviceVisit, Long> {
    Optional<DeviceVisit> findByDeviceType(String deviceType);
}