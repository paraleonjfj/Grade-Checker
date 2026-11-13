const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');
const themeBtn = document.getElementById('themeBtn');
const subjectForm = document.getElementById('subjectForm');
const subjectName = document.getElementById('subjectName');
const subjectUnits = document.getElementById('subjectUnits');
const subjectGrade = document.getElementById('subjectGrade');
const formError = document.getElementById('formError');
const subjectList = document.getElementById('subjectList');
const clearBtn = document.getElementById('clearBtn');
const gwaValue = document.getElementById('gwaValue');
const gwaRemark = document.getElementById('gwaRemark');
const gwaDetails = document.getElementById('gwaDetails');

const PASSING = 3.0; // highest passing grade on the 1.00 - 5.00 scale
let subjects = [];
try {
  subjects = JSON.parse(localStorage.getItem('gradecheck-subjects')) || [];
} catch (e) {
  subjects = [];
}
 
function saveSubjects() {
  localStorage.setItem('gradecheck-subjects', JSON.stringify(subjects));
}

function updateResult() {
  if (subjects.length === 0) {
    gwaValue.textContent = '--';
    gwaRemark.textContent = 'Add a subject to see your result.';
    gwaRemark.className = 'remark';
    gwaDetails.textContent = '';
    return;
  }
 
  const totalUnits = subjects.reduce(function (sum, s) { return sum + s.units; }, 0);
  const totalPoints = subjects.reduce(function (sum, s) { return sum + s.units * s.grade; }, 0);
  const gwa = totalPoints / totalUnits;
  const failedCount = subjects.filter(function (s) { return s.grade > PASSING; }).length;
 
  let remark, style;
  if (gwa <= 1.5) { remark = 'Excellent work!'; style = 'good'; }
  else if (gwa <= 2.0) { remark = 'Very good. Keep it up!'; style = 'good'; }
  else if (gwa <= 2.5) { remark = 'Good standing.'; style = 'good'; }
  else if (gwa <= PASSING) { remark = 'Passing, but there is room to improve.'; style = 'warn'; }
  else { remark = 'Below passing. Time to talk to your instructors.'; style = 'bad'; }
 
  gwaValue.textContent = gwa.toFixed(2);
  gwaRemark.textContent = remark;
  gwaRemark.className = 'remark ' + style;
  gwaDetails.textContent =
    `${subjects.length} subject(s), ${totalUnits} units` +
    (failedCount > 0 ? `, ${failedCount} below passing` : '');
}

function renderSubjects() {
  subjectList.innerHTML = '';
 
  if (subjects.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No subjects yet. Add your first one above.';
    subjectList.appendChild(empty);
    return;
  }
 
  subjects.forEach(function (s) {
    const li = document.createElement('li');
    li.className = 'subject-item' + (s.grade > PASSING ? ' failed' : '');
 
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = s.name; // textContent keeps user text safe
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = s.units + (s.units === 1 ? ' unit' : ' units');
    info.append(title, meta);
 
    const grade = document.createElement('span');
    grade.className = 'grade';
    grade.textContent = s.grade.toFixed(2);
 
    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.dataset.id = s.id;
    del.textContent = 'Delete';
 
    li.append(info, grade, del);
    subjectList.appendChild(li);
  });
}
 
function refresh() {
  saveSubjects();
  renderSubjects();
  updateResult();
}

subjectForm.addEventListener('submit', function (event) {
  event.preventDefault();
 
  const name = subjectName.value.trim();
  const units = parseInt(subjectUnits.value, 10);
  const grade = parseFloat(subjectGrade.value);
 
  if (name === '') {
    formError.textContent = 'Please enter the subject name.';
    return;
  }
  if (isNaN(units) || units < 1 || units > 10) {
    formError.textContent = 'Units should be a whole number from 1 to 10.';
    return;
  }
  if (isNaN(grade) || grade < 1 || grade > 5) {
    formError.textContent = 'Grade should be between 1.00 and 5.00.';
    return;
  }
  formError.textContent = '';
 
  subjects.push({ id: Date.now(), name: name, units: units, grade: grade });
  refresh();
  subjectForm.reset();
  subjectName.focus();
});

subjectList.addEventListener('click', function (event) {
  if (event.target.classList.contains('delete-btn')) {
    const id = Number(event.target.dataset.id);
    subjects = subjects.filter(function (s) { return s.id !== id; });
    refresh();
  }
});
 
clearBtn.addEventListener('click', function () {
  if (subjects.length === 0) return;
  if (confirm('Remove all subjects? This cannot be undone.')) {
    subjects = [];
    refresh();
  }
});

menuBtn.addEventListener('click', function () {
  navMenu.classList.toggle('open');
});
navMenu.addEventListener('click', function (event) {
  if (event.target.tagName === 'A') navMenu.classList.remove('open');
});
 
function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}
themeBtn.addEventListener('click', function () {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  localStorage.setItem('gradecheck-theme', isDark ? 'dark' : 'light');
});

applyTheme(localStorage.getItem('gradecheck-theme') === 'dark');
document.getElementById('year').textContent = new Date().getFullYear();
refresh();