
const defaultStudents = [
  { id: 'STU-001', name: 'Aanya Sharma', initials: 'AS', enrollments: [0, 1, 2], progress: { 0: 80, 1: 67, 2: 71 }, attendance: 94, completions: { 0: [], 1: [], 2: [] }, scheduleOverrides: {} },
  { id: 'STU-002', name: 'Rohan Mehta', initials: 'RM', enrollments: [0, 1], progress: { 0: 64, 1: 64 }, attendance: 88, completions: { 0: [], 1: [] }, scheduleOverrides: {} },
  { id: 'STU-003', name: 'Sana Khan', initials: 'SK', enrollments: [0, 2], progress: { 0: 91, 2: 91 }, attendance: 98, completions: { 0: [], 2: [] }, scheduleOverrides: {} },
  { id: 'STU-004', name: 'Vivaan Gupta', initials: 'VG', enrollments: [1], progress: { 1: 58 }, attendance: 79, completions: { 1: [] }, scheduleOverrides: {} },
  { id: 'STU-005', name: 'Ishita Rao', initials: 'IR', enrollments: [0, 3], progress: { 0: 76, 3: 76 }, attendance: 92, completions: { 0: [], 3: [] }, scheduleOverrides: {} },
  { id: 'STU-006', name: 'Arjun Singh', initials: 'AS', enrollments: [3], progress: { 3: 45 }, attendance: 86, completions: { 3: [] }, scheduleOverrides: {} },
];

const studentsStorageKey = 'eduTrack-students';
let studentRecords = JSON.parse(localStorage.getItem(studentsStorageKey) || 'null') || defaultStudents;
let activeStudent = studentRecords[0];
const saveStudents = () => localStorage.setItem(studentsStorageKey, JSON.stringify(studentRecords));

const courses = [
  {
    name: 'Diploma in Computer Applications',
    shortName: 'DCA',
    meta: 'Computer course · 16 of 20 modules complete',
    progress: 80,
    topics: [
      ['Computer fundamentals', 'Completed in the previous class.', 'completed'],
      ['Windows and file management', 'Completed: folders, files, and shortcuts.', 'completed'],
      ['MS Word basics', 'Completed: formatting documents and tables.', 'completed'],
      ['MS Excel formulas', 'Today: using SUM, AVERAGE, and cell references.', 'current'],
      ['Excel charts', 'Coming next: create and format a chart.', 'upcoming'],
      ['PowerPoint presentation', 'Coming next: build a simple presentation.', 'upcoming'],
    ],
    learningPoints: [
      'I understand how to write a formula using cell references.',
      'I practiced the SUM and AVERAGE functions in Excel.',
      'I know when to use the fill handle to copy a formula.',
    ],
  },
  {
    name: 'Mathematics — Class 10',
    shortName: 'Mathematics',
    meta: 'School tuition · 12 of 18 chapters complete',
    progress: 67,
    topics: [
      ['Real numbers', 'Completed: Euclid’s division lemma.', 'completed'],
      ['Polynomials', 'Completed: zeros of a polynomial.', 'completed'],
      ['Pair of linear equations', 'Completed: graphical method.', 'completed'],
      ['Quadratic equations', 'Today: solve equations by factorisation.', 'current'],
      ['Arithmetic progressions', 'Coming next: find the nth term.', 'upcoming'],
      ['Triangles', 'Coming next: similarity criteria.', 'upcoming'],
    ],
    learningPoints: [
      'I can identify the standard form of a quadratic equation.',
      'I practiced solving a quadratic equation by factorisation.',
      'I can check my solution by substituting it back.',
    ],
  },
  {
    name: 'English Communication',
    shortName: 'English',
    meta: 'School tuition · 10 of 14 lessons complete',
    progress: 71,
    topics: [
      ['Introducing yourself', 'Completed: a confident personal introduction.', 'completed'],
      ['Everyday conversation', 'Completed: polite questions and replies.', 'completed'],
      ['Email writing', 'Completed: subject lines and structure.', 'completed'],
      ['Public speaking', 'Today: use a clear opening and closing.', 'current'],
      ['Interview preparation', 'Coming next: answer common questions.', 'upcoming'],
      ['Group discussion', 'Coming next: share ideas respectfully.', 'upcoming'],
    ],
    learningPoints: [
      'I practiced starting a short speech with confidence.',
      'I know how to use an opening, body, and closing.',
      'I received feedback on my speaking activity.',
    ],
  },
  {
    name: 'Tally Prime & GST',
    shortName: 'Tally',
    meta: 'Computer course · 6 of 16 modules complete',
    progress: 38,
    topics: [
      ['Tally Prime interface', 'Completed: navigate the main menus.', 'completed'],
      ['Company creation', 'Completed: create and select a company.', 'completed'],
      ['Ledger creation', 'Completed: set up basic ledgers.', 'completed'],
      ['Voucher entry', 'Today: record a payment voucher.', 'current'],
      ['GST configuration', 'Coming next: enable GST and tax rates.', 'upcoming'],
      ['Reports in Tally', 'Coming next: view profit and loss reports.', 'upcoming'],
    ],
    learningPoints: [
      'I can select the correct voucher type for a payment.',
      'I practiced entering a payment voucher.',
      'I know how to save and review a voucher entry.',
    ],
  },
];

const topicsStorageKey = 'eduTrack-course-topics';
const savedTopics = localStorage.getItem(topicsStorageKey);
if (savedTopics) {
  const parsedTopics = JSON.parse(savedTopics);
  courses.forEach((course, index) => {
    if (parsedTopics[index]) course.topics = parsedTopics[index];
  });
}

const defaultCourseSettings = [
  { description: 'Practical computer skills for everyday academic and office work.', announcement: 'Bring your Excel practice file to the next class.', day: 'Monday', time: '10:00' },
  { description: 'Class 10 mathematics concepts, practice, and problem-solving.', announcement: 'Complete the quadratic equations worksheet before class.', day: 'Tuesday', time: '11:00' },
  { description: 'Communication, writing, and confident speaking skills.', announcement: 'Prepare a one-minute introduction for the next class.', day: 'Wednesday', time: '12:00' },
  { description: 'Accounting, GST, vouchers, and reports in Tally Prime.', announcement: 'Revise ledger creation before the next practical.', day: 'Thursday', time: '14:00' },
];
const courseSettingsStorageKey = 'eduTrack-course-settings';
const savedCourseSettings = JSON.parse(localStorage.getItem(courseSettingsStorageKey) || 'null') || defaultCourseSettings;
courses.forEach((course, index) => Object.assign(course, savedCourseSettings[index] || defaultCourseSettings[index]));
const saveCourseSettings = () => {
  localStorage.setItem(courseSettingsStorageKey, JSON.stringify(courses.map(({ description, announcement, day, time }) => ({ description, announcement, day, time }))));
};

const saveTopics = () => {
  localStorage.setItem(topicsStorageKey, JSON.stringify(courses.map((course) => course.topics)));
};

const isoToday = new Date().toISOString().slice(0, 10);
const schedulesStorageKey = 'eduTrack-schedules';
const confirmationsStorageKey = 'eduTrack-confirmations';
let schedules = JSON.parse(localStorage.getItem(schedulesStorageKey) || 'null') || [
  { id: 'first-class', courseIndex: 0, topic: 'MS Excel formulas', date: isoToday, time: '10:00' },
];
let confirmations = JSON.parse(localStorage.getItem(confirmationsStorageKey) || '[]');

const saveSchedules = () => localStorage.setItem(schedulesStorageKey, JSON.stringify(schedules));
const saveConfirmations = () => localStorage.setItem(confirmationsStorageKey, JSON.stringify(confirmations));

const classTopicOptions = (courseIndex) =>
  courses[courseIndex].topics.filter((topic) => topic[2] !== 'completed').map((topic) => topic[0]);

const getCourseProgress = (course) => {
  if (!course.topics.length) return 0;
  return Math.round((course.topics.filter((topic) => topic[2] === 'completed').length / course.topics.length) * 100);
};

const getCourseMeta = (course) => {
  const completed = course.topics.filter((topic) => topic[2] === 'completed').length;
  return `${course.meta.split(' · ')[0]} · ${completed} of ${course.topics.length} topics completed`;
};

const getStudentProgress = (student, courseIndex) => student.progress[courseIndex] ?? 0;
const isEnrolled = (student, courseIndex) => student.enrollments.includes(courseIndex);
const getStudentSchedule = (student, courseIndex) => student.scheduleOverrides[courseIndex] || {
  day: courses[courseIndex].day,
  time: courses[courseIndex].time,
};

const renderCourses = () => {
  const enrolledCourses = courses.filter((course, index) => isEnrolled(activeStudent, index));
  document.querySelector('#course-list').innerHTML = enrolledCourses.length
    ? courses
        .map(
          (course, index) => `
        <button class="course course-button" type="button" data-course="${index}">
          <div class="course-row">
            <div>
              <div class="course-name">${course.name}</div>
              <div class="course-meta">${course.description} · ${getStudentSchedule(activeStudent, index).day}, ${getStudentSchedule(activeStudent, index).time}</div>
            </div>
            <div><span class="score">${getStudentProgress(activeStudent, index)}%</span><span class="course-arrow">→</span></div>
          </div>
          <div class="progress"><i style="width:${getStudentProgress(activeStudent, index)}%"></i></div>
        </button>`,
        )
        .filter((_, index) => isEnrolled(activeStudent, index))
        .join('')
    : '<p class="empty-state">You are not enrolled in any courses yet.</p>';
};

const renderDashboardCourses = () => {
  document.querySelector('#dashboard-course-list').innerHTML = courses
    .map(
      (course, index) => `<div class="course"><div class="course-row"><div><div class="course-name">${course.name}</div><div class="course-meta">${getStudentSchedule(activeStudent, index).day} · ${getStudentSchedule(activeStudent, index).time}</div></div><div class="score">${getStudentProgress(activeStudent, index)}%</div></div><div class="progress"><i style="width:${getStudentProgress(activeStudent, index)}%"></i></div></div>`,
    )
    .filter((_, index) => isEnrolled(activeStudent, index))
    .slice(0, 3)
    .join('');
};

const today = new Date().toLocaleDateString('en-CA');

const renderStudentSchedule = () => {
  const enrolledCourses = courses.filter((course, index) => isEnrolled(activeStudent, index));
  document.querySelector('#student-schedule').innerHTML = enrolledCourses.length
    ? courses
        .map((course, index) => {
          const nextLesson = schedules.find((schedule) => schedule.courseIndex === index && isEnrolled(activeStudent, index));
          const schedule = getStudentSchedule(activeStudent, index);
          if (!isEnrolled(activeStudent, index)) return '';
          return `<div class="schedule-row"><div><strong>${course.name}</strong><small>${nextLesson ? `Next topic: ${nextLesson.topic}` : course.announcement}</small></div><span class="schedule-time">${schedule.day} · ${schedule.time}</span></div>`;
        })
        .join('')
    : '<p class="empty-state">You are not enrolled in any courses yet.</p>';
};

const renderCourseDetails = (courseIndex) => {
  const course = courses[courseIndex];
  const todayClass = schedules.find(
    (schedule) => schedule.courseIndex === courseIndex && schedule.date === isoToday,
  );
  const submittedConfirmation = confirmations.find(
    (confirmation) => confirmation.studentId === activeStudent.id && confirmation.courseIndex === courseIndex && confirmation.date === isoToday,
  );
  const topics = course.topics
    .map(([name, description, state], index) => {
      const individuallyCompleted = (activeStudent.completions[courseIndex] || []).includes(name);
      const studentState = individuallyCompleted ? 'completed' : state;
      const icon = studentState === 'completed' ? '✓' : studentState === 'current' ? '●' : index + 1;
      const label = individuallyCompleted ? 'Completed by you' : studentState === 'completed' ? 'Completed in course' : studentState === 'current' ? 'Current topic' : 'Upcoming';
      return `<div class="topic-item ${studentState}">
        <div class="topic-icon">${icon}</div>
        <div class="topic-copy"><strong>${name}</strong><p>${description}</p></div>
        <span class="topic-status">${label}</span>
      </div>`;
    })
    .join('');
  const availableTopics = schedules
    .filter((schedule) => schedule.courseIndex === courseIndex && schedule.date === isoToday)
    .map((schedule) => `<option value="${schedule.topic}" ${todayClass?.topic === schedule.topic ? 'selected' : ''}>${schedule.topic}</option>`)
    .join('');
  const checkinContent = submittedConfirmation
    ? `<div class="checkin-success"><strong>✓ Today’s topic is confirmed.</strong><br>You completed <b>${submittedConfirmation.topic}</b> and shared your class feedback with your teacher.</div>`
    : todayClass
      ? `<p class="checkin-date">TODAY’S CLASS · ${todayClass.time}</p>
         <form id="topic-confirmation-form" class="confirmation-form">
           <label class="field-label" for="completed-topic">Topic completed today</label>
           <select class="select manager-select" id="completed-topic">${availableTopics}</select>
           <label class="field-label" for="student-comment">What did you like or learn in today’s class?</label>
           <textarea class="form-input" id="student-comment" required placeholder="Example: I liked practicing formulas with real examples."></textarea>
           <button class="confirm-button" type="submit">Confirm topic and submit feedback</button>
         </form>`
      : '<p class="empty-state">There is no class scheduled for this course today. Your teacher will add the next lesson schedule.</p>';

  document.querySelector('#course-detail-content').innerHTML = `
    <div class="course-detail-grid">
      <article class="card">
        <div class="course-overview">
          <div><h2>${course.name}</h2><p>${course.description}</p><p>${course.announcement}</p></div>
          <div class="progress-ring">${getStudentProgress(activeStudent, courseIndex)}%</div>
        </div>
        <h3 class="card-title">Course topics</h3>
        <p class="card-sub">Follow your learning path: completed topics, today’s class, and what comes next.</p>
        <div class="topic-list">${topics}</div>
      </article>
      <article class="card checkin-card">
        <h3 class="card-title">Confirm today’s class</h3>
        <p class="card-sub">After class, confirm the concepts and methods you learned.</p>
        ${checkinContent}
      </article>
    </div>`;

  const confirmationForm = document.querySelector('#topic-confirmation-form');
  if (!confirmationForm) return;
  confirmationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const completedTopic = document.querySelector('#completed-topic').value;
    const comment = document.querySelector('#student-comment').value.trim();
    confirmations.push({
      studentId: activeStudent.id,
      student: activeStudent.name,
      courseIndex,
      topic: completedTopic,
      comment,
      date: isoToday,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    const completedTopics = activeStudent.completions[courseIndex] || [];
    if (!completedTopics.includes(completedTopic)) completedTopics.push(completedTopic);
    activeStudent.completions[courseIndex] = completedTopics;
    activeStudent.progress[courseIndex] = Math.min(100, getStudentProgress(activeStudent, courseIndex) + 5);
    saveConfirmations();
    saveStudents();
    renderCourseDetails(courseIndex);
    renderCourses();
    renderDashboardCourses();
    renderTeacherConfirmations();
  });
};

const renderStudents = () => {
  const query = document.querySelector('#search').value.toLowerCase();
  const filter = document.querySelector('#course-filter').value;
  const visibleStudents = studentRecords.filter(
    (student) =>
      student.name.toLowerCase().includes(query) &&
      (filter === 'All courses' || student.enrollments.some((courseIndex) => courses[courseIndex].shortName === filter)),
  );

  document.querySelector('#student-table').innerHTML = visibleStudents
    .map(
      (student, index) => `
        <tr class="student-row" data-student-id="${student.id}">
          <td>
            <div class="student">
              <div class="mini-avatar a${(index % 3) + 1}">${student.initials}</div>
              ${student.name}
            </div>
          </td>
          <td>${student.enrollments.map((courseIndex) => courses[courseIndex].shortName).join(', ') || 'No course'}</td>
          <td>
            <span class="tprogress">
              <span class="progress"><i style="width:${Math.round(Object.values(student.progress).reduce((total, value) => total + value, 0) / Math.max(1, Object.values(student.progress).length))}%"></i></span>
            </span>
            ${Math.round(Object.values(student.progress).reduce((total, value) => total + value, 0) / Math.max(1, Object.values(student.progress).length))}%
          </td>
          <td>${student.attendance}%</td>
          <td><span class="badge ${student.attendance < 85 ? 'warn' : ''}">${student.attendance < 85 ? 'Needs attention' : 'On track'}</span></td>
        </tr>`,
    )
    .join('');
};

function showPage(page) {
  document.querySelectorAll('.page').forEach((element) => element.classList.remove('active'));
  document.querySelector(`#${page}`).classList.add('active');

  document.querySelectorAll('.nav button').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === page);
  });

  const teacherPages = ['students', 'student-detail', 'reports', 'topic-manager', 'schedule-manager'];
  const portal = teacherPages.includes(page) ? 'Teacher portal' : 'Student portal';
  document.querySelector('#crumb').textContent = `${portal} / ${page[0].toUpperCase()}${page.slice(1)}`;
}

const setRole = (role, name = '') => {
  const teacher = role === 'teacher';
  if (!teacher) {
    activeStudent = studentRecords.find((student) => student.name.toLowerCase() === name.toLowerCase()) || studentRecords[0];
    renderCourses();
    renderDashboardCourses();
    renderStudentSchedule();
  }
  document.querySelectorAll('[data-role-switch]').forEach((button) => {
    button.classList.toggle('active', button.dataset.roleSwitch === role);
  });
  document.querySelectorAll('.student-page').forEach((page) => {
    page.style.display = teacher ? 'none' : '';
  });
  document.querySelectorAll('.teacher-page, .teacher-only').forEach((page) => {
    page.style.display = teacher ? '' : 'none';
  });
  document.querySelector('#title').textContent = teacher
    ? `Welcome back, ${name || 'Priya'}!`
    : `Good morning, ${(name || 'Aanya').split(' ')[0]}!`;
  document.querySelector('#avatar').textContent = teacher ? 'PS' : 'AS';
  showPage(teacher ? 'students' : 'dashboard');
};

document.querySelectorAll('[data-page]').forEach((button) => {
  button.addEventListener('click', () => showPage(button.dataset.page));
});

document.querySelector('#course-list').addEventListener('click', (event) => {
  const courseButton = event.target.closest('[data-course]');
  if (!courseButton) return;
  renderCourseDetails(Number(courseButton.dataset.course));
  showPage('course-detail');
});

document.querySelectorAll('[data-role-switch]').forEach((button) => {
  button.addEventListener('click', () => {
    setRole(button.dataset.roleSwitch);
  });
});

let loginRole = 'student';
document.querySelectorAll('[data-login-role]').forEach((button) => {
  button.addEventListener('click', () => {
    loginRole = button.dataset.loginRole;
    document.querySelectorAll('[data-login-role]').forEach((roleButton) => {
      roleButton.classList.toggle('active', roleButton === button);
    });
    document.querySelector('#login-name').value = loginRole === 'teacher' ? 'Priya Sharma' : 'Aanya Sharma';
    document.querySelector('.login-button').textContent = `Sign in as ${loginRole}`;
  });
});

document.querySelector('#login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.body.classList.add('authenticated');
  setRole(loginRole, document.querySelector('#login-name').value.trim());
});

document.querySelector('#logout-button').addEventListener('click', () => {
  document.body.classList.remove('authenticated');
  document.querySelector('#login-password').value = '';
});

const renderTeacherTopics = () => {
  const courseSelect = document.querySelector('#teacher-course');
  const selectedCourse = courses[Number(courseSelect.value) || 0];
  document.querySelector('#teacher-topic-list').innerHTML = selectedCourse.topics
    .map(
      ([name, description, status], index) => `
        <div class="teacher-topic-item">
          <div><strong>${name}</strong><small>${description}</small></div>
          <span class="topic-status">${status}</span>
          ${status === 'completed' ? '' : `<button class="remove-topic" type="button" data-set-current="${index}">Set current</button>`}
          <button class="remove-topic" type="button" data-edit-topic="${index}">Edit</button>
          <button class="remove-topic" type="button" data-move-topic="${index}" data-direction="-1">↑</button>
          <button class="remove-topic" type="button" data-move-topic="${index}" data-direction="1">↓</button>
          <button class="remove-topic" type="button" data-remove-topic="${index}">Remove</button>
        </div>`,
    )
    .join('');
};

const renderTeacherConfirmations = () => {
  const recentConfirmations = confirmations.slice(-5).reverse();
  const container = document.querySelector('#teacher-confirmations');
  if (!container) return;
  container.innerHTML = recentConfirmations.length
    ? recentConfirmations
        .map(
          (confirmation) => `<div class="confirmation-item"><strong>${confirmation.student} · ${courses[confirmation.courseIndex].shortName}</strong><small>${confirmation.date} at ${confirmation.submittedAt} · ${confirmation.topic}</small><p>“${confirmation.comment}”</p></div>`,
        )
        .join('')
    : '<p class="empty-state">No student topic confirmations have been submitted yet.</p>';
};

const renderTeacherSchedule = () => {
  document.querySelector('#teacher-schedule-list').innerHTML = schedules.length
    ? schedules
        .slice()
        .sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`))
        .map(
          (schedule) => `<div class="teacher-topic-item"><div><strong>${courses[schedule.courseIndex].name}</strong><small>${schedule.topic} · ${schedule.date}, ${schedule.time}</small></div><button class="remove-topic" type="button" data-remove-schedule="${schedule.id}">Remove</button></div>`,
        )
        .join('')
    : '<p class="empty-state">No classes are scheduled yet.</p>';
};

const renderCourseManager = () => {
  const courseIndex = Number(teacherCourseSelect.value) || 0;
  const course = courses[courseIndex];
  document.querySelector('#course-description').value = course.description;
  document.querySelector('#course-announcement').value = course.announcement;
  document.querySelector('#course-day').value = course.day;
  document.querySelector('#course-time').value = course.time;
  renderBatchStudents();
};

const renderBatchStudents = () => {
  const courseIndex = Number(teacherCourseSelect.value) || 0;
  const search = document.querySelector('#batch-search').value.toLowerCase();
  const matches = (student) => student.name.toLowerCase().includes(search);
  const enrolled = studentRecords.filter((student) => isEnrolled(student, courseIndex) && matches(student));
  const available = studentRecords.filter((student) => !isEnrolled(student, courseIndex) && matches(student));
  document.querySelector('#enrollment-count').textContent = `${studentRecords.filter((student) => isEnrolled(student, courseIndex)).length} students enrolled in ${courses[courseIndex].shortName}`;
  document.querySelector('#batch-enrolled-list').innerHTML = enrolled.length
    ? enrolled.map((student) => `<label class="enrollment-row"><input type="checkbox" data-enrolled-student="${student.id}"><span>${student.name} · ${student.id}</span></label>`).join('')
    : '<p class="empty-state">No enrolled students match your search.</p>';
  document.querySelector('#batch-available-list').innerHTML = available.length
    ? available.map((student) => `<label class="enrollment-row"><input type="checkbox" data-available-student="${student.id}"><span>${student.name} · ${student.id}</span></label>`).join('')
    : '<p class="empty-state">No available students match your search.</p>';
};

const openStudentDetail = (studentId) => {
  const student = studentRecords.find((record) => record.id === studentId);
  if (!student) return;
  document.querySelector('#detail-student-id').value = student.id;
  document.querySelector('#student-detail-title').textContent = `${student.name} · ${student.id}`;
  document.querySelector('#detail-student-name').value = student.name;
  document.querySelector('#detail-attendance').value = student.attendance;
  document.querySelector('#detail-enrollments').innerHTML = courses
    .map((course, index) => `<label class="enrollment-row"><input type="checkbox" value="${index}" ${isEnrolled(student, index) ? 'checked' : ''}><span>${course.name}</span></label>`)
    .join('');
  const overrideCourse = document.querySelector('#override-course');
  overrideCourse.innerHTML = student.enrollments
    .map((courseIndex) => `<option value="${courseIndex}">${courses[courseIndex].name}</option>`)
    .join('');
  const selectedCourse = Number(overrideCourse.value);
  const schedule = getStudentSchedule(student, selectedCourse);
  document.querySelector('#override-day').value = schedule.day;
  document.querySelector('#override-time').value = schedule.time;
  showPage('student-detail');
};

const teacherCourseSelect = document.querySelector('#teacher-course');
teacherCourseSelect.innerHTML = courses
  .map((course, index) => `<option value="${index}">${course.name}</option>`)
  .join('');
teacherCourseSelect.addEventListener('change', () => {
  renderTeacherTopics();
  renderCourseManager();
});

document.querySelector('#teacher-topic-list').addEventListener('click', (event) => {
  const course = courses[Number(teacherCourseSelect.value)];
  const editButton = event.target.closest('[data-edit-topic]');
  if (editButton) {
    const topic = course.topics[Number(editButton.dataset.editTopic)];
    const name = window.prompt('Topic name', topic[0]);
    if (name === null || !name.trim()) return;
    const description = window.prompt('Topic description', topic[1]);
    if (description === null) return;
    topic[0] = name.trim();
    topic[1] = description.trim();
    saveTopics();
    renderTeacherTopics();
    renderCourses();
    return;
  }
  const moveButton = event.target.closest('[data-move-topic]');
  if (moveButton) {
    const from = Number(moveButton.dataset.moveTopic);
    const to = from + Number(moveButton.dataset.direction);
    if (to < 0 || to >= course.topics.length) return;
    [course.topics[from], course.topics[to]] = [course.topics[to], course.topics[from]];
    saveTopics();
    renderTeacherTopics();
    renderCourses();
    return;
  }
  const setCurrentButton = event.target.closest('[data-set-current]');
  if (setCurrentButton) {
    course.topics.forEach((topic, index) => {
      if (topic[2] === 'current') topic[2] = 'upcoming';
      if (index === Number(setCurrentButton.dataset.setCurrent)) topic[2] = 'current';
    });
    saveTopics();
    renderTeacherTopics();
    renderCourses();
    renderDashboardCourses();
    return;
  }
  const removeButton = event.target.closest('[data-remove-topic]');
  if (!removeButton) return;
  course.topics.splice(Number(removeButton.dataset.removeTopic), 1);
  saveTopics();
  renderTeacherTopics();
  renderCourses();
  renderDashboardCourses();
});

document.querySelector('#add-topic-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const course = courses[Number(teacherCourseSelect.value)];
  const name = document.querySelector('#topic-name').value.trim();
  const description = document.querySelector('#topic-description').value.trim();
  const status = document.querySelector('#topic-status').value;
  if (status === 'current') {
    course.topics.forEach((topic) => {
      if (topic[2] === 'current') topic[2] = 'upcoming';
    });
  }
  course.topics.push([name, description, status]);
  saveTopics();
  event.target.reset();
  renderTeacherTopics();
  renderCourses();
  renderDashboardCourses();
});

document.querySelector('#course-settings-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const course = courses[Number(teacherCourseSelect.value) || 0];
  course.description = document.querySelector('#course-description').value.trim();
  course.announcement = document.querySelector('#course-announcement').value.trim();
  course.day = document.querySelector('#course-day').value;
  course.time = document.querySelector('#course-time').value;
  saveCourseSettings();
  renderCourses();
  renderDashboardCourses();
  renderStudentSchedule();
});

document.querySelector('#batch-search').addEventListener('input', renderBatchStudents);
document.querySelector('#add-enrolled').addEventListener('click', () => {
  const courseIndex = Number(teacherCourseSelect.value) || 0;
  document.querySelectorAll('[data-available-student]:checked').forEach((checkbox) => {
    const student = studentRecords.find((record) => record.id === checkbox.dataset.availableStudent);
    if (!student || isEnrolled(student, courseIndex)) return;
    student.enrollments.push(courseIndex);
    student.progress[courseIndex] = 0;
    student.completions[courseIndex] = [];
  });
  saveStudents();
  renderBatchStudents();
  renderStudents();
});

document.querySelector('#remove-enrolled').addEventListener('click', () => {
  const courseIndex = Number(teacherCourseSelect.value) || 0;
  document.querySelectorAll('[data-enrolled-student]:checked').forEach((checkbox) => {
    const student = studentRecords.find((record) => record.id === checkbox.dataset.enrolledStudent);
    if (!student) return;
    student.enrollments = student.enrollments.filter((index) => index !== courseIndex);
    delete student.scheduleOverrides[courseIndex];
  });
  saveStudents();
  renderBatchStudents();
  renderStudents();
});

document.querySelector('#student-table').addEventListener('click', (event) => {
  const row = event.target.closest('[data-student-id]');
  if (row) openStudentDetail(row.dataset.studentId);
});

document.querySelector('#student-detail-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const student = studentRecords.find((record) => record.id === document.querySelector('#detail-student-id').value);
  if (!student) return;
  student.name = document.querySelector('#detail-student-name').value.trim();
  student.attendance = Number(document.querySelector('#detail-attendance').value);
  const previousEnrollments = [...student.enrollments];
  student.enrollments = [...document.querySelectorAll('#detail-enrollments input:checked')].map((checkbox) => Number(checkbox.value));
  student.enrollments.forEach((courseIndex) => {
    if (!previousEnrollments.includes(courseIndex)) {
      student.progress[courseIndex] = 0;
      student.completions[courseIndex] = [];
    }
  });
  previousEnrollments.filter((courseIndex) => !student.enrollments.includes(courseIndex)).forEach((courseIndex) => {
    delete student.scheduleOverrides[courseIndex];
  });
  saveStudents();
  renderStudents();
  renderBatchStudents();
  openStudentDetail(student.id);
});

document.querySelector('#override-course').addEventListener('change', () => {
  const student = studentRecords.find((record) => record.id === document.querySelector('#detail-student-id').value);
  const schedule = getStudentSchedule(student, Number(document.querySelector('#override-course').value));
  document.querySelector('#override-day').value = schedule.day;
  document.querySelector('#override-time').value = schedule.time;
});

document.querySelector('#student-override-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const student = studentRecords.find((record) => record.id === document.querySelector('#detail-student-id').value);
  const courseIndex = Number(document.querySelector('#override-course').value);
  student.scheduleOverrides[courseIndex] = { day: document.querySelector('#override-day').value, time: document.querySelector('#override-time').value };
  saveStudents();
});

document.querySelector('#clear-override').addEventListener('click', () => {
  const student = studentRecords.find((record) => record.id === document.querySelector('#detail-student-id').value);
  const courseIndex = Number(document.querySelector('#override-course').value);
  delete student.scheduleOverrides[courseIndex];
  saveStudents();
  openStudentDetail(student.id);
});

const scheduleCourseSelect = document.querySelector('#schedule-course');
const scheduleTopicSelect = document.querySelector('#schedule-topic');
const renderScheduleTopicOptions = () => {
  const courseIndex = Number(scheduleCourseSelect.value);
  const options = classTopicOptions(courseIndex);
  scheduleTopicSelect.innerHTML = options.length
    ? options.map((topic) => `<option value="${topic}">${topic}</option>`).join('')
    : '<option value="">No unfinished topics available</option>';
};

scheduleCourseSelect.innerHTML = courses
  .map((course, index) => `<option value="${index}">${course.name}</option>`)
  .join('');
document.querySelector('#schedule-date').value = isoToday;
scheduleCourseSelect.addEventListener('change', renderScheduleTopicOptions);
renderScheduleTopicOptions();

document.querySelector('#add-schedule-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const topic = scheduleTopicSelect.value;
  if (!topic) return;
  schedules.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    courseIndex: Number(scheduleCourseSelect.value),
    topic,
    date: document.querySelector('#schedule-date').value,
    time: document.querySelector('#schedule-time').value,
  });
  saveSchedules();
  renderTeacherSchedule();
  renderStudentSchedule();
});

document.querySelector('#teacher-schedule-list').addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove-schedule]');
  if (!removeButton) return;
  schedules = schedules.filter((schedule) => schedule.id !== removeButton.dataset.removeSchedule);
  saveSchedules();
  renderTeacherSchedule();
  renderStudentSchedule();
});

document.querySelector('#search').addEventListener('input', renderStudents);
document.querySelector('#course-filter').addEventListener('change', renderStudents);

renderCourses();
renderDashboardCourses();
renderStudents();
renderTeacherTopics();
renderCourseManager();
renderStudentSchedule();
renderTeacherSchedule();
renderTeacherConfirmations();
