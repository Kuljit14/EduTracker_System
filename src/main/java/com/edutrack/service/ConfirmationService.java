package com.edutrack.service;

import com.edutrack.dto.ConfirmationRequest;
import com.edutrack.model.Confirmation;
import com.edutrack.model.Student;
import com.edutrack.repository.ConfirmationRepository;
import com.edutrack.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class ConfirmationService {

    private final ConfirmationRepository confirmationRepository;
    private final StudentRepository studentRepository;

    public ConfirmationService(ConfirmationRepository confirmationRepository, StudentRepository studentRepository) {
        this.confirmationRepository = confirmationRepository;
        this.studentRepository = studentRepository;
    }

    public List<Confirmation> getRecentConfirmations() {
        return confirmationRepository.findAllByOrderByIdDesc();
    }

    public Confirmation submitConfirmation(ConfirmationRequest req) {
        String date = req.getDate();
        if (date == null || date.trim().isEmpty()) {
            date = LocalDate.now().toString();
        }

        String submittedAt = req.getSubmittedAt();
        if (submittedAt == null || submittedAt.trim().isEmpty()) {
            submittedAt = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));
        }

        Confirmation confirmation = new Confirmation(
                req.getStudentId(),
                req.getStudent(),
                req.getCourseIndex(),
                req.getTopic(),
                req.getComment(),
                date,
                submittedAt
        );

        Confirmation savedConfirmation = confirmationRepository.save(confirmation);

        // Update student completions & progress
        if (req.getStudentId() != null) {
            studentRepository.findById(req.getStudentId()).ifPresent(student -> {
                student.addCompletion(req.getCourseIndex(), req.getTopic());
                int currentProg = student.getProgress().getOrDefault(req.getCourseIndex(), 0);
                student.getProgress().put(req.getCourseIndex(), Math.min(100, currentProg + 5));
                studentRepository.save(student);
            });
        }

        return savedConfirmation;
    }
}
