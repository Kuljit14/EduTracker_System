const API_BASE = window.location.origin.startsWith('http') ? '/api' : 'http://localhost:8080/api';

// Automatic purge of obsolete demo data from localStorage
(function cleanLegacyDemoStorage() {
  try {
    const s = localStorage.getItem('eduTrack-students');
    if (s && s.includes('Aanya Sharma')) {
      localStorage.removeItem('eduTrack-students');
      localStorage.removeItem('eduTrack-course-topics');
      localStorage.removeItem('eduTrack-course-settings');
      localStorage.removeItem('eduTrack-schedules');
      localStorage.removeItem('eduTrack-confirmations');
    }
  } catch (e) {
    console.warn('Storage reset check:', e);
  }
})();

const studentsStorageKey = 'aimtTrack-students';
const topicsStorageKey = 'aimtTrack-course-topics';
const courseSettingsStorageKey = 'aimtTrack-course-settings';
const schedulesStorageKey = 'aimtTrack-schedules';
const confirmationsStorageKey = 'aimtTrack-confirmations';
const teacherAuthStorageKey = 'aimtTrack-teacher-auth';
const noticesStorageKey = 'aimtTrack-notices';

const loadStorageItem = (key, fallbackKey) => {
  return localStorage.getItem(key) || (fallbackKey ? localStorage.getItem(fallbackKey) : null);
};

let studentRecords = JSON.parse(loadStorageItem(studentsStorageKey, 'eduTrack-students') || 'null') || [];
// Guarantee each student has a password (default aimt@123)
studentRecords.forEach((s) => {
  if (!s.password) s.password = 'aimt@123';
});

let activeStudent = studentRecords[0] || null;
let courses = JSON.parse(loadStorageItem(topicsStorageKey, 'eduTrack-course-topics') || 'null') || [];
const isoToday = new Date().toISOString().slice(0, 10);
let schedules = JSON.parse(loadStorageItem(schedulesStorageKey, 'eduTrack-schedules') || 'null') || [];
let confirmations = JSON.parse(loadStorageItem(confirmationsStorageKey, 'eduTrack-confirmations') || 'null') || [];

// Teacher Authentication Storage
const defaultTeacherAuth = {
  id: 'TEACHER',
  name: 'Faculty Admin',
  password: 'aimt@teacher',
};

const getTeacherAuth = () => {
  try {
    const raw = localStorage.getItem(teacherAuthStorageKey);
    return raw ? JSON.parse(raw) : { ...defaultTeacherAuth };
  } catch (e) {
    return { ...defaultTeacherAuth };
  }
};

const saveTeacherAuth = (auth) => {
  localStorage.setItem(teacherAuthStorageKey, JSON.stringify(auth));
};

// Notice Board Storage & Defaults
const defaultNotices = [
  {
    id: 'not-1',
    title: 'Semester Mid-Term Examinations Schedule',
    category: 'Academic',
    date: '2026-09-15',
    content: 'Mid-term assessments for all certified diploma and degree programs will commence from September 15th. Check course portals for syllabus breakdown.',
    postedBy: 'Academic Cell',
  },
  {
    id: 'not-2',
    title: 'Campus Closed on Friday - Public Holiday',
    category: 'Holiday',
    date: '2026-09-12',
    content: 'The institute premises will remain closed on Friday for the declared state holiday. Scheduled laboratory catch-ups will be shifted to Saturday.',
    postedBy: 'Administration',
  },
  {
    id: 'not-3',
    title: 'Annual Tech Innovation Fair 2026 Registration',
    category: 'Event',
    date: '2026-09-25',
    content: 'Register your project teams at the department desk by September 20th. Cash rewards and industry recognition certificates will be awarded to top 3 projects.',
    postedBy: 'Dean Academics',
  },
];

let notices = [];
try {
  const rawNotices = localStorage.getItem(noticesStorageKey);
  notices = rawNotices ? JSON.parse(rawNotices) : defaultNotices;
} catch (e) {
  notices = defaultNotices;
}

const saveNotices = () => {
  localStorage.setItem(noticesStorageKey, JSON.stringify(notices));
};

const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
};

// Cryptographic hash helper for safe password storage
const sha256Hex = async (str) => {
  if (!str) return '';
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(String(str));
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto error, falling back:', e);
  }
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'shash_' + Math.abs(hash);
};

const verifyPassword = async (inputPw, storedPw) => {
  if (!inputPw || !storedPw) return false;
  if (inputPw === storedPw) return true;
  const hashedInput = await sha256Hex(inputPw);
  return hashedInput === storedPw;
};

const saveStudents = () => {
  localStorage.setItem(studentsStorageKey, JSON.stringify(studentRecords));
  localStorage.setItem('eduTrack-students', JSON.stringify(studentRecords));
};
const saveCourses = () => {
  localStorage.setItem(topicsStorageKey, JSON.stringify(courses));
  localStorage.setItem('eduTrack-course-topics', JSON.stringify(courses));
};
const saveSchedules = () => {
  localStorage.setItem(schedulesStorageKey, JSON.stringify(schedules));
  localStorage.setItem('eduTrack-schedules', JSON.stringify(schedules));
};
const saveConfirmations = () => {
  localStorage.setItem(confirmationsStorageKey, JSON.stringify(confirmations));
  localStorage.setItem('eduTrack-confirmations', JSON.stringify(confirmations));
};

// Normalize topics
const normalizeTopics = (topics) => {
  if (!topics) return [];
  return topics.map(t => {
    if (Array.isArray(t)) {
      return { name: t[0], description: t[1], status: t[2] };
    }
    return t;
  });
};

courses.forEach(c => { c.topics = normalizeTopics(c.topics); });

// Safe helpers
const getStudentProgress = (student, courseIndex) => {
  if (!student || !student.progress) return 0;
  return student.progress[courseIndex] ?? 0;
};

const isEnrolled = (student, courseIndex) => {
  return Boolean(student && Array.isArray(student.enrollments) && student.enrollments.includes(courseIndex));
};

const getStudentSchedule = (student, courseIndex) => {
  if (student && student.scheduleOverrides && student.scheduleOverrides[courseIndex]) {
    return student.scheduleOverrides[courseIndex];
  }
  if (courses[courseIndex]) {
    return {
      day: courses[courseIndex].day || 'Monday',
      time: courses[courseIndex].time || '10:00',
    };
  }
  return { day: 'Monday', time: '10:00' };
};

const classTopicOptions = (courseIndex) => {
  if (!courses[courseIndex] || !Array.isArray(courses[courseIndex].topics)) return [];
  return courses[courseIndex].topics
    .filter((topic) => topic.status !== 'completed')
    .map((topic) => topic.name);
};

// Backend sync
async function loadBackendData() {
  try {
    const [cRes, sRes, schRes, confRes] = await Promise.all([
      fetch(`${API_BASE}/courses`).catch(() => null),
      fetch(`${API_BASE}/students`).catch(() => null),
      fetch(`${API_BASE}/schedules`).catch(() => null),
      fetch(`${API_BASE}/confirmations`).catch(() => null),
    ]);

    if (cRes && cRes.ok) {
      const data = await cRes.json();
      if (Array.isArray(data)) {
        courses = data.map(c => ({ ...c, topics: normalizeTopics(c.topics) }));
        saveCourses();
      }
    }

    if (sRes && sRes.ok) {
      const data = await sRes.json();
      if (Array.isArray(data)) {
        studentRecords = data;
        studentRecords.forEach((s) => {
          if (!s.password) s.password = 'aimt@123';
        });
        saveStudents();
        if (activeStudent) {
          activeStudent = studentRecords.find(s => s.id === activeStudent.id) || studentRecords[0] || null;
        } else {
          activeStudent = studentRecords[0] || null;
        }
      }
    }

    if (schRes && schRes.ok) {
      const data = await schRes.json();
      if (Array.isArray(data)) {
        schedules = data;
        saveSchedules();
      }
    }

    if (confRes && confRes.ok) {
      const data = await confRes.json();
      if (Array.isArray(data)) {
        confirmations = data;
        saveConfirmations();
      }
    }
  } catch (err) {
    console.warn('Running with client state:', err);
  }

  renderAllViews();
}

// Student Portal Views
const renderCourses = () => {
  const container = document.querySelector('#course-list');
  if (!container) return;
  if (!activeStudent) {
    container.innerHTML = '<p class="empty-state">No student profile active. Please sign in with your student name.</p>';
    return;
  }
  const enrolledCourses = courses.filter((course, index) => isEnrolled(activeStudent, index));
  container.innerHTML = enrolledCourses.length
    ? courses
        .map((course, index) => {
          if (!isEnrolled(activeStudent, index)) return '';
          const prog = getStudentProgress(activeStudent, index);
          const sched = getStudentSchedule(activeStudent, index);
          return `
        <button class="course course-button" type="button" data-course="${index}">
          <div class="course-row">
            <div>
              <div class="course-name">${escapeHtml(course.name)}</div>
              <div class="course-meta">${escapeHtml(course.description || '')} · ${escapeHtml(sched.day)}, ${escapeHtml(sched.time)}</div>
            </div>
            <div><span class="score">${escapeHtml(prog)}%</span><span class="course-arrow">→</span></div>
          </div>
          <div class="progress"><i style="width:${escapeHtml(prog)}%"></i></div>
        </button>`;
        })
        .join('')
    : '<p class="empty-state">You are not enrolled in any courses yet.</p>';
};

const renderDashboardCourses = () => {
  const container = document.querySelector('#dashboard-course-list');
  if (!container) return;
  if (!activeStudent) {
    container.innerHTML = '<p class="empty-state">No course progress to display.</p>';
    return;
  }
  const items = courses
    .map((course, index) => {
      if (!isEnrolled(activeStudent, index)) return '';
      const prog = getStudentProgress(activeStudent, index);
      const sched = getStudentSchedule(activeStudent, index);
      return `<div class="course"><div class="course-row"><div><div class="course-name">${escapeHtml(course.name)}</div><div class="course-meta">${escapeHtml(sched.day)} · ${escapeHtml(sched.time)}</div></div><div class="score">${escapeHtml(prog)}%</div></div><div class="progress"><i style="width:${escapeHtml(prog)}%"></i></div></div>`;
    })
    .filter(Boolean);

  container.innerHTML = items.length
    ? items.slice(0, 3).join('')
    : '<p class="empty-state">No enrolled courses yet.</p>';
};

const renderStudentSchedule = () => {
  const container = document.querySelector('#student-schedule');
  if (!container) return;
  if (!activeStudent) {
    container.innerHTML = '<p class="empty-state">Sign in to view today’s class schedule.</p>';
    return;
  }
  const items = courses
    .map((course, index) => {
      if (!isEnrolled(activeStudent, index)) return '';
      const nextLesson = schedules.find((s) => s.courseIndex === index);
      const sched = getStudentSchedule(activeStudent, index);
      const nextTopicText = nextLesson ? `Next topic: ${escapeHtml(nextLesson.topic)}` : escapeHtml(course.announcement || 'No announcement');
      return `<div class="schedule-row"><div><strong>${escapeHtml(course.name)}</strong><small>${nextTopicText}</small></div><span class="schedule-time">${escapeHtml(sched.day)} · ${escapeHtml(sched.time)}</span></div>`;
    })
    .filter(Boolean);

  container.innerHTML = items.length
    ? items.join('')
    : '<p class="empty-state">No scheduled classes for today.</p>';
};

const updateStudentDashboardMetrics = () => {
  if (!activeStudent) {
    const pSub = document.querySelector('#student-progress-summary');
    if (pSub) pSub.textContent = 'Welcome! Enter your name to view your enrolled courses.';
    const avgEl = document.querySelector('#student-overall-avg');
    if (avgEl) avgEl.textContent = '0.0 / 10';
    const mProg = document.querySelector('#metric-progress');
    if (mProg) mProg.textContent = '0%';
    const mAtt = document.querySelector('#metric-attendance');
    if (mAtt) mAtt.textContent = '--%';
    return;
  }

  const enrolled = courses.filter((_, idx) => isEnrolled(activeStudent, idx));
  const avgProg = enrolled.length
    ? Math.round(enrolled.reduce((sum, _, idx) => sum + getStudentProgress(activeStudent, idx), 0) / enrolled.length)
    : 0;

  const pSub = document.querySelector('#student-progress-summary');
  if (pSub) pSub.textContent = `You have completed ${avgProg}% of your enrolled course plans.`;
  const avgEl = document.querySelector('#student-overall-avg');
  if (avgEl) avgEl.textContent = `${(avgProg / 10).toFixed(1)} / 10`;
  const mProg = document.querySelector('#metric-progress');
  if (mProg) mProg.textContent = `${avgProg}%`;
  const mProgSub = document.querySelector('#metric-progress-sub');
  if (mProgSub) mProgSub.textContent = enrolled.length ? `${enrolled.length} courses enrolled` : 'No courses enrolled';
  const mAtt = document.querySelector('#metric-attendance');
  if (mAtt) mAtt.textContent = `${activeStudent.attendance ?? 100}%`;
  const mAttSub = document.querySelector('#metric-attendance-sub');
  if (mAttSub) mAttSub.textContent = (activeStudent.attendance ?? 100) >= 85 ? 'Good attendance' : 'Needs improvement';

  const userConfirmations = confirmations.filter(c => c.studentId === activeStudent.id);
  const mAssign = document.querySelector('#metric-assignments');
  if (mAssign) mAssign.textContent = userConfirmations.length;

  const nextSched = schedules.find(s => isEnrolled(activeStudent, s.courseIndex));
  const mNext = document.querySelector('#metric-next-assessment');
  if (mNext) mNext.textContent = nextSched ? nextSched.date : 'None';
  const mNextSub = document.querySelector('#metric-next-assessment-sub');
  if (mNextSub) mNextSub.textContent = nextSched ? (courses[nextSched.courseIndex]?.shortName || 'Class') : 'Upcoming';
};

const renderCourseDetails = (courseIndex) => {
  const course = courses[courseIndex];
  if (!course) return;
  const todayClass = schedules.find(
    (schedule) => schedule.courseIndex === courseIndex && schedule.date === isoToday,
  );
  const submittedConfirmation = confirmations.find(
    (c) => activeStudent && c.studentId === activeStudent.id && c.courseIndex === courseIndex && c.date === isoToday,
  );
  const topicsList = Array.isArray(course.topics) ? course.topics : [];
  const topics = topicsList.length
    ? topicsList
        .map((topic, index) => {
          const studentCompletions = (activeStudent && activeStudent.completions && activeStudent.completions[courseIndex]) || [];
          const individuallyCompleted = studentCompletions.includes(topic.name);
          const studentState = individuallyCompleted ? 'completed' : topic.status;
          const icon = studentState === 'completed' ? '✓' : studentState === 'current' ? '●' : index + 1;
          const label = individuallyCompleted ? 'Completed by you' : studentState === 'completed' ? 'Completed in course' : studentState === 'current' ? 'Current topic' : 'Upcoming';
          return `<div class="topic-item ${escapeHtml(studentState)}">
            <div class="topic-icon">${escapeHtml(icon)}</div>
            <div class="topic-copy"><strong>${escapeHtml(topic.name)}</strong><p>${escapeHtml(topic.description || '')}</p></div>
            <span class="topic-status">${escapeHtml(label)}</span>
          </div>`;
        })
        .join('')
    : '<p class="empty-state">No topics added to this course yet.</p>';

  const availableTopics = schedules
    .filter((schedule) => schedule.courseIndex === courseIndex && schedule.date === isoToday)
    .map((schedule) => `<option value="${escapeHtml(schedule.topic)}" ${todayClass?.topic === schedule.topic ? 'selected' : ''}>${escapeHtml(schedule.topic)}</option>`)
    .join('');

  const checkinContent = submittedConfirmation
    ? `<div class="checkin-success"><strong>✓ Today’s topic is confirmed.</strong><br>You completed <b>${escapeHtml(submittedConfirmation.topic)}</b> and shared your class feedback with your teacher.</div>`
    : todayClass
      ? `<p class="checkin-date">TODAY’S CLASS · ${escapeHtml(todayClass.time)}</p>
         <form id="topic-confirmation-form" class="confirmation-form">
           <label class="field-label" for="completed-topic">Topic completed today</label>
           <select class="select manager-select" id="completed-topic">${availableTopics}</select>
           <label class="field-label" for="student-comment">What did you learn in today’s class?</label>
           <textarea class="form-input" id="student-comment" required placeholder="Describe what you learned or practiced."></textarea>
           <button class="confirm-button" type="submit">Confirm topic and submit feedback</button>
         </form>`
      : '<p class="empty-state">There is no class scheduled for this course today.</p>';

  document.querySelector('#course-detail-content').innerHTML = `
    <div class="course-detail-grid">
      <article class="card">
        <div class="course-overview">
          <div><h2>${escapeHtml(course.name)}</h2><p>${escapeHtml(course.description || '')}</p><p>${escapeHtml(course.announcement || '')}</p></div>
          <div class="progress-ring">${escapeHtml(getStudentProgress(activeStudent, courseIndex))}%</div>
        </div>
        <h3 class="card-title">Course topics</h3>
        <p class="card-sub">Follow your learning path: completed topics, current lesson, and upcoming topics.</p>
        <div class="topic-list">${topics}</div>
      </article>
      <article class="card checkin-card">
        <h3 class="card-title">Confirm today’s class</h3>
        <p class="card-sub">After class, confirm the concepts and skills you learned.</p>
        ${checkinContent}
      </article>
    </div>`;

  const confirmationForm = document.querySelector('#topic-confirmation-form');
  if (!confirmationForm) return;
  confirmationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeStudent) return;
    const completedTopic = document.querySelector('#completed-topic').value;
    const comment = document.querySelector('#student-comment').value.trim();
    const payload = {
      studentId: activeStudent.id,
      student: activeStudent.name,
      courseIndex,
      topic: completedTopic,
      comment,
      date: isoToday,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    confirmations.push(payload);
    if (!activeStudent.completions) activeStudent.completions = {};
    const completedTopics = activeStudent.completions[courseIndex] || [];
    if (!completedTopics.includes(completedTopic)) completedTopics.push(completedTopic);
    activeStudent.completions[courseIndex] = completedTopics;
    if (!activeStudent.progress) activeStudent.progress = {};
    activeStudent.progress[courseIndex] = Math.min(100, getStudentProgress(activeStudent, courseIndex) + 5);
    saveConfirmations();
    saveStudents();

    renderCourseDetails(courseIndex);
    renderCourses();
    renderDashboardCourses();
    renderTeacherConfirmations();
    updateStudentDashboardMetrics();

    fetch(`${API_BASE}/confirmations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(console.warn);
  });
};

// Teacher Portal Views
const renderStudents = () => {
  const query = (document.querySelector('#search')?.value || '').toLowerCase();
  const filter = document.querySelector('#course-filter')?.value || 'All courses';
  const visibleStudents = studentRecords.filter(
    (student) =>
      student.name.toLowerCase().includes(query) &&
      (filter === 'All courses' || (Array.isArray(student.enrollments) && student.enrollments.some((cIdx) => courses[cIdx] && courses[cIdx].shortName === filter))),
  );

  const total = studentRecords.length;
  const avgAttendance = total
    ? Math.round(studentRecords.reduce((sum, s) => sum + (s.attendance || 0), 0) / total)
    : 0;
  const needAttention = studentRecords.filter((s) => (s.attendance || 0) < 85).length;

  const elTot = document.querySelector('#teacher-total-students');
  if (elTot) elTot.textContent = total;
  const elAvg = document.querySelector('#teacher-avg-attendance');
  if (elAvg) elAvg.textContent = total ? `${avgAttendance}%` : '--%';
  const elAtt = document.querySelector('#teacher-attention-count');
  if (elAtt) elAtt.textContent = needAttention;

  const tableBody = document.querySelector('#student-table');
  if (!tableBody) return;

  tableBody.innerHTML = visibleStudents.length
    ? visibleStudents
        .map((student, index) => {
          const progs = student.progress ? Object.values(student.progress) : [];
          const avgP = progs.length ? Math.round(progs.reduce((a, b) => a + b, 0) / progs.length) : 0;
          const courseNames = Array.isArray(student.enrollments)
            ? student.enrollments.map((idx) => courses[idx]?.shortName || '').filter(Boolean).map(escapeHtml).join(', ')
            : '';
          return `
        <tr class="student-row" data-student-id="${escapeHtml(student.id)}">
          <td>
            <div class="student">
              <div class="mini-avatar a${(index % 3) + 1}">${escapeHtml(student.initials || 'ST')}</div>
              ${escapeHtml(student.name)}
            </div>
          </td>
          <td>${courseNames || 'No course'}</td>
          <td>
            <span class="tprogress">
              <span class="progress"><i style="width:${escapeHtml(avgP)}%"></i></span>
            </span>
            ${escapeHtml(avgP)}%
          </td>
          <td>${escapeHtml(student.attendance ?? 100)}%</td>
          <td><span class="badge ${(student.attendance ?? 100) < 85 ? 'warn' : ''}">${(student.attendance ?? 100) < 85 ? 'Needs attention' : 'On track'}</span></td>
          <td style="text-align:center;">
            <button class="table-action-btn" data-edit-student="${escapeHtml(student.id)}" type="button">✏️ Edit</button>
          </td>
        </tr>`;
        })
        .join('')
    : `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted);">No students registered yet. Click "+ Add Student" to register a student.</td></tr>`;
};

const renderTeacherTopics = () => {
  const courseSelect = document.querySelector('#teacher-course');
  const listEl = document.querySelector('#teacher-topic-list');
  if (!courseSelect || !listEl) return;
  if (!courses.length) {
    listEl.innerHTML = '<p class="empty-state">No courses available. Click "+ Create New Course" above.</p>';
    return;
  }
  const selectedCourse = courses[Number(courseSelect.value) || 0];
  if (!selectedCourse || !Array.isArray(selectedCourse.topics) || !selectedCourse.topics.length) {
    listEl.innerHTML = '<p class="empty-state">No topics added to this course yet. Use the form on the right to add topics.</p>';
    return;
  }
  listEl.innerHTML = selectedCourse.topics
    .map(
      (topic, index) => `
        <div class="teacher-topic-item">
          <div><strong>${escapeHtml(topic.name)}</strong><small>${escapeHtml(topic.description || '')}</small></div>
          <span class="topic-status">${escapeHtml(topic.status)}</span>
          ${topic.status === 'completed' ? '' : `<button class="remove-topic" type="button" data-set-current="${index}">Set current</button>`}
          <button class="remove-topic" type="button" data-edit-topic="${index}">Edit</button>
          <button class="remove-topic" type="button" data-move-topic="${index}" data-direction="-1">↑</button>
          <button class="remove-topic" type="button" data-move-topic="${index}" data-direction="1">↓</button>
          <button class="remove-topic" type="button" data-remove-topic="${index}">Remove</button>
        </div>`,
    )
    .join('');
};

const renderTeacherConfirmations = () => {
  const container = document.querySelector('#teacher-confirmations');
  if (!container) return;
  const recentConfirmations = confirmations.slice(-5).reverse();
  container.innerHTML = recentConfirmations.length
    ? recentConfirmations
        .map(
          (c) => `<div class="confirmation-item"><strong>${escapeHtml(c.student)} · ${escapeHtml((courses[c.courseIndex] || {}).shortName || '')}</strong><small>${escapeHtml(c.date)} at ${escapeHtml(c.submittedAt)} · ${escapeHtml(c.topic)}</small><p>“${escapeHtml(c.comment)}”</p></div>`,
        )
        .join('')
    : '<p class="empty-state">No student topic confirmations have been submitted yet.</p>';
};

const renderTeacherSchedule = () => {
  const container = document.querySelector('#teacher-schedule-list');
  if (!container) return;
  container.innerHTML = schedules.length
    ? schedules
        .slice()
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .map(
          (s) => `<div class="teacher-topic-item"><div><strong>${escapeHtml((courses[s.courseIndex] || {}).name || '')}</strong><small>${escapeHtml(s.topic)} · ${escapeHtml(s.date)}, ${escapeHtml(s.time)}</small></div><button class="remove-topic" type="button" data-remove-schedule="${escapeHtml(s.id)}">Remove</button></div>`,
        )
        .join('')
    : '<p class="empty-state">No classes are scheduled yet.</p>';
};

const renderCourseManager = () => {
  const teacherCourseSelect = document.querySelector('#teacher-course');
  if (!teacherCourseSelect) return;
  if (!courses.length) {
    document.querySelector('#course-description').value = '';
    document.querySelector('#course-announcement').value = '';
    renderBatchStudents();
    return;
  }
  const courseIndex = Number(teacherCourseSelect.value) || 0;
  const course = courses[courseIndex];
  if (!course) return;
  document.querySelector('#course-description').value = course.description || '';
  document.querySelector('#course-announcement').value = course.announcement || '';
  document.querySelector('#course-day').value = course.day || 'Monday';
  document.querySelector('#course-time').value = course.time || '10:00';
  renderBatchStudents();
};

let activeBatchTab = 'enrolled';

const flashBatchAlert = (msg, type = 'success') => {
  const alertEl = document.querySelector('#batch-action-alert');
  if (!alertEl) return;
  alertEl.className = `login-alert alert-${type}`;
  alertEl.textContent = msg;
  alertEl.style.display = 'block';
  setTimeout(() => {
    if (alertEl) alertEl.style.display = 'none';
  }, 3500);
};

const renderBatchStudents = () => {
  const teacherCourseSelect = document.querySelector('#teacher-course');
  if (!teacherCourseSelect) return;

  const enrolledCountEl = document.querySelector('#enrollment-count');
  const enrolledBadge = document.querySelector('#batch-enrolled-badge');
  const availableBadge = document.querySelector('#batch-available-badge');
  const tabEnrolledCount = document.querySelector('#count-batch-enrolled');
  const tabAvailableCount = document.querySelector('#count-batch-available');
  const enrolledList = document.querySelector('#batch-enrolled-list');
  const availableList = document.querySelector('#batch-available-list');

  if (!courses.length) {
    if (enrolledCountEl) enrolledCountEl.textContent = '0 students enrolled';
    if (enrolledBadge) enrolledBadge.textContent = '0 Enrolled';
    if (availableBadge) availableBadge.textContent = '0 Available';
    if (tabEnrolledCount) tabEnrolledCount.textContent = '0';
    if (tabAvailableCount) tabAvailableCount.textContent = '0';
    if (enrolledList) enrolledList.innerHTML = '<p class="empty-state">No courses available. Create a course first.</p>';
    if (availableList) availableList.innerHTML = '<p class="empty-state">No courses available. Create a course first.</p>';
    return;
  }

  const courseIndex = Number(teacherCourseSelect.value) || 0;
  const course = courses[courseIndex];
  const search = (document.querySelector('#batch-search')?.value || '').toLowerCase().trim();

  const matches = (s) => {
    if (!search) return true;
    return (s.name && s.name.toLowerCase().includes(search)) || (s.id && s.id.toLowerCase().includes(search));
  };

  const allEnrolled = studentRecords.filter((s) => isEnrolled(s, courseIndex));
  const allAvailable = studentRecords.filter((s) => !isEnrolled(s, courseIndex));

  const visibleEnrolled = allEnrolled.filter(matches);
  const visibleAvailable = allAvailable.filter(matches);

  if (enrolledCountEl) {
    enrolledCountEl.textContent = `${allEnrolled.length} student${allEnrolled.length === 1 ? '' : 's'} enrolled in ${course ? course.shortName : 'Course'}`;
  }
  if (enrolledBadge) enrolledBadge.textContent = `${allEnrolled.length} Enrolled`;
  if (availableBadge) availableBadge.textContent = `${allAvailable.length} Available`;
  if (tabEnrolledCount) tabEnrolledCount.textContent = allEnrolled.length;
  if (tabAvailableCount) tabAvailableCount.textContent = allAvailable.length;

  // Render Enrolled List
  if (enrolledList) {
    if (!allEnrolled.length) {
      enrolledList.innerHTML = '<p class="empty-state" style="padding:22px 0;text-align:center;">No students enrolled in this course yet. Switch to "Available to Enroll" to add students.</p>';
    } else if (!visibleEnrolled.length) {
      enrolledList.innerHTML = '<p class="empty-state" style="padding:22px 0;text-align:center;">No enrolled students match your search.</p>';
    } else {
      enrolledList.innerHTML = visibleEnrolled.map((s) => {
        const prog = s.progress && s.progress[courseIndex] !== undefined ? s.progress[courseIndex] : 0;
        return `
          <div class="batch-student-item" data-student-id="${escapeHtml(s.id)}">
            <div class="batch-student-left">
              <input type="checkbox" data-enrolled-student="${escapeHtml(s.id)}" title="Select student">
              <div class="batch-student-avatar">${escapeHtml(s.initials || 'ST')}</div>
              <div class="batch-student-meta">
                <span class="batch-student-name">${escapeHtml(s.name)}</span>
                <span class="batch-student-sub">
                  <span>${escapeHtml(s.id)}</span> • 
                  <span>${escapeHtml(prog)}% complete</span> • 
                  <span>${escapeHtml(s.attendance ?? 100)}% att.</span>
                </span>
              </div>
            </div>
            <div class="batch-student-right">
              <button type="button" class="batch-quick-btn batch-quick-remove" data-quick-unenroll="${escapeHtml(s.id)}" title="Remove from course">✕ Remove</button>
            </div>
          </div>`;
      }).join('');
    }
  }

  // Render Available List
  if (availableList) {
    if (!allAvailable.length) {
      availableList.innerHTML = '<p class="empty-state" style="padding:22px 0;text-align:center;">All registered students are already enrolled in this course! 🎉</p>';
    } else if (!visibleAvailable.length) {
      availableList.innerHTML = '<p class="empty-state" style="padding:22px 0;text-align:center;">No available students match your search.</p>';
    } else {
      availableList.innerHTML = visibleAvailable.map((s) => {
        const otherCoursesCount = (s.enrollments || []).length;
        return `
          <div class="batch-student-item" data-student-id="${escapeHtml(s.id)}">
            <div class="batch-student-left">
              <input type="checkbox" data-available-student="${escapeHtml(s.id)}" title="Select student">
              <div class="batch-student-avatar" style="background:linear-gradient(135deg,#10b981,#059669);">${escapeHtml(s.initials || 'ST')}</div>
              <div class="batch-student-meta">
                <span class="batch-student-name">${escapeHtml(s.name)}</span>
                <span class="batch-student-sub">
                  <span>${escapeHtml(s.id)}</span> • 
                  <span>${escapeHtml(otherCoursesCount)} other course${otherCoursesCount === 1 ? '' : 's'}</span> • 
                  <span>${escapeHtml(s.attendance ?? 100)}% att.</span>
                </span>
              </div>
            </div>
            <div class="batch-student-right">
              <button type="button" class="batch-quick-btn batch-quick-add" data-quick-enroll="${escapeHtml(s.id)}" title="Enroll in course">+ Enroll</button>
            </div>
          </div>`;
      }).join('');
    }
  }
};

const renderReports = () => {
  const container = document.querySelector('#reports-course-list');
  if (!container) return;
  if (!courses.length) {
    container.innerHTML = '<p class="empty-state">No courses added yet.</p>';
    return;
  }
  container.innerHTML = courses
    .map((course, index) => {
      const enrolledStudents = studentRecords.filter(s => isEnrolled(s, index));
      const avgScore = enrolledStudents.length
        ? Math.round(enrolledStudents.reduce((sum, s) => sum + getStudentProgress(s, index), 0) / enrolledStudents.length)
        : 0;
      return `<div class="course">
        <div class="course-row"><b>${escapeHtml(course.name)}</b><b>${escapeHtml(avgScore)}%</b></div>
        <div class="progress"><i style="width:${escapeHtml(avgScore)}%"></i></div>
      </div>`;
    })
    .join('');

  const needAttention = studentRecords.filter((s) => (s.attendance || 0) < 85).length;
  const noticeEl = document.querySelector('#teacher-attention-notice');
  if (noticeEl) {
    noticeEl.innerHTML = needAttention > 0
      ? `<b>${needAttention} students</b> need a follow-up because their attendance is below 85%.`
      : `<b>All students</b> are currently on track.`;
  }
};

const updateCourseDropdowns = () => {
  const teacherCourseSelect = document.querySelector('#teacher-course');
  if (teacherCourseSelect) {
    teacherCourseSelect.innerHTML = courses.length
      ? courses.map((course, index) => `<option value="${index}">${escapeHtml(course.name)}</option>`).join('')
      : '<option value="">No courses available</option>';
  }
  const scheduleCourseSelect = document.querySelector('#schedule-course');
  if (scheduleCourseSelect) {
    scheduleCourseSelect.innerHTML = courses.length
      ? courses.map((course, index) => `<option value="${index}">${escapeHtml(course.name)}</option>`).join('')
      : '<option value="">No courses available</option>';
    renderScheduleTopicOptions();
  }
  const courseFilter = document.querySelector('#course-filter');
  if (courseFilter) {
    courseFilter.innerHTML = '<option>All courses</option>' + courses.map((c) => `<option>${escapeHtml(c.shortName)}</option>`).join('');
  }
  const newStudentEnrollments = document.querySelector('#new-student-enrollments');
  if (newStudentEnrollments) {
    newStudentEnrollments.innerHTML = courses.length
      ? courses.map((c, i) => `<label class="enrollment-row"><input type="checkbox" value="${i}"><span>${escapeHtml(c.name)}</span></label>`).join('')
      : '<p class="empty-state">No courses to enroll yet.</p>';
  }
  const newCourseEnrollments = document.querySelector('#new-course-enrollments');
  if (newCourseEnrollments) {
    newCourseEnrollments.innerHTML = studentRecords.length
      ? studentRecords.map((s) => `<label class="enrollment-row"><input type="checkbox" value="${escapeHtml(s.id)}"><span>${escapeHtml(s.name)} · ${escapeHtml(s.id)}</span></label>`).join('')
      : '<p class="empty-state">No registered students yet. You can enroll students anytime later.</p>';
  }
};

const openStudentDetail = (studentId) => {
  const student = studentRecords.find((record) => record.id === studentId);
  if (!student) return;
  document.querySelector('#detail-student-id').value = student.id;
  document.querySelector('#student-detail-title').textContent = `${student.name} · ${student.id}`;
  document.querySelector('#detail-student-name').value = student.name;
  document.querySelector('#detail-attendance').value = student.attendance ?? 100;
  document.querySelector('#detail-enrollments').innerHTML = courses.length
    ? courses.map((course, index) => `<label class="enrollment-row"><input type="checkbox" value="${index}" ${isEnrolled(student, index) ? 'checked' : ''}><span>${escapeHtml(course.name)}</span></label>`).join('')
    : '<p class="empty-state">No courses available.</p>';
  const overrideCourse = document.querySelector('#override-course');
  overrideCourse.innerHTML = Array.isArray(student.enrollments) && student.enrollments.length
    ? student.enrollments.map((courseIndex) => `<option value="${courseIndex}">${escapeHtml((courses[courseIndex] || {}).name || '')}</option>`).join('')
    : '<option value="">No enrolled courses</option>';
  const selectedCourse = Number(overrideCourse.value);
  if (!isNaN(selectedCourse) && courses[selectedCourse]) {
    const schedule = getStudentSchedule(student, selectedCourse);
    document.querySelector('#override-day').value = schedule.day;
    document.querySelector('#override-time').value = schedule.time;
  }

  const alertEl = document.querySelector('#student-detail-alert');
  if (alertEl) {
    alertEl.style.display = 'none';
    alertEl.textContent = '';
  }
  const saveBtn = document.querySelector('#btn-save-student-changes');
  if (saveBtn) {
    saveBtn.textContent = 'Save student changes';
    saveBtn.classList.remove('btn-success');
    saveBtn.disabled = false;
  }
  showPage('student-detail');
};

let currentRole = 'student';

function showPage(page) {
  const teacherPages = ['students', 'student-detail', 'reports', 'topic-manager', 'schedule-manager', 'teacher-courses'];
  const studentPages = ['dashboard', 'courses', 'course-detail', 'calendar', 'results'];

  // Enforce role isolation: students cannot access teacher pages, teachers cannot access student pages
  if (currentRole === 'student' && teacherPages.includes(page)) {
    page = 'dashboard';
  } else if (currentRole === 'teacher' && studentPages.includes(page)) {
    page = 'students';
  }

  document.querySelectorAll('.page').forEach((element) => element.classList.remove('active'));
  const target = document.querySelector(`#${page}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === page);
  });

  const pageLabels = {
    'teacher-courses': 'Courses',
    'topic-manager': 'Manage Topics',
    'schedule-manager': 'Class Schedule',
    'student-detail': 'Student Details',
  };
  const portal = teacherPages.includes(page) ? 'Teacher portal' : 'Student portal';
  const label = pageLabels[page] || `${page[0].toUpperCase()}${page.slice(1)}`;
  document.querySelector('#crumb').textContent = `${portal} / ${label}`;

  if (page === 'teacher-courses') {
    renderTeacherCourses();
  }
}

const setRole = (role, name = '') => {
  currentRole = role;
  const teacher = role === 'teacher';

  const roleLabelEl = document.querySelector('#portal-role-label');
  const userNameEl = document.querySelector('#portal-user-name');
  if (roleLabelEl) {
    roleLabelEl.textContent = teacher ? 'TEACHER PORTAL' : 'STUDENT PORTAL';
  }

  if (!teacher) {
    if (name) {
      activeStudent = studentRecords.find((s) => s.id.toLowerCase() === name.toLowerCase() || s.name.toLowerCase() === name.toLowerCase()) || null;
      if (!activeStudent && studentRecords.length === 0) {
        // Auto-register first student
        const newId = 'STU-001';
        const parts = name.trim().split(/\s+/);
        const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
        activeStudent = { id: newId, name: name.trim(), initials, password: 'aimt@123', enrollments: [], progress: {}, attendance: 100, completions: {}, scheduleOverrides: {} };
        studentRecords.push(activeStudent);
        saveStudents();
        renderStudents();
      } else if (!activeStudent) {
        activeStudent = studentRecords[0] || null;
      }
    } else {
      activeStudent = studentRecords[0] || null;
    }
    renderCourses();
    renderDashboardCourses();
    renderStudentSchedule();
    updateStudentDashboardMetrics();
    renderNotices();
  } else {
    renderNotices();
  }

  // Display dedicated workspace navigation and hide the other
  document.querySelectorAll('.student-only').forEach((el) => {
    el.style.display = teacher ? 'none' : '';
  });
  document.querySelectorAll('.teacher-only').forEach((el) => {
    el.style.display = teacher ? '' : 'none';
  });

  document.querySelectorAll('.student-page').forEach((page) => {
    page.style.display = teacher ? 'none' : '';
  });
  document.querySelectorAll('.teacher-page').forEach((page) => {
    page.style.display = teacher ? '' : 'none';
  });

  const displayName = teacher ? (name || 'Teacher') : (activeStudent ? activeStudent.name.split(' ')[0] : (name || 'Student'));
  const fullName = teacher ? (name || 'Faculty Member') : (activeStudent ? activeStudent.name : (name || 'Student'));

  if (userNameEl) {
    userNameEl.textContent = fullName;
  }

  document.querySelector('#title').textContent = teacher
    ? `Welcome back, ${displayName}!`
    : `Good morning, ${displayName}!`;
  const avatarInitials = teacher ? 'TR' : (activeStudent ? activeStudent.initials : 'ST');
  const desktopAvatar = document.querySelector('#avatar');
  if (desktopAvatar) desktopAvatar.textContent = avatarInitials;
  const mobileAvatar = document.querySelector('#mobile-avatar');
  if (mobileAvatar) mobileAvatar.textContent = avatarInitials;
  const mobileRolePill = document.querySelector('#mobile-role-pill');
  if (mobileRolePill) mobileRolePill.textContent = teacher ? 'TEACHER' : 'STUDENT';
  showPage(teacher ? 'students' : 'dashboard');
};

// Navigation events
document.querySelectorAll('[data-page]').forEach((button) => {
  button.addEventListener('click', () => showPage(button.dataset.page));
});

document.querySelector('#course-list')?.addEventListener('click', (event) => {
  const courseButton = event.target.closest('[data-course]');
  if (!courseButton) return;
  renderCourseDetails(Number(courseButton.dataset.course));
  showPage('course-detail');
});

let loginRole = 'student';
const loginCard = document.querySelector('#login-card');
const loginAlert = document.querySelector('#login-alert');
const loginNameLabel = document.querySelector('#login-name-label');
const loginNameInput = document.querySelector('#login-name');
const loginPasswordInput = document.querySelector('#login-password');
const loginBtnText = document.querySelector('#login-btn-text');

const clearLoginAlert = () => {
  if (loginAlert) {
    loginAlert.style.display = 'none';
    loginAlert.textContent = '';
    loginAlert.className = 'login-alert';
  }
  if (loginCard) {
    loginCard.classList.remove('has-error');
  }
};

const triggerCardShake = () => {
  if (!loginCard) return;
  loginCard.classList.remove('has-error');
  // Trigger DOM reflow to restart CSS shake animation
  void loginCard.offsetWidth;
  loginCard.classList.add('has-error');
};

const showLoginAlert = (msg, type = 'error') => {
  if (loginAlert) {
    loginAlert.className = `login-alert alert-${type}`;
    loginAlert.textContent = msg;
    loginAlert.style.display = 'block';
  }
  if (type === 'error') {
    triggerCardShake();
  }
};

document.querySelectorAll('[data-login-role]').forEach((button) => {
  button.addEventListener('click', () => {
    loginRole = button.dataset.loginRole;
    clearLoginAlert();
    document.querySelectorAll('[data-login-role]').forEach((roleButton) => {
      const isActive = roleButton === button;
      roleButton.classList.toggle('active', isActive);
      roleButton.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (loginNameLabel) {
      loginNameLabel.textContent = loginRole === 'teacher' ? 'Teacher ID or Name' : 'Student ID or Full Name';
    }
    if (loginNameInput) {
      loginNameInput.placeholder = loginRole === 'teacher' ? 'e.g. TEACHER or Faculty Admin' : 'e.g. STU-001 or Student Name';
      loginNameInput.value = '';
    }
    if (loginPasswordInput) {
      loginPasswordInput.value = '';
    }
    if (loginBtnText) {
      loginBtnText.textContent = loginRole === 'teacher' ? 'Sign in as Faculty' : 'Sign in as Student';
    }
  });
});

// Show / Hide password visibility toggle
document.querySelector('#btn-toggle-password')?.addEventListener('click', () => {
  if (!loginPasswordInput) return;
  const isPw = loginPasswordInput.type === 'password';
  loginPasswordInput.type = isPw ? 'text' : 'password';
  const icon = document.querySelector('#password-toggle-icon');
  if (icon) icon.textContent = isPw ? '🙈' : '👁️';
});

// One-click quick-fill demo credentials
document.querySelectorAll('[data-quick-fill]').forEach((chip) => {
  chip.addEventListener('click', () => {
    const role = chip.dataset.quickFill;
    const roleBtn = document.querySelector(`[data-login-role="${role}"]`);
    if (roleBtn) roleBtn.click();
    if (role === 'teacher') {
      if (loginNameInput) loginNameInput.value = 'TEACHER';
      if (loginPasswordInput) loginPasswordInput.value = 'aimt@teacher';
    } else {
      if (loginNameInput) loginNameInput.value = 'STU-001';
      if (loginPasswordInput) loginPasswordInput.value = 'aimt@123';
    }
    clearLoginAlert();
  });
});

// Login assistance
document.querySelector('#btn-login-help')?.addEventListener('click', () => {
  alert('AIMT Institute Portal Assistance:\n\n• Students: Sign in using your registered Student ID (e.g. STU-001) with default password aimt@123.\n• Teachers: Sign in using TEACHER with default password aimt@teacher.\n\nFor account lockouts or new student enrollment, please consult the institute administrative desk.');
});

document.querySelector('#login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearLoginAlert();

  const identifier = loginNameInput ? loginNameInput.value.trim() : '';
  const password = loginPasswordInput ? loginPasswordInput.value.trim() : '';

  if (!identifier) {
    showLoginAlert('Please enter your ID or Name.');
    return;
  }
  if (!password) {
    showLoginAlert('Please enter your password.');
    return;
  }

  if (loginRole === 'student') {
    const lowerId = identifier.toLowerCase();
    let found = studentRecords.find((s) => s.id.toLowerCase() === lowerId || s.name.toLowerCase() === lowerId);

    // Auto-create initial student if database is empty
    if (!found && studentRecords.length === 0) {
      const newId = 'STU-001';
      const parts = identifier.split(/\s+/);
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : identifier.slice(0, 2).toUpperCase();
      found = {
        id: newId,
        name: identifier,
        initials,
        password: await sha256Hex(password || 'aimt@123'),
        enrollments: [],
        progress: {},
        attendance: 100,
        completions: {},
        scheduleOverrides: {},
      };
      studentRecords.push(found);
      saveStudents();
      renderStudents();
    }

    if (!found) {
      showLoginAlert('Student account not found. Check your Student ID / Name or verify with faculty.');
      return;
    }

    const expectedPw = found.password || 'aimt@123';
    const isPwValid = await verifyPassword(password, expectedPw);
    if (!isPwValid) {
      showLoginAlert('Incorrect student password! Default is aimt@123 unless changed.');
      return;
    }

    // Silently upgrade legacy plain-text passwords to SHA-256
    if (found.password === password) {
      found.password = await sha256Hex(password);
      saveStudents();
    }

    // Login successful
    document.body.classList.add('authenticated');
    setRole('student', found.name);
    if (loginPasswordInput) loginPasswordInput.value = '';
  } else {
    // Teacher authentication
    const teacherAuth = getTeacherAuth();
    const lowerId = identifier.toLowerCase();
    const isTeacherMatch = (
      lowerId === teacherAuth.id.toLowerCase() ||
      lowerId === teacherAuth.name.toLowerCase() ||
      lowerId === 'teacher' ||
      lowerId === 'faculty' ||
      lowerId === 'admin'
    );

    if (!isTeacherMatch) {
      showLoginAlert('Teacher not recognized. Use TEACHER or Faculty Admin.');
      return;
    }

    const expectedPw = teacherAuth.password || 'aimt@teacher';
    const isPwValid = await verifyPassword(password, expectedPw);
    if (!isPwValid) {
      showLoginAlert('Incorrect teacher password! Default is aimt@teacher unless changed.');
      return;
    }

    // Silently upgrade legacy plain-text passwords to SHA-256
    if (teacherAuth.password === password) {
      teacherAuth.password = await sha256Hex(password);
      saveTeacherAuth(teacherAuth);
    }

    // Teacher login successful
    document.body.classList.add('authenticated');
    setRole('teacher', teacherAuth.name);
    if (loginPasswordInput) loginPasswordInput.value = '';
  }
});

document.querySelector('#logout-button')?.addEventListener('click', () => {
  document.body.classList.remove('authenticated');
  if (loginPasswordInput) loginPasswordInput.value = '';
  clearLoginAlert();
});

document.querySelector('#mobile-btn-logout')?.addEventListener('click', () => {
  document.body.classList.remove('authenticated');
  if (loginPasswordInput) loginPasswordInput.value = '';
  clearLoginAlert();
});

// Change Password Modal & Flow
const changePwModal = document.querySelector('#change-password-modal');
const changePwAlert = document.querySelector('#change-pw-alert');
const changePwSub = document.querySelector('#change-pw-sub');
const currentPwInput = document.querySelector('#current-pw') || document.querySelector('#current-password');
const newPwInput = document.querySelector('#new-pw') || document.querySelector('#new-password');
const confirmPwInput = document.querySelector('#confirm-pw') || document.querySelector('#confirm-password');

const openChangePasswordModal = () => {
  if (!changePwModal) return;
  if (changePwAlert) {
    changePwAlert.style.display = 'none';
    changePwAlert.textContent = '';
    changePwAlert.className = 'login-alert';
  }
  if (currentPwInput) currentPwInput.value = '';
  if (newPwInput) newPwInput.value = '';
  if (confirmPwInput) confirmPwInput.value = '';

  if (changePwSub) {
    if (currentRole === 'teacher') {
      const auth = getTeacherAuth();
      changePwSub.textContent = `Active Account: Teacher (${auth.name} - ID: ${auth.id})`;
    } else {
      changePwSub.textContent = `Active Account: Student (${activeStudent ? activeStudent.name : 'Student'} - ID: ${activeStudent ? activeStudent.id : '--'})`;
    }
  }

  changePwModal.style.display = 'grid';
};

const closeChangePasswordModal = () => {
  if (!changePwModal) return;
  changePwModal.style.display = 'none';
};

document.querySelector('#btn-open-change-password')?.addEventListener('click', openChangePasswordModal);
document.querySelector('#mobile-btn-password')?.addEventListener('click', openChangePasswordModal);
document.querySelector('#mobile-nav-security')?.addEventListener('click', openChangePasswordModal);
document.querySelector('#btn-close-change-pw-modal')?.addEventListener('click', closeChangePasswordModal);
document.querySelector('#btn-cancel-change-pw')?.addEventListener('click', closeChangePasswordModal);
changePwModal?.addEventListener('click', (event) => {
  if (event.target.id === 'change-password-modal') {
    closeChangePasswordModal();
  }
});

document.querySelector('#change-password-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const currentVal = currentPwInput ? currentPwInput.value.trim() : '';
  const newVal = newPwInput ? newPwInput.value.trim() : '';
  const confirmVal = confirmPwInput ? confirmPwInput.value.trim() : '';

  const showModalAlert = (msg, type = 'error') => {
    if (changePwAlert) {
      changePwAlert.className = `login-alert alert-${type}`;
      changePwAlert.textContent = msg;
      changePwAlert.style.display = 'block';
    }
  };

  if (newVal.length < 6) {
    showModalAlert('New password must be at least 6 characters long.', 'error');
    return;
  }

  if (newVal !== confirmVal) {
    showModalAlert('New password and confirmation do not match.', 'error');
    return;
  }

  if (currentRole === 'teacher') {
    const teacherAuth = getTeacherAuth();
    const currentExpected = teacherAuth.password || 'aimt@teacher';
    const isCurrentValid = await verifyPassword(currentVal, currentExpected);
    if (!isCurrentValid) {
      showModalAlert('Current teacher password is incorrect.', 'error');
      return;
    }
    teacherAuth.password = await sha256Hex(newVal);
    saveTeacherAuth(teacherAuth);
    showModalAlert('Teacher password updated successfully!', 'success');
    setTimeout(() => {
      closeChangePasswordModal();
    }, 1200);
  } else {
    if (!activeStudent) {
      showModalAlert('No active student account found.', 'error');
      return;
    }
    const currentExpected = activeStudent.password || 'aimt@123';
    const isCurrentValid = await verifyPassword(currentVal, currentExpected);
    if (!isCurrentValid) {
      showModalAlert('Current student password is incorrect.', 'error');
      return;
    }
    const hashedNew = await sha256Hex(newVal);
    activeStudent.password = hashedNew;
    const idx = studentRecords.findIndex((s) => s.id === activeStudent.id);
    if (idx !== -1) {
      studentRecords[idx].password = hashedNew;
    }
    saveStudents();
    showModalAlert('Password updated successfully!', 'success');
    setTimeout(() => {
      closeChangePasswordModal();
    }, 1200);
  }
});

// Notice Board Logic
const renderNotices = () => {
  // Student Notice Board
  const studentNoticeList = document.querySelector('#student-notice-list');
  const studentNoticeCount = document.querySelector('#student-notice-count');
  if (studentNoticeCount) {
    studentNoticeCount.textContent = `${notices.length} active`;
  }

  if (studentNoticeList) {
    if (notices.length === 0) {
      studentNoticeList.innerHTML = '<p class="empty-state" style="padding:20px 0; color:var(--text-muted); text-align:center;">No announcements published at this time.</p>';
    } else {
      studentNoticeList.innerHTML = notices.map((n) => `
        <div class="notice-item notice-${(n.category || 'academic').toLowerCase()}">
          <div class="notice-header">
            <span class="notice-tag notice-tag-${(n.category || 'academic').toLowerCase()}">${escapeHtml(n.category || 'Notice')}</span>
            <span class="notice-date">${escapeHtml(n.date || '')}</span>
          </div>
          <div class="notice-title">${escapeHtml(n.title)}</div>
          <div class="notice-content">${escapeHtml(n.content)}</div>
          <div class="notice-footer">Posted by: <strong>${escapeHtml(n.postedBy || 'Administration')}</strong></div>
        </div>
      `).join('');
    }
  }

  // Teacher Notice Manager
  const teacherNoticeList = document.querySelector('#teacher-notice-list');
  if (teacherNoticeList) {
    if (notices.length === 0) {
      teacherNoticeList.innerHTML = '<p class="empty-state" style="padding:20px 0; color:var(--text-muted); text-align:center;">No announcements published yet. Click "+ Post Announcement" above to add one.</p>';
    } else {
      teacherNoticeList.innerHTML = notices.map((n) => `
        <div class="notice-item notice-${(n.category || 'academic').toLowerCase()}">
          <div class="notice-header">
            <div>
              <span class="notice-tag notice-tag-${(n.category || 'academic').toLowerCase()}">${escapeHtml(n.category || 'Notice')}</span>
              <span class="notice-date" style="margin-left: 8px;">${escapeHtml(n.date || '')}</span>
            </div>
            <button class="notice-delete-btn" data-delete-notice="${escapeHtml(n.id)}" title="Delete announcement">&times; Remove</button>
          </div>
          <div class="notice-title">${escapeHtml(n.title)}</div>
          <div class="notice-content">${escapeHtml(n.content)}</div>
          <div class="notice-footer">Posted by: <strong>${escapeHtml(n.postedBy || 'Faculty')}</strong></div>
        </div>
      `).join('');
    }
  }
};

// Teacher Notice Board Controls
document.querySelector('#btn-toggle-post-notice')?.addEventListener('click', () => {
  const card = document.querySelector('#post-notice-card');
  if (card) {
    const isHidden = card.style.display === 'none' || getComputedStyle(card).display === 'none';
    card.style.display = isHidden ? 'block' : 'none';
  }
});

document.querySelector('#btn-cancel-post-notice')?.addEventListener('click', () => {
  const card = document.querySelector('#post-notice-card');
  if (card) card.style.display = 'none';
});

document.querySelector('#post-notice-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const titleInput = document.querySelector('#notice-title');
  const categorySelect = document.querySelector('#notice-category');
  const contentInput = document.querySelector('#notice-content');
  const authorInput = document.querySelector('#notice-author');

  const title = titleInput ? titleInput.value.trim() : '';
  const category = categorySelect ? categorySelect.value : 'Academic';
  const content = contentInput ? contentInput.value.trim() : '';
  const author = authorInput ? authorInput.value.trim() : 'Faculty Admin';

  if (!title || !content) {
    alert('Please enter both announcement title and details.');
    return;
  }

  const newNotice = {
    id: `not-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    title,
    category,
    date: new Date().toISOString().slice(0, 10),
    content,
    postedBy: author,
  };

  notices.unshift(newNotice);
  saveNotices();
  renderNotices();

  event.target.reset();
  const card = document.querySelector('#post-notice-card');
  if (card) card.style.display = 'none';
});

document.querySelector('#teacher-notice-list')?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-delete-notice]');
  if (!btn) return;
  const noticeId = btn.dataset.deleteNotice;
  if (!noticeId) return;
  if (confirm('Are you sure you want to remove this announcement from the notice board?')) {
    notices = notices.filter((n) => n.id !== noticeId);
    saveNotices();
    renderNotices();
  }
});

// Teacher: Topic Manager actions
document.querySelector('#teacher-course')?.addEventListener('change', () => {
  renderTeacherTopics();
  renderCourseManager();
});

document.querySelector('#teacher-topic-list')?.addEventListener('click', async (event) => {
  const teacherCourseSelect = document.querySelector('#teacher-course');
  const courseId = Number(teacherCourseSelect?.value);
  const course = courses[courseId];
  if (!course) return;

  const editButton = event.target.closest('[data-edit-topic]');
  if (editButton) {
    const topicIdx = Number(editButton.dataset.editTopic);
    const topic = course.topics[topicIdx];
    const name = window.prompt('Topic name', topic.name);
    if (name === null || !name.trim()) return;
    const description = window.prompt('Topic description', topic.description);
    if (description === null) return;
    topic.name = name.trim();
    topic.description = description.trim();
    saveCourses();
    renderTeacherTopics();
    renderCourses();
    fetch(`${API_BASE}/courses/${courseId}/topics/${topicIdx}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: topic.name, description: topic.description, status: topic.status }),
    }).catch(console.warn);
    return;
  }

  const moveButton = event.target.closest('[data-move-topic]');
  if (moveButton) {
    const from = Number(moveButton.dataset.moveTopic);
    const direction = Number(moveButton.dataset.direction);
    const to = from + direction;
    if (to < 0 || to >= course.topics.length) return;
    [course.topics[from], course.topics[to]] = [course.topics[to], course.topics[from]];
    saveCourses();
    renderTeacherTopics();
    renderCourses();
    fetch(`${API_BASE}/courses/${courseId}/topics/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromIndex: from, direction }),
    }).catch(console.warn);
    return;
  }

  const setCurrentButton = event.target.closest('[data-set-current]');
  if (setCurrentButton) {
    const topicIdx = Number(setCurrentButton.dataset.setCurrent);
    course.topics.forEach((topic, index) => {
      if (topic.status === 'current') topic.status = 'upcoming';
      if (index === topicIdx) topic.status = 'current';
    });
    saveCourses();
    renderTeacherTopics();
    renderCourses();
    renderDashboardCourses();
    fetch(`${API_BASE}/courses/${courseId}/topics/${topicIdx}/current`, {
      method: 'PUT',
    }).catch(console.warn);
    return;
  }

  const removeButton = event.target.closest('[data-remove-topic]');
  if (!removeButton) return;
  const topicIdx = Number(removeButton.dataset.removeTopic);
  course.topics.splice(topicIdx, 1);
  saveCourses();
  renderTeacherTopics();
  renderCourses();
  renderDashboardCourses();
  fetch(`${API_BASE}/courses/${courseId}/topics/${topicIdx}`, {
    method: 'DELETE',
  }).catch(console.warn);
});

document.querySelector('#add-topic-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const teacherCourseSelect = document.querySelector('#teacher-course');
  const courseId = Number(teacherCourseSelect?.value);
  const course = courses[courseId];
  if (!course) {
    alert('Please create or select a course first.');
    return;
  }
  const name = document.querySelector('#topic-name').value.trim();
  const description = document.querySelector('#topic-description').value.trim();
  const status = document.querySelector('#topic-status').value;
  if (!Array.isArray(course.topics)) course.topics = [];
  if (status === 'current') {
    course.topics.forEach((topic) => {
      if (topic.status === 'current') topic.status = 'upcoming';
    });
  }
  const newTopic = { name, description, status };
  course.topics.push(newTopic);
  saveCourses();
  event.target.reset();
  renderTeacherTopics();
  renderCourses();
  renderDashboardCourses();

  fetch(`${API_BASE}/courses/${courseId}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTopic),
  }).catch(console.warn);
});

document.querySelector('#course-settings-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const teacherCourseSelect = document.querySelector('#teacher-course');
  const courseId = Number(teacherCourseSelect?.value);
  const course = courses[courseId];
  if (!course) return;
  course.description = document.querySelector('#course-description').value.trim();
  course.announcement = document.querySelector('#course-announcement').value.trim();
  course.day = document.querySelector('#course-day').value;
  course.time = document.querySelector('#course-time').value;
  saveCourses();
  renderCourses();
  renderDashboardCourses();
  renderStudentSchedule();

  fetch(`${API_BASE}/courses/${courseId}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: course.description,
      announcement: course.announcement,
      day: course.day,
      time: course.time,
    }),
  }).catch(console.warn);
});

// Teacher: Register real student
document.querySelector('#btn-add-student-toggle')?.addEventListener('click', () => {
  const card = document.querySelector('#add-student-card');
  if (card) card.style.display = card.style.display === 'none' ? 'block' : 'none';
});

document.querySelector('#btn-cancel-add-student')?.addEventListener('click', () => {
  const card = document.querySelector('#add-student-card');
  if (card) card.style.display = 'none';
});

document.querySelector('#create-student-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.querySelector('#new-student-name').value.trim();
  const attendance = Number(document.querySelector('#new-student-attendance').value) || 100;
  const enrollments = [...document.querySelectorAll('#new-student-enrollments input:checked')].map(cb => Number(cb.value));

  const newId = `STU-${String(studentRecords.length + 1).padStart(3, '0')}`;
  const parts = name.split(/\s+/);
  const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();

  const student = {
    id: newId,
    name,
    initials,
    password: await sha256Hex('aimt@123'),
    attendance,
    enrollments,
    progress: {},
    completions: {},
    scheduleOverrides: {},
  };
  enrollments.forEach(idx => {
    student.progress[idx] = 0;
    student.completions[idx] = [];
  });

  studentRecords.push(student);
  saveStudents();
  event.target.reset();
  document.querySelector('#add-student-card').style.display = 'none';
  renderStudents();
  renderBatchStudents();

  fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  }).catch(console.warn);
});

// Teacher: Create real course
document.querySelector('#btn-create-course-toggle')?.addEventListener('click', () => {
  const card = document.querySelector('#create-course-card');
  if (card) card.style.display = card.style.display === 'none' ? 'block' : 'none';
});

document.querySelector('#btn-cancel-create-course')?.addEventListener('click', () => {
  const card = document.querySelector('#create-course-card');
  if (card) card.style.display = 'none';
});

document.querySelector('#create-course-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.querySelector('#new-course-name').value.trim();
  const shortName = document.querySelector('#new-course-code').value.trim();
  const description = document.querySelector('#new-course-desc').value.trim();
  const day = document.querySelector('#new-course-day').value;
  const time = document.querySelector('#new-course-time').value;

  const nextId = courses.length ? Math.max(...courses.map(c => c.id ?? 0)) + 1 : 0;
  const newCourse = {
    id: nextId,
    name,
    shortName,
    meta: `Course · 0 topics complete`,
    progress: 0,
    description,
    announcement: 'Welcome to ' + name,
    day,
    time,
    topics: [],
    learningPoints: [],
  };

  const newIndex = courses.length;
  courses.push(newCourse);

  // Enroll selected students immediately
  const selectedStudentIds = [...document.querySelectorAll('#new-course-enrollments input:checked')].map(cb => cb.value);
  selectedStudentIds.forEach((stuId) => {
    const student = studentRecords.find(s => s.id === stuId);
    if (student) {
      if (!Array.isArray(student.enrollments)) student.enrollments = [];
      if (!student.enrollments.includes(newIndex)) student.enrollments.push(newIndex);
      if (!student.progress) student.progress = {};
      student.progress[newIndex] = 0;
    }
  });

  saveCourses();
  saveStudents();
  event.target.reset();
  document.querySelector('#create-course-card').style.display = 'none';

  renderAllViews();

  fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCourse),
  }).then(async () => {
    if (selectedStudentIds.length) {
      fetch(`${API_BASE}/courses/${nextId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      }).catch(console.warn);
    }
  }).catch(console.warn);
});

const renderTeacherCourses = () => {
  const container = document.querySelector('#teacher-course-cards');
  const countEl = document.querySelector('#teacher-courses-count');
  if (!container) return;

  if (countEl) {
    countEl.textContent = `${courses.length} registered course${courses.length === 1 ? '' : 's'} in AIMT Tracker`;
  }

  if (!courses.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:42px 20px;color:var(--muted);background:#fafbfd;border-radius:12px;border:1px dashed var(--line);grid-column:1/-1;">
        <div style="font-size:32px;margin-bottom:8px;">📚</div>
        <h4 style="margin:0 0 6px;color:var(--ink);font-size:15px;">No courses created yet</h4>
        <p style="margin:0 0 14px;font-size:13px;">Click "+ Create New Course" above to add your first course offering.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = courses
    .map((course, index) => {
      const enrolledCount = studentRecords.filter((s) => isEnrolled(s, index)).length;
      const topicCount = Array.isArray(course.topics) ? course.topics.length : 0;
      const day = course.day || 'Monday';
      const time = course.time || '10:00';
      return `
        <article class="course-manage-card">
          <div>
            <div class="course-manage-top">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge course-badge">${escapeHtml(course.shortName || 'CRS')}</span>
                <span class="course-schedule-tag">◷ ${escapeHtml(day)}, ${escapeHtml(time)}</span>
              </div>
              <button class="course-delete-btn" type="button" data-delete-course="${index}" title="Delete ${escapeHtml(course.name)}">
                Delete
              </button>
            </div>
            <h3 class="course-manage-name">${escapeHtml(course.name)}</h3>
            <p class="course-manage-desc">${escapeHtml(course.description || 'No description provided.')}</p>
          </div>
          <div>
            <div class="course-manage-meta">
              <div class="meta-pill"><span>Topics:</span> <strong>${topicCount}</strong></div>
              <div class="meta-pill"><span>Enrolled:</span> <strong>${enrolledCount} student${enrolledCount === 1 ? '' : 's'}</strong></div>
            </div>
            <div class="course-manage-actions" style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="course-action-btn" type="button" data-manage-students="${index}" style="background:#eef2ff;color:var(--blue);border-color:#d4dbfc;">
                👥 Manage Students (${enrolledCount})
              </button>
              <button class="course-action-btn" type="button" data-goto-topics="${index}">
                Curriculum & Topics →
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
};

let modalCourseIndex = null;

const openCourseStudentsModal = (courseIndex) => {
  const course = courses[courseIndex];
  if (!course) return;
  modalCourseIndex = courseIndex;

  const modal = document.querySelector('#course-students-modal');
  if (!modal) return;

  document.querySelector('#modal-course-badge').textContent = course.shortName || 'COURSE';
  document.querySelector('#modal-course-name').textContent = course.name;
  document.querySelector('#modal-course-sub').textContent = `Manage enrollments for ${course.day || 'Monday'} at ${course.time || '10:00'}`;

  // Enrolled students
  const enrolledStudents = studentRecords.filter((s) => isEnrolled(s, courseIndex));
  const enrolledListEl = document.querySelector('#modal-enrolled-students-list');
  const countBadge = document.querySelector('#modal-enrolled-count');
  if (countBadge) {
    countBadge.textContent = `${enrolledStudents.length} Student${enrolledStudents.length === 1 ? '' : 's'}`;
  }

  if (enrolledListEl) {
    enrolledListEl.innerHTML = enrolledStudents.length
      ? enrolledStudents.map((s) => `
          <div class="modal-student-row">
            <div class="modal-student-info">
              <div class="modal-student-avatar">${escapeHtml(s.initials || s.name.slice(0, 2).toUpperCase())}</div>
              <div>
                <strong style="font-size:13px;display:block;color:var(--ink);">${escapeHtml(s.name)}</strong>
                <small style="color:var(--muted);">${escapeHtml(s.id)} · ${escapeHtml(getStudentProgress(s, courseIndex))}% progress</small>
              </div>
            </div>
            <button class="modal-remove-student-btn" type="button" data-modal-remove-student="${escapeHtml(s.id)}">
              ✕ Remove
            </button>
          </div>
        `).join('')
      : '<p class="empty-state" style="padding:16px;text-align:center;">No students enrolled in this course yet.</p>';
  }

  // Available students dropdown
  const availableStudents = studentRecords.filter((s) => !isEnrolled(s, courseIndex));
  const selectEl = document.querySelector('#modal-available-students-select');
  const enrollBtn = document.querySelector('#btn-modal-enroll-student');
  if (selectEl && enrollBtn) {
    if (availableStudents.length) {
      selectEl.innerHTML = availableStudents.map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.id)})</option>`).join('');
      enrollBtn.disabled = false;
      enrollBtn.style.opacity = '1';
    } else {
      selectEl.innerHTML = '<option value="">All registered students are already enrolled</option>';
      enrollBtn.disabled = true;
      enrollBtn.style.opacity = '0.5';
    }
  }

  modal.style.display = 'grid';
};

const closeCourseStudentsModal = () => {
  const modal = document.querySelector('#course-students-modal');
  if (modal) modal.style.display = 'none';
  modalCourseIndex = null;
};

// Modal event listeners
document.querySelector('#btn-close-students-modal')?.addEventListener('click', closeCourseStudentsModal);
document.querySelector('#btn-done-students-modal')?.addEventListener('click', closeCourseStudentsModal);
document.querySelector('#course-students-modal')?.addEventListener('click', (event) => {
  if (event.target.id === 'course-students-modal') {
    closeCourseStudentsModal();
  }
});

// Modal enroll button
document.querySelector('#btn-modal-enroll-student')?.addEventListener('click', async () => {
  if (modalCourseIndex === null) return;
  const selectEl = document.querySelector('#modal-available-students-select');
  const studentId = selectEl?.value;
  if (!studentId) return;

  const student = studentRecords.find((s) => s.id === studentId);
  if (!student) return;

  if (!Array.isArray(student.enrollments)) student.enrollments = [];
  if (!student.enrollments.includes(modalCourseIndex)) {
    student.enrollments.push(modalCourseIndex);
    if (!student.progress) student.progress = {};
    student.progress[modalCourseIndex] = 0;
  }

  saveStudents();
  openCourseStudentsModal(modalCourseIndex);
  renderAllViews();

  const course = courses[modalCourseIndex];
  if (course && course.id !== undefined && course.id !== null) {
    fetch(`${API_BASE}/courses/${course.id}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: [studentId] }),
    }).catch(console.warn);
  }
});

// Modal remove button
document.querySelector('#modal-enrolled-students-list')?.addEventListener('click', async (event) => {
  const removeBtn = event.target.closest('[data-modal-remove-student]');
  if (!removeBtn || modalCourseIndex === null) return;
  const studentId = removeBtn.dataset.modalRemoveStudent;
  const student = studentRecords.find((s) => s.id === studentId);
  if (!student) return;

  const course = courses[modalCourseIndex];
  const courseName = course ? course.name : 'this course';
  if (!confirm(`Remove ${student.name} from ${courseName}?`)) return;

  if (Array.isArray(student.enrollments)) {
    student.enrollments = student.enrollments.filter((idx) => idx !== modalCourseIndex);
    if (student.scheduleOverrides) delete student.scheduleOverrides[modalCourseIndex];
  }

  saveStudents();
  openCourseStudentsModal(modalCourseIndex);
  renderAllViews();

  if (course && course.id !== undefined && course.id !== null) {
    fetch(`${API_BASE}/courses/${course.id}/unenroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: [studentId] }),
    }).catch(console.warn);
  }
});

async function deleteCourse(courseIndex) {
  const course = courses[courseIndex];
  if (!course) return;

  const confirmDelete = confirm(`Are you sure you want to delete the course "${course.name}"?\n\nThis will permanently remove this course, its topics, and unenroll all students from it.`);
  if (!confirmDelete) return;

  const courseId = course.id;

  // 1. Remove from courses array
  courses.splice(courseIndex, 1);

  // 2. Clean up student enrollments and re-index higher numbers
  studentRecords.forEach((student) => {
    if (Array.isArray(student.enrollments)) {
      student.enrollments = student.enrollments
        .filter((idx) => idx !== courseIndex)
        .map((idx) => (idx > courseIndex ? idx - 1 : idx));
    }

    if (student.progress) {
      const newProgress = {};
      Object.entries(student.progress).forEach(([k, v]) => {
        const numK = Number(k);
        if (numK < courseIndex) newProgress[numK] = v;
        else if (numK > courseIndex) newProgress[numK - 1] = v;
      });
      student.progress = newProgress;
    }

    if (student.scheduleOverrides) {
      const newOverrides = {};
      Object.entries(student.scheduleOverrides).forEach(([k, v]) => {
        const numK = Number(k);
        if (numK < courseIndex) newOverrides[numK] = v;
        else if (numK > courseIndex) newOverrides[numK - 1] = v;
      });
      student.scheduleOverrides = newOverrides;
    }

    if (student.completions) {
      const newCompletions = {};
      Object.entries(student.completions).forEach(([k, v]) => {
        const numK = Number(k);
        if (numK < courseIndex) newCompletions[numK] = v;
        else if (numK > courseIndex) newCompletions[numK - 1] = v;
      });
      student.completions = newCompletions;
    }
  });

  // 3. Clean up schedules
  schedules = schedules
    .filter((s) => s.courseIndex !== courseIndex)
    .map((s) => (s.courseIndex > courseIndex ? { ...s, courseIndex: s.courseIndex - 1 } : s));

  saveCourses();
  saveStudents();
  saveSchedules();

  // 4. Notify backend
  if (courseId !== undefined && courseId !== null) {
    fetch(`${API_BASE}/courses/${courseId}`, {
      method: 'DELETE',
    }).catch(console.warn);
  }

  // 5. Update UI
  renderAllViews();
}

// Teacher Course cards click delegation
document.querySelector('#teacher-course-cards')?.addEventListener('click', (event) => {
  const deleteBtn = event.target.closest('[data-delete-course]');
  if (deleteBtn) {
    const courseIndex = Number(deleteBtn.dataset.deleteCourse);
    deleteCourse(courseIndex);
    return;
  }

  const manageStudentsBtn = event.target.closest('[data-manage-students]');
  if (manageStudentsBtn) {
    const courseIndex = Number(manageStudentsBtn.dataset.manageStudents);
    openCourseStudentsModal(courseIndex);
    return;
  }

  const topicsBtn = event.target.closest('[data-goto-topics]');
  if (topicsBtn) {
    const courseIndex = Number(topicsBtn.dataset.gotoTopics);
    const teacherCourseSelect = document.querySelector('#teacher-course');
    if (teacherCourseSelect) {
      teacherCourseSelect.value = courseIndex;
      renderTeacherTopics();
      renderCourseManager();
    }
    showPage('topic-manager');
    return;
  }
});

// Batch Enrollments Interactive Controls
document.querySelectorAll('[data-batch-tab]').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    const targetTab = tabBtn.dataset.batchTab;
    activeBatchTab = targetTab;
    document.querySelectorAll('[data-batch-tab]').forEach((b) => b.classList.toggle('active', b === tabBtn));
    const panelEnrolled = document.querySelector('#panel-batch-enrolled');
    const panelAvailable = document.querySelector('#panel-batch-available');
    if (panelEnrolled) panelEnrolled.style.display = targetTab === 'enrolled' ? 'block' : 'none';
    if (panelAvailable) panelAvailable.style.display = targetTab === 'available' ? 'block' : 'none';
  });
});

document.querySelector('#batch-search')?.addEventListener('input', renderBatchStudents);

document.querySelector('#btn-batch-select-all')?.addEventListener('click', () => {
  const selector = activeBatchTab === 'enrolled' ? '#batch-enrolled-list input[type="checkbox"]' : '#batch-available-list input[type="checkbox"]';
  document.querySelectorAll(selector).forEach((cb) => { cb.checked = true; });
});

document.querySelector('#btn-batch-deselect-all')?.addEventListener('click', () => {
  const selector = activeBatchTab === 'enrolled' ? '#batch-enrolled-list input[type="checkbox"]' : '#batch-available-list input[type="checkbox"]';
  document.querySelectorAll(selector).forEach((cb) => { cb.checked = false; });
});

// Quick 1-click enroll / unenroll & row selection in Batch Manager
document.querySelector('#batch-enrolled-list')?.addEventListener('click', async (event) => {
  const quickBtn = event.target.closest('[data-quick-unenroll]');
  if (quickBtn) {
    const studentId = quickBtn.dataset.quickUnenroll;
    const teacherCourseSelect = document.querySelector('#teacher-course');
    const courseIndex = Number(teacherCourseSelect?.value) || 0;
    const student = studentRecords.find((s) => s.id === studentId);
    if (!student) return;

    student.enrollments = (student.enrollments || []).filter((idx) => idx !== courseIndex);
    if (student.scheduleOverrides) delete student.scheduleOverrides[courseIndex];
    saveStudents();
    renderBatchStudents();
    renderStudents();
    flashBatchAlert(`✓ ${student.name} (${student.id}) removed from course.`);

    fetch(`${API_BASE}/courses/${courseIndex}/unenroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: [studentId] }),
    }).catch(console.warn);
    return;
  }

  // Toggle checkbox if clicking student row (except checkbox itself)
  if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'BUTTON') {
    const item = event.target.closest('.batch-student-item');
    const cb = item?.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = !cb.checked;
  }
});

document.querySelector('#batch-available-list')?.addEventListener('click', async (event) => {
  const quickBtn = event.target.closest('[data-quick-enroll]');
  if (quickBtn) {
    const studentId = quickBtn.dataset.quickEnroll;
    const teacherCourseSelect = document.querySelector('#teacher-course');
    const courseIndex = Number(teacherCourseSelect?.value) || 0;
    const student = studentRecords.find((s) => s.id === studentId);
    if (!student) return;

    if (!Array.isArray(student.enrollments)) student.enrollments = [];
    if (!student.enrollments.includes(courseIndex)) student.enrollments.push(courseIndex);
    if (!student.progress) student.progress = {};
    student.progress[courseIndex] = 0;
    if (!student.completions) student.completions = {};
    student.completions[courseIndex] = [];

    saveStudents();
    renderBatchStudents();
    renderStudents();
    flashBatchAlert(`✓ ${student.name} (${student.id}) enrolled in course successfully!`);

    fetch(`${API_BASE}/courses/${courseIndex}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: [studentId] }),
    }).catch(console.warn);
    return;
  }

  // Toggle checkbox if clicking student row (except checkbox itself)
  if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'BUTTON') {
    const item = event.target.closest('.batch-student-item');
    const cb = item?.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = !cb.checked;
  }
});

document.querySelector('#add-enrolled')?.addEventListener('click', async () => {
  const teacherCourseSelect = document.querySelector('#teacher-course');
  const courseIndex = Number(teacherCourseSelect?.value) || 0;
  const studentIds = [];
  document.querySelectorAll('[data-available-student]:checked').forEach((checkbox) => {
    const student = studentRecords.find((record) => record.id === checkbox.dataset.availableStudent);
    if (!student || isEnrolled(student, courseIndex)) return;
    if (!Array.isArray(student.enrollments)) student.enrollments = [];
    student.enrollments.push(courseIndex);
    if (!student.progress) student.progress = {};
    student.progress[courseIndex] = 0;
    if (!student.completions) student.completions = {};
    student.completions[courseIndex] = [];
    studentIds.push(student.id);
  });

  if (!studentIds.length) {
    flashBatchAlert('Please select at least one student from the available list.', 'error');
    return;
  }

  saveStudents();
  renderBatchStudents();
  renderStudents();
  flashBatchAlert(`✓ ${studentIds.length} student${studentIds.length === 1 ? '' : 's'} added to course!`);

  fetch(`${API_BASE}/courses/${courseIndex}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentIds }),
  }).catch(console.warn);
});

document.querySelector('#remove-enrolled')?.addEventListener('click', async () => {
  const teacherCourseSelect = document.querySelector('#teacher-course');
  const courseIndex = Number(teacherCourseSelect?.value) || 0;
  const studentIds = [];
  document.querySelectorAll('[data-enrolled-student]:checked').forEach((checkbox) => {
    const student = studentRecords.find((record) => record.id === checkbox.dataset.enrolledStudent);
    if (!student) return;
    student.enrollments = (student.enrollments || []).filter((index) => index !== courseIndex);
    if (student.scheduleOverrides) delete student.scheduleOverrides[courseIndex];
    studentIds.push(student.id);
  });

  if (!studentIds.length) {
    flashBatchAlert('Please select at least one student to remove.', 'error');
    return;
  }

  saveStudents();
  renderBatchStudents();
  renderStudents();
  flashBatchAlert(`✓ ${studentIds.length} student${studentIds.length === 1 ? '' : 's'} removed from course.`);

  fetch(`${API_BASE}/courses/${courseIndex}/unenroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentIds }),
  }).catch(console.warn);
});

// Student Table Click & Edit Delegation
document.querySelector('#student-table')?.addEventListener('click', (event) => {
  const editBtn = event.target.closest('[data-edit-student]');
  if (editBtn) {
    openStudentDetail(editBtn.dataset.editStudent);
    return;
  }
  const row = event.target.closest('[data-student-id]');
  if (row) openStudentDetail(row.dataset.studentId);
});

// Explicit Click for Save Student Changes button
document.querySelector('#btn-save-student-changes')?.addEventListener('click', () => {
  const form = document.querySelector('#student-detail-form');
  if (form && typeof form.requestSubmit === 'function') {
    form.requestSubmit();
  }
});

// Student Details Form Submit Handler with Visual Confirmation
document.querySelector('#student-detail-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const studentId = document.querySelector('#detail-student-id').value;
  const student = studentRecords.find((record) => record.id === studentId);
  if (!student) return;

  const newName = document.querySelector('#detail-student-name').value.trim();
  const newAttendance = Number(document.querySelector('#detail-attendance').value);

  if (!newName) {
    alert('Student name is required.');
    return;
  }

  student.name = newName;
  student.attendance = isNaN(newAttendance) ? 100 : Math.min(100, Math.max(0, newAttendance));

  const previousEnrollments = [...(student.enrollments || [])];
  student.enrollments = [...document.querySelectorAll('#detail-enrollments input:checked')].map((checkbox) => Number(checkbox.value));
  student.enrollments.forEach((courseIndex) => {
    if (!previousEnrollments.includes(courseIndex)) {
      if (!student.progress) student.progress = {};
      student.progress[courseIndex] = 0;
      if (!student.completions) student.completions = {};
      student.completions[courseIndex] = [];
    }
  });

  if (student.scheduleOverrides) {
    previousEnrollments.filter((courseIndex) => !student.enrollments.includes(courseIndex)).forEach((courseIndex) => {
      delete student.scheduleOverrides[courseIndex];
    });
  }

  saveStudents();
  renderStudents();
  renderBatchStudents();

  // Update detail title header
  const titleHeader = document.querySelector('#student-detail-title');
  if (titleHeader) {
    titleHeader.textContent = `${student.name} · ${student.id}`;
  }

  // Visual feedback: Alert box and button feedback
  const alertEl = document.querySelector('#student-detail-alert');
  if (alertEl) {
    alertEl.className = 'login-alert alert-success';
    alertEl.textContent = `✓ Details for ${student.name} (${student.id}) updated successfully!`;
    alertEl.style.display = 'block';
  }

  const saveBtn = document.querySelector('#btn-save-student-changes');
  if (saveBtn) {
    saveBtn.textContent = '✓ Changes Saved!';
    saveBtn.classList.add('btn-success');
    setTimeout(() => {
      if (saveBtn) {
        saveBtn.textContent = 'Save student changes';
        saveBtn.classList.remove('btn-success');
      }
    }, 2200);
  }

  fetch(`${API_BASE}/students/${studentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: student.name,
      attendance: student.attendance,
      enrollments: student.enrollments,
    }),
  }).catch(console.warn);
});

document.querySelector('#btn-cancel-student-detail')?.addEventListener('click', () => {
  showPage('students');
});

document.querySelector('#override-course')?.addEventListener('change', () => {
  const student = studentRecords.find((record) => record.id === document.querySelector('#detail-student-id').value);
  const overrideCourse = document.querySelector('#override-course');
  const courseIdx = Number(overrideCourse?.value);
  if (student && !isNaN(courseIdx) && courses[courseIdx]) {
    const schedule = getStudentSchedule(student, courseIdx);
    document.querySelector('#override-day').value = schedule.day;
    document.querySelector('#override-time').value = schedule.time;
  }
});

document.querySelector('#student-override-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const studentId = document.querySelector('#detail-student-id').value;
  const student = studentRecords.find((record) => record.id === studentId);
  const courseIndex = Number(document.querySelector('#override-course').value);
  if (!student.scheduleOverrides) student.scheduleOverrides = {};
  student.scheduleOverrides[courseIndex] = {
    day: document.querySelector('#override-day').value,
    time: document.querySelector('#override-time').value,
  };
  saveStudents();

  fetch(`${API_BASE}/students/${studentId}/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseIndex,
      day: student.scheduleOverrides[courseIndex].day,
      time: student.scheduleOverrides[courseIndex].time,
    }),
  }).catch(console.warn);
});

document.querySelector('#clear-override')?.addEventListener('click', async () => {
  const studentId = document.querySelector('#detail-student-id').value;
  const student = studentRecords.find((record) => record.id === studentId);
  const courseIndex = Number(document.querySelector('#override-course').value);
  if (student && student.scheduleOverrides) delete student.scheduleOverrides[courseIndex];
  saveStudents();
  openStudentDetail(studentId);

  fetch(`${API_BASE}/students/${studentId}/override/${courseIndex}`, {
    method: 'DELETE',
  }).catch(console.warn);
});

// Teacher Schedule Manager
const renderScheduleTopicOptions = () => {
  const scheduleCourseSelect = document.querySelector('#schedule-course');
  const scheduleTopicSelect = document.querySelector('#schedule-topic');
  if (!scheduleCourseSelect || !scheduleTopicSelect) return;
  const courseIndex = Number(scheduleCourseSelect.value);
  if (isNaN(courseIndex) || !courses[courseIndex]) {
    scheduleTopicSelect.innerHTML = '<option value="">No courses available</option>';
    return;
  }
  const options = classTopicOptions(courseIndex);
  scheduleTopicSelect.innerHTML = options.length
    ? options.map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join('')
    : '<option value="">No unfinished topics available</option>';
};

document.querySelector('#schedule-course')?.addEventListener('change', renderScheduleTopicOptions);

document.querySelector('#add-schedule-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const scheduleTopicSelect = document.querySelector('#schedule-topic');
  const topic = scheduleTopicSelect?.value;
  if (!topic) {
    alert('Please create course topics first before scheduling a class.');
    return;
  }
  const scheduleCourseSelect = document.querySelector('#schedule-course');
  const newSchedule = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    courseIndex: Number(scheduleCourseSelect.value),
    topic,
    date: document.querySelector('#schedule-date').value,
    time: document.querySelector('#schedule-time').value,
  };
  schedules.push(newSchedule);
  saveSchedules();
  renderTeacherSchedule();
  renderStudentSchedule();

  fetch(`${API_BASE}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSchedule),
  }).catch(console.warn);
});

document.querySelector('#teacher-schedule-list')?.addEventListener('click', async (event) => {
  const removeButton = event.target.closest('[data-remove-schedule]');
  if (!removeButton) return;
  const scheduleId = removeButton.dataset.removeSchedule;
  schedules = schedules.filter((schedule) => schedule.id !== scheduleId);
  saveSchedules();
  renderTeacherSchedule();
  renderStudentSchedule();

  fetch(`${API_BASE}/schedules/${scheduleId}`, {
    method: 'DELETE',
  }).catch(console.warn);
});

document.querySelector('#search')?.addEventListener('input', renderStudents);
document.querySelector('#course-filter')?.addEventListener('change', renderStudents);

function renderAllViews() {
  updateCourseDropdowns();
  renderCourses();
  renderTeacherCourses();
  renderDashboardCourses();
  renderStudents();
  renderTeacherTopics();
  renderCourseManager();
  renderStudentSchedule();
  renderTeacherSchedule();
  renderTeacherConfirmations();
  renderReports();
  renderNotices();
  updateStudentDashboardMetrics();
}

// Initial render + fetch from Spring Boot backend
renderAllViews();
loadBackendData();
