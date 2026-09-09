package com.edutrack.repository;

import com.edutrack.model.Confirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConfirmationRepository extends JpaRepository<Confirmation, Long> {
    List<Confirmation> findAllByOrderByIdDesc();
    List<Confirmation> findByStudentIdAndCourseIndexAndDate(String studentId, Integer courseIndex, String date);
}
