function FullStackBookToDo() {
  const td = {}
  td.API_URL = "http://localhost:8000";
  td.elements = {}

  this.init = async function () {
    document.addEventListener("DOMContentLoaded", async function () {
      td.getElements()
      await td.fetchToDos()
      await td.renderToDos()
      td.bindEvents()
    });
  }

  td.getElements = function () {
    td.elements.toDoContainer = document.querySelector(".toDoContainer")
    td.elements.addToDoBtn = document.querySelector(".addToDoBtn")
    td.elements.deleteBtn = document.querySelector(".deleteBtn")
    td.elements.checkboxes = document.querySelectorAll(".toDoCheckbox")
    td.elements.mainInput = document.querySelector(".mainInput")
    td.elements.allFilter = document.querySelector(".filterBtn.all")
    td.elements.activeFilter = document.querySelector(".filterBtn.active")
    td.elements.completedFilter = document.querySelector(".filterBtn.completed")
  }

  td.fetchToDos = async function (completed) {
    let path = "todos"
    if (completed !== undefined) {
      path += `?completed=${completed}`
    }
    const todos = await fetch(`${td.API_URL}/${path}`).then((res) => res.json());
    td.todos = todos
  }

  td.renderToDos = async function () {
    td.elements.toDoContainer.innerHTML = "";
    td.todos.forEach((todo) => {
      const div = document.createElement("div")
      div.className = "todoRow"

      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.className = "toDoCheckbox"
      checkbox.dataset.id = todo.id
      checkbox.checked = todo.completed ? "checked" : ""

      const input = document.createElement("input")
      input.type = "text"
      input.value = todo.name
      input.className = "todoInput"
      input.dataset.id = todo.id

      const btn = document.createElement("button")
      btn.className = "deleteBtn"
      btn.dataset.id = todo.id
      const img = document.createElement("img")
      img.src = "/material-symbols_delete-outline-sharp.svg"
      btn.appendChild(img)

      div.appendChild(checkbox)
      div.appendChild(input)
      div.appendChild(btn)
      td.elements.toDoContainer.appendChild(div)
    })
  }

  td.bindEvents = function () {
    document.addEventListener("click", function (event) {
      if (event.target.className === "toDoCheckbox") {
        td.handleClick(event.target.dataset.id)
      }

      if (event.target.className === "deleteBtn") {
        console.log("del");
        td.handleDelete(event.target.dataset.id)
      }
    })

    document.addEventListener("input", function (event) {
      if (event.target.className === "toDoInput") {
        console.log(event.target.value)
        td.handleChange(event.target.dataset.id, event.target.value)
      }
    })

    td.elements.mainInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        td.addToDo(event.target.value)
      }
    })

    td.elements.allFilter.addEventListener("click", async function (event) {
      await td.fetchToDos()
      td.renderToDos()
    })

    td.elements.activeFilter.addEventListener("click", async function (event) {
      await td.fetchToDos(false)
      td.renderToDos()
    })

    td.elements.completedFilter.addEventListener("click", async function (event) {
      await td.fetchToDos(true)
      td.renderToDos()
    })
  }

  td.handleClick = async function (id) {
    const idx = td.todos.findIndex((t) => t.id === parseInt(id))
    td.todos[idx].completed = !td.todos[idx].completed
    console.log(td.todos[idx])
    await fetch(`${td.API_URL}/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(td.todos[idx]),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json())
  }

  td.handleChange = _.debounce(async function (id, value) {
    const idx = td.todos.findIndex((t) => t.id === parseInt(id))
    td.todos[idx].name = value
    await fetch(`${td.API_URL}/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(td.todos[idx]),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json())
  }, 500)

  td.addToDo = async function (name) {
    const data = { name: name, completed: false }
    await fetch(`${td.API_URL}/todos`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    td.todos.push(data)
    td.renderToDos()
    td.elements.mainInput.value = ""
  }

  td.handleDelete = async function (id) {
    await fetch(`${td.API_URL}/todos/${id}`, {
      method: "DELETE"
    })
    const idx = td.todos.findIndex((t) => t.id === parseInt(id))
    td.todos.splice(idx, 1)
  }
}

const app = new FullStackBookToDo()
app.init()