package com.edutrack.service;

import com.edutrack.dto.ScheduleRequest;
import com.edutrack.model.ClassSchedule;
import com.edutrack.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public List<ClassSchedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public ClassSchedule addSchedule(ScheduleRequest req) {
        String id = req.getId();
        if (id == null || id.trim().isEmpty()) {
            id = UUID.randomUUID().toString();
        }

        ClassSchedule schedule = new ClassSchedule(
                id,
                req.getCourseIndex(),
                req.getTopic(),
                req.getDate(),
                req.getTime()
        );

        return scheduleRepository.save(schedule);
    }

    public void deleteSchedule(String id) {
        scheduleRepository.deleteById(id);
    }
}
