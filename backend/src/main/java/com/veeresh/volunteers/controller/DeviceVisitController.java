package com.veeresh.volunteers.controller;

import com.veeresh.volunteers.model.DeviceVisit;
import com.veeresh.volunteers.repository.DeviceVisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "*")
public class DeviceVisitController {

    @Autowired
    private DeviceVisitRepository repository;

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("Mobile", 0L);
        stats.put("Desktop", 0L);
        stats.put("Tablet", 0L);

        List<DeviceVisit> visits = repository.findAll();
        for (DeviceVisit v : visits) {
            stats.put(v.getDeviceType(), v.getVisitCount());
        }
        return stats;
    }

    @PostMapping("/track")
    public Map<String, Long> recordVisit(@RequestParam String deviceType) {
        DeviceVisit visit = repository.findByDeviceType(deviceType)
                .orElse(new DeviceVisit(deviceType, 0L));
        visit.setVisitCount(visit.getVisitCount() + 1);
        repository.save(visit);
        return getStats();
    }
}