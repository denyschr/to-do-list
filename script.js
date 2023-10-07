const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const addedTasks = []
const completedTasks = [];

const runtimeSound = new Audio('sources/completed-task.mp3');

const dom = {
	new: document.getElementById('new'),
	add: document.getElementById('add'),
	tasks: document.getElementById('tasks'),
	navBtns: document.querySelectorAll('.sidebar-todo__button'),
	contents: document.querySelectorAll('.todo__content'),
	completed: document.getElementById('completed'),
	backdrop: document.getElementById('backdrop'),
	notif: document.getElementById('notification'),
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

document.addEventListener('DOMContentLoaded', () => {
	dom.add.disabled = true;
	dom.add.style.opacity = 0.8;
	dom.add.style.pointerEvents = 'none';
	dom.new.addEventListener('input', stateHandle);
});

function stateHandle(e) {
	if (e.target.value === '') {
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
	dom.new.value = null;
	addTask(task, addedTasks);
	dom.new.focus();
	dom.add.disabled = true;
	dom.add.style.opacity = 0.8;
	dom.add.style.pointerEvents = 'none';
});

function addTask(text, taskList) {
	const timestamp = Date.now();
	const task = {
		id: timestamp,
		text,
	}
	showBackdrop(addedTasks);
	taskList.push(task);
	taskRender(addedTasks);
	notif(mssg = 'Task added');
}

function showBackdrop(taskList) {
	if (!taskList.length == 0) {
		dom.backdrop.remove();
	} else {
		dom.tasks.innerHTML = `<div id="backdrop" class="todo__backdrop backdrop-todo">
			<div class="backdrop-todo__img">
				<img src="img/backdrop.jpg" width="380" alt="">
			</div>
			<h3 class="backdrop-todo__title">Your peace of mind is priceless</h3>
			<div class="backdrop-todo__text">
				<p>Well done! All your team's tasks are organized in the right place.</p>
			</div>
		</div>
		`;
	}
}

function taskRender(taskList) {
	let htmlContent = '';

	for (let task in taskList) {
		const taskContent = `<li id=${taskList[task].id} class="todo__task">
			<label class="todo__checkbox">
				<input type="checkbox">
				<div class="todo__checkbox-div"></div>
			</label>
			<p class="todo__task-text">${taskList[task].text}</p>
			<div class="todo__task-actions">
				<button class="todo__task-edit" title="Edit task">
					<img src="img/edit.svg" alt="Edit">
				</button>
				<button class="todo__task-delete" title="Delete task">
					<img src="img/trash.svg" alt="Trash">
				</button>
			</div>
		</li>
		`;
		htmlContent += taskContent;
	}
	dom.tasks.innerHTML = htmlContent;
}

function notif(text) {
	dom.notif.innerHTML = `<div class="notification__content">
		<span class="notification__caption">${text}!</span>
		<button class="notification__close" title="Close"></button>
	</div>`;
	const notifClose = document.querySelector('.notification__close');
	notifClose.addEventListener('click', e => {
		e.target.parentElement.remove();
	});
}

dom.tasks.addEventListener('click', e => {
	const el = e.target;
	const checkboxEl = el.classList.contains('todo__checkbox-div');
	const btnDeleteEl = el.parentElement.classList.contains('todo__task-delete');
	const btnEditEl = el.parentElement.classList.contains('todo__task-edit');

	if (checkboxEl) {
		const text = el.parentElement.nextElementSibling.textContent;

		const now = new Date();
		const timestamp = now.getTime();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const date = now.getDate();
		const day = daysOfTheWeek[now.getDay()];
		const month = monthNames[now.getMonth()];

		const completedTask = {
			id: timestamp,
			text,
			hours,
			minutes,
			date,
			day,
			month,
		}

		completedTasks.unshift(completedTask);
		const task = el.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		runtimeSound.play();
		setTimeout(() => {
			task.remove();
			changeTaskStatus(taskId, addedTasks, completedTasks);
			showBackdrop(addedTasks);
		}, 300);
		notif(mssg = 'Task completed');
	}

	if (btnDeleteEl) {
		const task = el.parentElement.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		task.remove();
		deleteTask(taskId, addedTasks);
		notif(mssg = 'Task deleted');
		showBackdrop(addedTasks);
	}

	if (btnEditEl) {
		const task = el.parentElement.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		const taskText = task.querySelector('.todo__task-text');
		const taskCheckbox = task.querySelector('.todo__checkbox');
		const taskActions = task.querySelector('.todo__task-actions');
		editTask(task, taskId, taskText, taskCheckbox, taskActions, addedTasks);
	}
});

function changeTaskStatus(id, taskList, completedTaskList) {
	let htmlContent = '';

	taskList.forEach((task, index) => {
		if (task.id === parseInt(id)) {
			taskList.splice(index, 1);
		}
	});

	completedTaskList.forEach(completedTask => {
		const taskContent = `<li id=${completedTask.id} class="completed-todo__task">
		<time class="completed-todo__date">${completedTask.date} ${completedTask.month} ‧ ${completedTask.day}</time>
		<div class="completed-todo__body">
			<p class="completed-todo__text">
				<strong>You</strong> completed a task: <span>${completedTask.text}</span>
			</p>
			<time class="completed-todo__time">${completedTask.hours}:${completedTask.minutes}</time>
		</div>
	</li>`;
		htmlContent += taskContent;
	});
	dom.completed.innerHTML = htmlContent;
}

function editTask(task, id, text, checkbox, actions, taskList) {
	task.classList.add('todo__task--editing');
	actions.classList.add('todo__task-actions--editing');
	checkbox.remove();
	text.style.paddingBottom = '10px';
	actions.innerHTML = `
		<button class="todo__task-cancel" title="Cancel">Cancel</button>
		<button class="todo__task-save" title="Save">Save</button>
	`;

	const taskCancel = actions.querySelector('.todo__task-cancel');
	const taskSave = actions.querySelector('.todo__task-save');
	const input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.classList.add('todo__task-input');
	input.value = text.innerHTML;
	text.replaceWith(input);
	input.focus();

	input.addEventListener('input', e => {
		if (e.target.value === '') {
			taskSave.disabled = true;
			taskSave.style.opacity = 0.8;
			taskSave.style.pointerEvents = 'none';
		} else {
			taskSave.disabled = false;
			taskSave.style.opacity = 1;
			taskSave.style.pointerEvents = 'all';
		}
	});

	taskCancel.addEventListener('click', () => {
		taskRender(addedTasks);
	});

	taskSave.addEventListener('click', () => {
		taskList.forEach(task => {
			if (task.id === parseInt(id)) {
				task.text = input.value;
			}
		});
		taskRender(addedTasks);
	});
}

function deleteTask(id, taskList) {
	taskList.forEach((task, index) => {
		if (task.id === parseInt(id)) {
			taskList.splice(index, 1);
		}
	});
}