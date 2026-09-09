package com.edutrack.repository;

import com.edutrack.model.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<ClassSchedule, String> {
    List<ClassSchedule> findByCourseIndex(Integer courseIndex);
    List<ClassSchedule> findByCourseIndexAndDate(Integer courseIndex, String date);
}
