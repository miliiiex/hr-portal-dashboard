
let employees = JSON.parse(localStorage.getItem("employees")) || [];
let leaves = JSON.parse(localStorage.getItem("leaves")) || 0;
let showAll = false;


function generateUniqueIdentifier() {
  let identifier;
  let isUnique = false;
  
  while (!isUnique) {

    identifier = Math.floor(1000 + Math.random() * 9000).toString();
    

    isUnique = !employees.some(e => e.identifier === identifier);
  }
  
  return identifier;
}


function ensureAllEmployeesHaveIdentifier() {
  let hasChanges = false;
  
  employees.forEach((employee) => {
    if (!employee.identifier) {
      employee.identifier = generateUniqueIdentifier();
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    localStorage.setItem("employees", JSON.stringify(employees));
  }
}


const employeesBody = document.getElementById("employeesBody");

const modal = document.getElementById("employeeModal");
const form = document.getElementById("employeeForm");

const empName = document.getElementById("empName");
const empRole = document.getElementById("empRole");
const empCin = document.getElementById("empCin");
const empIdentifier = document.getElementById("empIdentifier");
const empDepartment = document.getElementById("empDepartment");
const empStatus = document.getElementById("empStatus");


const kpiEmployees = document.getElementById("kpiEmployees");
const kpiCandidates = document.getElementById("kpiCandidates");
const kpiNew = document.getElementById("kpiNew");
const kpiLeave = document.getElementById("kpiLeave");


const metricsSection = document.querySelector(".metrics");


const menuItems = document.querySelectorAll(".menu-item");
const dashboardMenu = menuItems[0];
const employeesMenu = menuItems[1];
const planningMenu = menuItems[3];


const employeesCard = document.getElementById("employeesCard");
const planningCard = document.getElementById("planningCard");


const addEmployeeBtn = document.querySelector(".card-actions .btn:last-child");


const searchContainer = document.querySelector(".search-container");
const searchInput = document.getElementById("searchEmployees");

let editingCin = null;
const modalTitle = document.querySelector("#employeeModal h3");
const submitButton = document.querySelector("#employeeForm button[type='submit']");



function openModal(identifier = null) {
  editingCin = identifier;
  
  if (identifier) {
    const employee = employees.find(e => e.identifier === identifier);
    if (employee) {
      empName.value = employee.name;
      empRole.value = employee.role;
      empCin.value = employee.cin;
      empIdentifier.value = employee.identifier;
      empDepartment.value = employee.department;
      empStatus.value = employee.status;
      
      modalTitle.textContent = "Modifier un employé";
      submitButton.textContent = "Modifier";
      
      empIdentifier.disabled = true;
      empCin.disabled = false; 
    }
  } else {
   
    const newIdentifier = generateUniqueIdentifier();
    empIdentifier.value = newIdentifier;
    empIdentifier.disabled = true; 
    empCin.disabled = false; 
    
    modalTitle.textContent = "Ajouter un employé";
    submitButton.textContent = "Ajouter";
  }
  
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  form.reset();
  editingCin = null;
  empCin.disabled = false;
  empIdentifier.disabled = false;
}


modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});


function renderEmployees(searchTerm = "") {
  employeesBody.innerHTML = "";

  
  let filteredEmployees = employees;
  if (searchTerm && searchTerm.trim() !== "") {
  
    const keywords = searchTerm.toLowerCase().trim().split(/\s+/).filter(k => k.length > 0);
    
    filteredEmployees = employees.filter((e) => {
    
      const searchableText = `${e.name} ${e.cin} ${e.identifier || ''} ${e.role} ${e.department} ${e.status}`.toLowerCase();
      
    
      return keywords.every(keyword => searchableText.includes(keyword));
    });
  }

  
  filteredEmployees.sort((a, b) => {
    return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
  });


  const listToShow = showAll ? filteredEmployees : filteredEmployees.slice(0, 4);

  if (listToShow.length === 0) {
    employeesBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--muted);">
          Aucun employé trouvé
        </td>
      </tr>
    `;
  } else {
    listToShow.forEach((e) => {
      employeesBody.innerHTML += `
        <tr>
          <td class="employee">
            <img src="https://i.pravatar.cc/40?u=${e.identifier || e.cin}">
            ${e.name}
          </td>
          <td>${e.role}</td>
          <td>${e.cin}</td>
          <td>${e.department}</td>
          <td>
            <span class="status ${e.status === "ACTIF" ? "active" : "onboarding"}">
              ${e.status}
            </span>
          </td>
          <td>${e.identifier || 'N/A'}</td>
          <td class="actions">
            <button class="btn-icon edit" onclick="editEmployee('${e.identifier || e.cin}')" title="Modifier">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn-icon delete" onclick="removeEmployee('${e.identifier || e.cin}')" title="Supprimer">
              <i class="fa fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  }

  updateKPI();
}


function showDashboard() {
  showAll = false;

 
  metricsSection.style.display = "grid";

 
  addEmployeeBtn.style.display = "none";


  searchContainer.style.display = "none";


  employeesCard.style.display = "block";
  planningCard.style.display = "none";

 
  menuItems.forEach(i => i.classList.remove("active"));
  dashboardMenu.classList.add("active");


  searchInput.value = "";
  renderEmployees();
}

function showEmployeesPage() {
  showAll = true;


  metricsSection.style.display = "none";

  addEmployeeBtn.style.display = "inline-block";


  searchContainer.style.display = "block";


  employeesCard.style.display = "block";
  planningCard.style.display = "none";

  menuItems.forEach(i => i.classList.remove("active"));
  employeesMenu.classList.add("active");

  renderEmployees();
}

function showPlanningPage() {

  metricsSection.style.display = "none";
  employeesCard.style.display = "none";
  

  planningCard.style.display = "block";


  menuItems.forEach(i => i.classList.remove("active"));
  planningMenu.classList.add("active");


  renderCalendar();
}


function showAllEmployees() {
  showEmployeesPage();
}


dashboardMenu.addEventListener("click", showDashboard);
employeesMenu.addEventListener("click", showEmployeesPage);
planningMenu.addEventListener("click", showPlanningPage);


function generateUniqueIdentifier() {
  let identifier;
  let isUnique = false;
  
  while (!isUnique) {
  
    identifier = Math.floor(1000 + Math.random() * 9000).toString();
    
 
    isUnique = !employees.some(e => e.identifier === identifier);
  }
  
  return identifier;
}


function editEmployee(identifier) {
  openModal(identifier);
}


form.addEventListener("submit", function (e) {
  e.preventDefault();

  const employee = {
    name: empName.value.trim(),
    role: empRole.value.trim(),
    cin: empCin.value.trim(),
    identifier: empIdentifier.value.trim(),
    department: empDepartment.value,
    status: empStatus.value
  };

  if (editingCin) {
  
    const index = employees.findIndex(e => e.identifier === editingCin);
    if (index !== -1) {
      
      employee.identifier = editingCin;
      employees[index] = employee;
    }
  } else {
   
    employees.push(employee);
  }

  localStorage.setItem("employees", JSON.stringify(employees));


  const currentSearch = searchInput.value;
  renderEmployees(currentSearch);
  closeModal();
});


function removeEmployee(identifier) {
  if (!confirm("Supprimer cet employé ?")) return;

  employees = employees.filter(e => e.identifier !== identifier);
  leaves++;

  localStorage.setItem("employees", JSON.stringify(employees));
  localStorage.setItem("leaves", leaves);


  const currentSearch = searchInput.value;
  renderEmployees(currentSearch);
}

function updateKPI() {
  kpiEmployees.textContent = employees.length;

  kpiNew.textContent = employees.filter(
    e => e.status === "EN INTÉGRATION"
  ).length;

  kpiCandidates.textContent = 12;
  kpiLeave.textContent = leaves;
}


searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value;
  renderEmployees(searchTerm);
});



let currentDate = new Date();
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  document.getElementById("calendarMonthYear").textContent = `${monthNames[month]} ${year}`;
  

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7; 
  
  const calendarGrid = document.getElementById("calendarGrid");
  calendarGrid.innerHTML = "";
  

  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day empty";
    calendarGrid.appendChild(emptyDay);
  }
  

  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);
    
    const isPast = dayDate < today;
    const dayTasks = tasks.filter(t => t.date === dateStr);
    
  
    const createTaskDot = (task) => {
      const taskInfo = `
        <div class="task-title">${task.title}</div>
        ${task.time ? `<div class="task-time">⏰ ${task.time}</div>` : ''}
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
      `;
      return `<div class="task-dot-wrapper">
        <div class="task-dot" data-task-id="${task.id}"></div>
        <div class="task-tooltip">
          ${taskInfo}
        </div>
      </div>`;
    };
    
    if (isPast) {
      dayElement.className = "calendar-day past";
      dayElement.innerHTML = `
        <div class="day-number">${day}</div>
        <div class="day-tasks">
          ${dayTasks.map(createTaskDot).join('')}
        </div>
      `;
    } else {
      dayElement.className = "calendar-day";
      dayElement.innerHTML = `
        <div class="day-number">${day}</div>
        <div class="day-tasks">
          ${dayTasks.map(createTaskDot).join('')}
        </div>
      `;
      
    
      dayElement.addEventListener("click", () => {
        openTaskModal(dateStr);
      });
    }
  
    if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
      dayElement.classList.add("today");
    }
    
    calendarGrid.appendChild(dayElement);
  }
}

function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}


const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

function openTaskModal(selectedDate = null) {
  taskModal.classList.remove("hidden");

  const today = new Date().toISOString().split('T')[0];
  const dateToUse = selectedDate || today;
  
  const dateInput = document.getElementById("taskDate");
  dateInput.value = dateToUse;
  dateInput.min = today;
}

function closeTaskModal() {
  taskModal.classList.add("hidden");
  taskForm.reset();
}

taskModal.addEventListener("click", (e) => {
  if (e.target === taskModal) closeTaskModal();
});

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  
  const taskDate = document.getElementById("taskDate").value;
  const today = new Date().toISOString().split('T')[0];
  
 
  if (taskDate < today) {
    alert("Vous ne pouvez pas créer une tâche pour une date passée.");
    return;
  }
  
  const task = {
    id: Date.now(),
    title: document.getElementById("taskTitle").value.trim(),
    date: taskDate,
    time: document.getElementById("taskTime").value,
    description: document.getElementById("taskDescription").value.trim()
  };
  
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  
  renderCalendar();
  closeTaskModal();
});


ensureAllEmployeesHaveIdentifier();


const taskDateInput = document.getElementById("taskDate");
if (taskDateInput) {
  const today = new Date().toISOString().split('T')[0];
  taskDateInput.min = today;
}

showDashboard();

