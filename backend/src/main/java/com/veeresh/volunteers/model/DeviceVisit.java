package com.veeresh.volunteers.model;

import jakarta.persistence.*;

@Entity
@Table(name = "device_visits")
public class DeviceVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String deviceType; // "Mobile", "Desktop", "Tablet"

    private long visitCount;

    public DeviceVisit() {}

    public DeviceVisit(String deviceType, long visitCount) {
        this.deviceType = deviceType;
        this.visitCount = visitCount;
    }

    public Long getId() {
        return id;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public long getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(long visitCount) {
        this.visitCount = visitCount;
    }
}
