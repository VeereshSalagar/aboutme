package com.veeresh.volunteers.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.veeresh.volunteers.model.Volunteer;
import com.veeresh.volunteers.repository.VolunteerRepository;

import jakarta.validation.Valid;

@CrossOrigin(
    origins = {
        "https://veereshsalagar.github.io",
        "http://localhost:3000"
    },
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
@RestController
@RequestMapping("/volunteers")
public class VolunteerController {

    private final VolunteerRepository repository;

    public VolunteerController(VolunteerRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Volunteer saveVolunteer(@Valid @RequestBody Volunteer volunteer) {
        return repository.save(volunteer);
    }

    @GetMapping
    public List<Volunteer> getAllVolunteers() {
        return repository.findAll();
    }

    @DeleteMapping("/{id}")
    public void deleteVolunteer(@PathVariable Long id) {
        repository.deleteById(id);
    }
    
}