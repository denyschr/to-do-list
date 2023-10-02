const dom = {
	new: document.getElementById('new'),
	add: document.getElementById('add'),
	tasks: document.getElementById('tasks'),
	navBtns: document.querySelectorAll('.sidebar-todo__button'),
	contents: document.querySelectorAll('.todo__content'),
	completed: document.querySelector('.todo__completed'),
}

dom.navBtns.forEach(navBtn => {
	navBtn.addEventListener('click', e => {
		let path = e.currentTarget.getAttribute('data-target');
		dom.navBtns.forEach(navBtn => {
			navBtn.classList.remove('sidebar-todo__button--active');
		});
		e.currentTarget.classList.add('sidebar-todo__button--active');
		dom.contents.forEach(content => {
			content.classList.remove('todo__content--active');
		});
		document.getElementById(`${path}`).classList.add('todo__content--active');
	});
});

const addedTasks = [];

document.addEventListener('DOMContentLoaded', () => {
	dom.add.disabled = true;
	dom.add.style.opacity = 0.8;
	dom.add.style.pointerEvents = 'none';
	dom.new.addEventListener('input', () => {
		setInterval(stateHandle, 100);
	});
});

function stateHandle() {
	if (dom.new.value === '') {
		dom.add.disabled = true;
		dom.add.style.opacity = 0.8;
		dom.add.style.pointerEvents = 'none';
	} else {
		dom.add.disabled = false;
		dom.add.style.opacity = 1;
		dom.add.style.pointerEvents = 'all';
	}
}

dom.add.addEventListener('click', () => {
	const task = dom.new.value;
	dom.new.value = '';
	addTask(task, addedTasks);
	dom.new.focus();
});

function addTask(text, taskList) {
	const timestamp = Date.now();
	const task = {
		id: timestamp,
		text,
		isCompleted: false
	}
	taskList.push(task);
	taskRender(addedTasks);
}

function taskRender(taskList) {
	let htmlContent = '';

	for (let task in taskList) {
		const cls = taskList[task].isCompleted ? 'todo__task todo__task_completed' : 'todo__task';
		const checked = taskList[task].isCompleted ? 'checked' : '';

		const taskContent = `
		<li id=${taskList[task].id} class="${cls}">
			<label class="todo__checkbox">
				<input type="checkbox" ${checked}>
				<div class="todo__checkbox-div"></div>
			</label>
			<p class="todo__task-text">${taskList[task].text}</p>
			<button class="todo__task-delete" title="Delete task">
				<img src="img/trash.svg" alt="Trash">
			</button>
		</li>
		`;

		htmlContent += taskContent;
	}
	dom.tasks.innerHTML = htmlContent;
}

dom.tasks.addEventListener('click', e => {
	const el = e.target;
	const checkboxEl = el.classList.contains('todo__checkbox-div');
	const btnDeleteEl = el.parentElement.classList.contains('todo__task-delete');
	if (checkboxEl) {
		const task = el.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		changeTaskStatus(taskId, addedTasks);
		taskRender(addedTasks);
	}
	if (btnDeleteEl) {
		const task = el.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		task.remove();
		deleteTask(taskId, addedTasks);
	}
});

function changeTaskStatus(id, taskList) {
	taskList.forEach(task => {
		if (task.id === parseInt(id)) {
			task.isCompleted = !task.isCompleted;
		}
	});
}

function deleteTask(id, taskList) {
	taskList.forEach((task, index) => {
		if (task.id === parseInt(id)) {
			taskList.splice(index, 1);
		}
	});
}