package com.edutrack.controller;

import com.edutrack.dto.ConfirmationRequest;
import com.edutrack.model.Confirmation;
import com.edutrack.service.ConfirmationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/confirmations")
public class ConfirmationController {

    private final ConfirmationService confirmationService;

    public ConfirmationController(ConfirmationService confirmationService) {
        this.confirmationService = confirmationService;
    }

    @GetMapping
    public ResponseEntity<List<Confirmation>> getRecentConfirmations() {
        return ResponseEntity.ok(confirmationService.getRecentConfirmations());
    }

    @PostMapping
    public ResponseEntity<Confirmation> submitConfirmation(@RequestBody @Valid ConfirmationRequest req) {
        return ResponseEntity.ok(confirmationService.submitConfirmation(req));
    }
}
