
let employees = JSON.parse(localStorage.getItem("employees")) || [];

const employeesBody = document.getElementById("employeesBody");
const modal = document.getElementById("employeeModal");
const form = document.getElementById("employeeForm");
const empName = document.getElementById("empName");
const empRole = document.getElementById("empRole");
const empCin = document.getElementById("empCin");
const empDepartment = document.getElementById("empDepartment");
const empStatus = document.getElementById("empStatus");


function openModal(){
  modal.classList.remove("hidden");
}

function closeModal(){
  modal.classList.add("hidden");
  form.reset();
}


function renderEmployees(){
  employeesBody.innerHTML = "";

  employees.forEach((e,i)=>{
    employeesBody.innerHTML += `
      <tr>
        <td>${e.name}</td>
        <td>${e.role}</td>
        <td>${e.cin}</td>
        <td>${e.department}</td>
        <td><span class="status ${e.status === "ACTIF" ? "active" : "onboarding"}">${e.status}</span></td>
        <td>Activé</td>
        <td>
          <button class="btn-icon delete" onclick="removeEmployee(${i})"><i class="fa fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
}


function removeEmployee(index){
  if(confirm("Supprimer cet employé ?")){
    employees.splice(index,1);
    localStorage.setItem("employees", JSON.stringify(employees));
    renderEmployees();
  }
}


form.addEventListener("submit",function(e){
  e.preventDefault();

  employees.push({
    name: empName.value,
    role: empRole.value,
    cin: empCin.value,
    department: empDepartment.value,
    status: empStatus.value
  });

  localStorage.setItem("employees", JSON.stringify(employees));
  renderEmployees();
  closeModal();
});

renderEmployees();
