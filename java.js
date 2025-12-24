/***********************
 * DONNÉES (localStorage)
 ***********************/
let employees = JSON.parse(localStorage.getItem("employees")) || [];
let leaves = JSON.parse(localStorage.getItem("leaves")) || 0;
let showAll = false;

/***********************
 * GÉNÉRATION IDENTIFIANT
 ***********************/
function generateUniqueIdentifier() {
  let identifier;
  let isUnique = false;
  
  while (!isUnique) {
    // Générer un nombre aléatoire de 4 chiffres (1000 à 9999)
    identifier = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Vérifier que l'identifiant n'existe pas déjà
    isUnique = !employees.some(e => e.identifier === identifier);
  }
  
  return identifier;
}

// Générer des identifiants pour les employés existants qui n'en ont pas
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

/***********************
 * DOM
 ***********************/
const employeesBody = document.getElementById("employeesBody");

const modal = document.getElementById("employeeModal");
const form = document.getElementById("employeeForm");

const empName = document.getElementById("empName");
const empRole = document.getElementById("empRole");
const empCin = document.getElementById("empCin");
const empIdentifier = document.getElementById("empIdentifier");
const empDepartment = document.getElementById("empDepartment");
const empStatus = document.getElementById("empStatus");

// KPI
const kpiEmployees = document.getElementById("kpiEmployees");
const kpiCandidates = document.getElementById("kpiCandidates");
const kpiNew = document.getElementById("kpiNew");
const kpiLeave = document.getElementById("kpiLeave");

// Sections
const metricsSection = document.querySelector(".metrics");

// Menu
const menuItems = document.querySelectorAll(".menu-item");
const dashboardMenu = menuItems[0];
const employeesMenu = menuItems[1];
const planningMenu = menuItems[3];

// Sections
const employeesCard = document.getElementById("employeesCard");
const planningCard = document.getElementById("planningCard");

// Bouton "Ajouter un employé"
const addEmployeeBtn = document.querySelector(".card-actions .btn:last-child");

// Barre de recherche
const searchContainer = document.querySelector(".search-container");
const searchInput = document.getElementById("searchEmployees");

// Mode édition
let editingCin = null;
const modalTitle = document.querySelector("#employeeModal h3");
const submitButton = document.querySelector("#employeeForm button[type='submit']");


/***********************
 * MODAL
 ***********************/
function openModal(identifier = null) {
  editingCin = identifier;
  
  if (identifier) {
    // Mode édition
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
      // Désactiver le champ identifiant en mode édition (identifiant unique)
      empIdentifier.disabled = true;
      empCin.disabled = false; // CIN peut être modifié
    }
  } else {
    // Mode ajout - générer automatiquement l'identifiant
    const newIdentifier = generateUniqueIdentifier();
    empIdentifier.value = newIdentifier;
    empIdentifier.disabled = true; // Désactiver car généré automatiquement
    empCin.disabled = false; // CIN peut être saisi
    
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

// fermer modal en cliquant à l’extérieur
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

/***********************
 * RENDER EMPLOYÉS
 ***********************/
function renderEmployees(searchTerm = "") {
  employeesBody.innerHTML = "";

  // Filtrer les employés si un terme de recherche est fourni
  let filteredEmployees = employees;
  if (searchTerm && searchTerm.trim() !== "") {
    // Diviser la recherche en plusieurs mots-clés
    const keywords = searchTerm.toLowerCase().trim().split(/\s+/).filter(k => k.length > 0);
    
    filteredEmployees = employees.filter((e) => {
      // Créer une chaîne de texte combinant tous les champs de l'employé
      const searchableText = `${e.name} ${e.cin} ${e.identifier || ''} ${e.role} ${e.department} ${e.status}`.toLowerCase();
      
      // Vérifier que tous les mots-clés sont présents dans le texte de recherche
      return keywords.every(keyword => searchableText.includes(keyword));
    });
  }

  // Trier les employés par ordre alphabétique (par nom)
  filteredEmployees.sort((a, b) => {
    return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
  });

  // Dashboard → 3 employés / Employés → tous
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

/***********************
 * NAVIGATION
 ***********************/
function showDashboard() {
  showAll = false;

  // afficher KPI
  metricsSection.style.display = "grid";

  // cacher bouton ajouter employé
  addEmployeeBtn.style.display = "none";

  // cacher barre de recherche
  searchContainer.style.display = "none";

  // Afficher section employés, cacher planning
  employeesCard.style.display = "block";
  planningCard.style.display = "none";

  // menu actif
  menuItems.forEach(i => i.classList.remove("active"));
  dashboardMenu.classList.add("active");

  // Réinitialiser la recherche
  searchInput.value = "";
  renderEmployees();
}

function showEmployeesPage() {
  showAll = true;

  // cacher KPI
  metricsSection.style.display = "none";

  // afficher bouton ajouter employé
  addEmployeeBtn.style.display = "inline-block";

  // afficher barre de recherche
  searchContainer.style.display = "block";

  // Afficher section employés, cacher planning
  employeesCard.style.display = "block";
  planningCard.style.display = "none";

  // menu actif
  menuItems.forEach(i => i.classList.remove("active"));
  employeesMenu.classList.add("active");

  renderEmployees();
}

function showPlanningPage() {
  // Cacher KPI et section employés
  metricsSection.style.display = "none";
  employeesCard.style.display = "none";
  
  // Afficher planning
  planningCard.style.display = "block";

  // menu actif
  menuItems.forEach(i => i.classList.remove("active"));
  planningMenu.classList.add("active");

  // Initialiser le calendrier
  renderCalendar();
}

// bouton "Tout"
function showAllEmployees() {
  showEmployeesPage();
}

// clic menu
dashboardMenu.addEventListener("click", showDashboard);
employeesMenu.addEventListener("click", showEmployeesPage);
planningMenu.addEventListener("click", showPlanningPage);

/***********************
 * GÉNÉRATION IDENTIFIANT
 ***********************/
function generateUniqueIdentifier() {
  let identifier;
  let isUnique = false;
  
  while (!isUnique) {
    // Générer un nombre aléatoire de 4 chiffres (1000 à 9999)
    identifier = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Vérifier que l'identifiant n'existe pas déjà
    isUnique = !employees.some(e => e.identifier === identifier);
  }
  
  return identifier;
}

/***********************
 * ÉDITION EMPLOYÉ
 ***********************/
function editEmployee(identifier) {
  openModal(identifier);
}

/***********************
 * AJOUT/MODIFICATION EMPLOYÉ
 ***********************/
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
    // Mode édition : mettre à jour l'employé existant
    const index = employees.findIndex(e => e.identifier === editingCin);
    if (index !== -1) {
      // Utiliser l'identifiant original (editingCin) pour éviter tout problème
      employee.identifier = editingCin;
      employees[index] = employee;
    }
  } else {
    // Mode ajout : ajouter un nouvel employé
    employees.push(employee);
  }

  localStorage.setItem("employees", JSON.stringify(employees));

  // Maintenir la recherche actuelle après modification
  const currentSearch = searchInput.value;
  renderEmployees(currentSearch);
  closeModal();
});

/***********************
 * SUPPRESSION
 ***********************/
function removeEmployee(identifier) {
  if (!confirm("Supprimer cet employé ?")) return;

  employees = employees.filter(e => e.identifier !== identifier);
  leaves++;

  localStorage.setItem("employees", JSON.stringify(employees));
  localStorage.setItem("leaves", leaves);

  // Maintenir la recherche actuelle après suppression
  const currentSearch = searchInput.value;
  renderEmployees(currentSearch);
}

/***********************
 * KPI
 ***********************/
function updateKPI() {
  kpiEmployees.textContent = employees.length;

  kpiNew.textContent = employees.filter(
    e => e.status === "EN INTÉGRATION"
  ).length;

  kpiCandidates.textContent = 12; // simulé
  kpiLeave.textContent = leaves;
}

/***********************
 * RECHERCHE
 ***********************/
searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value;
  renderEmployees(searchTerm);
});

/***********************
 * PLANNING - CALENDRIER
 ***********************/
let currentDate = new Date();
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Mettre à jour le titre du mois
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  document.getElementById("calendarMonthYear").textContent = `${monthNames[month]} ${year}`;
  
  // Premier jour du mois
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
  
  const calendarGrid = document.getElementById("calendarGrid");
  calendarGrid.innerHTML = "";
  
  // Jours vides avant le premier jour
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day empty";
    calendarGrid.appendChild(emptyDay);
  }
  
  // Jours du mois
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour la comparaison
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);
    
    const isPast = dayDate < today;
    const dayTasks = tasks.filter(t => t.date === dateStr);
    
    // Fonction pour créer le HTML d'une tâche avec tooltip
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
      
      // Ajouter un gestionnaire de clic uniquement pour les jours futurs ou aujourd'hui
      dayElement.addEventListener("click", () => {
        openTaskModal(dateStr);
      });
    }
    
    // Marquer aujourd'hui
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

/***********************
 * MODAL TÂCHE
 ***********************/
const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

function openTaskModal(selectedDate = null) {
  taskModal.classList.remove("hidden");
  // Utiliser la date sélectionnée ou la date du jour par défaut
  const today = new Date().toISOString().split('T')[0];
  const dateToUse = selectedDate || today;
  
  const dateInput = document.getElementById("taskDate");
  dateInput.value = dateToUse;
  dateInput.min = today; // Empêcher la sélection de dates passées
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
  
  // Vérifier que la date n'est pas dans le passé
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

/***********************
 * INIT
 ***********************/
// S'assurer que tous les employés ont un identifiant
ensureAllEmployeesHaveIdentifier();

// Définir la date minimale pour le champ date (aujourd'hui)
const taskDateInput = document.getElementById("taskDate");
if (taskDateInput) {
  const today = new Date().toISOString().split('T')[0];
  taskDateInput.min = today;
}

showDashboard();
