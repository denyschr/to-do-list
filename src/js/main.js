const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let addedTasks = [];
let completedTasks = [];
let completedContentHeight;
let inboxContentHegiht;

const runtimeSound = new Audio('sources/completed-task.mp3');

const dom = {
	burger: document.getElementById('burger'),
	sidebar: document.getElementById('sidebar'),
	inbox: document.getElementById('inbox'),
	completedTasks: document.getElementById('completed-tasks'),
	inboxCounter: document.getElementById('inbox-counter'),
	completedCounter: document.getElementById('completed-counter'),
	switch: document.getElementById('switch'),
	add: document.getElementById('add'),
	tasks: document.getElementById('tasks'),
	navBtns: document.querySelectorAll('.sidebar-todo__button'),
	contents: document.querySelectorAll('.todo__content'),
	completed: document.getElementById('completed'),
	modalDel: document.querySelector('.modal-del'),
	modalDelClose: document.querySelector('.modal-del__close'),
	modalDelText: document.querySelector('.modal-del__text span'),
	modalDelCancel: document.querySelector('.modal-del__cancel'),
	modalDelRemove: document.querySelector('.modal-del__remove'),
	notify: document.getElementById('notification'),
}

function initialStateOfTheme(themeName) {
	localStorage.setItem('theme', themeName);
	document.documentElement.className = themeName;
}

function toggleTheme() {
	if (localStorage.getItem('theme') == 'dark-theme') {
		initialStateOfTheme('light-theme');
	} else {
		initialStateOfTheme('dark-theme');
	}
}

function loadTheme() {
	const themeName = localStorage.getItem('theme');
	if (themeName == 'light-theme') {
		initialStateOfTheme('light-theme');
	} else if (themeName == 'dark-theme') {
		dom.switch.classList.add('switch-todo--active');
		initialStateOfTheme('dark-theme');
	}
}

loadTheme();

dom.switch.addEventListener('click', e => {
	e.currentTarget.classList.toggle('switch-todo--active');
	toggleTheme();
});

function loadAddedTasks() {
	const tasks = localStorage.getItem('addedTasks');
	if (JSON.parse(tasks) != null) {
		addedTasks = JSON.parse(tasks);
		taskRender(addedTasks);
	}
}

loadAddedTasks();

function loadCompletedTasks() {
	const tasks = localStorage.getItem('completedTasks');
	if (JSON.parse(tasks) != null) {
		completedTasks = JSON.parse(tasks);
		completedTaskRender(completedTasks);
	}
}

loadCompletedTasks();

function initialStateOfSidebar(value) {
	localStorage.setItem('sidebar', value);
}

function loadSidebar() {
	const sidebar = localStorage.getItem('sidebar');
	if (sidebar == 'true') {
		initialStateOfSidebar(true);
	} else if (sidebar == 'false') {
		initialStateOfSidebar(false);
		dom.sidebar.classList.remove('todo__sidebar--open');
	}
}

loadSidebar();

dom.burger.addEventListener('click', () => {
	dom.sidebar.classList.toggle('todo__sidebar--open');
	initialStateOfSidebar(dom.sidebar.classList.contains('todo__sidebar--open'));
});

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

function checkCounter(taskList, counter) {
	if (taskList.length == 0) {
		counter.innerHTML = '';
	} else {
		counter.innerHTML = `${taskList.length}`;
	}
}

checkCounter(addedTasks, dom.inboxCounter);
checkCounter(completedTasks, dom.completedCounter);

dom.add.addEventListener('click', addDialogBox);

function addDialogBox(e) {
	const target = e.currentTarget.parentElement;
	target.classList.add('todo__add--active');
	addTask(target, addedTasks);
}

function addTask(target) {
	target.innerHTML = `
		<input type="text" class="add-todo__input todo__task-input" placeholder="Task name">
			<div class="add-todo__actions">
				<button class="add-todo__cancel btn-cancel">Cancel</button>
				<button class="add-todo__add btn-add">Add task</button>
			</div>`;
	const input = target.querySelector('.add-todo__input');
	const btnCancel = target.querySelector('.add-todo__cancel');
	const btnAdd = target.querySelector('.add-todo__add');

	input.focus();
	btnAdd.disabled = true;
	btnAdd.style.opacity = 0.8;
	btnAdd.style.pointerEvents = 'none';
	let text = '';

	input.addEventListener('input', e => {
		text = e.target.value;
		btnStatus(text, btnAdd);
	});

	input.addEventListener('keyup', e => {
		if (e.key == 'Enter' && !e.target.value == '') {
			taskHandle(input, text, btnAdd, addedTasks);
		}
	});

	input.addEventListener('keydown', e => {
		if (e.key == 'Escape') {
			cancelTaskEntry(target);
		}
	});

	btnAdd.addEventListener('click', () => {
		taskHandle(input, text, btnAdd, addedTasks);
	});

	btnCancel.addEventListener('click', () => {
		cancelTaskEntry(target);
	});
}

function taskHandle(input, text, btnAdd, taskList) {
	const timestamp = Date.now();
	const task = {
		id: timestamp,
		text,
	}
	taskList.push(task);
	taskRender(addedTasks);
	input.value = '';
	input.focus();
	btnAdd.disabled = true;
	btnAdd.style.opacity = 0.8;
	btnAdd.style.pointerEvents = 'none';
	checkCounter(addedTasks, dom.inboxCounter);
	localStorage.setItem('addedTasks', JSON.stringify(addedTasks));
	notify(mssg = 'Task added');
}

function cancelTaskEntry(target) {
	target.classList.remove('todo__add--active');
	target.innerHTML = `
	<button id="add" class="add-todo__btn">
		<span class="add-todo__plus"></span>
		<span class="add-todo__text">Add task</span>
	</button>
	`;
	document.getElementById('add').addEventListener('click', addDialogBox);
}

function taskRender(taskList) {
	let htmlContent = '';

	for (let task in taskList) {
		const taskContent = `<div id=${taskList[task].id} class="todo__task">
			<label class="todo__checkbox">
				<input type="checkbox">
				<div class="todo__checkbox-div"></div>
			</label>
			<p class="todo__task-text">${taskList[task].text}</p>
			<div class="todo__task-actions">
				<button class="todo__task-edit" title="Edit task">
					<img src="images/svg/edit.svg" alt="Edit">
				</button>
				<button class="todo__task-delete" title="Delete task">
					<img src="images/svg/trash.svg" alt="Trash">
				</button>
			</div>
		</div>
		`;
		htmlContent += taskContent;
	}
	dom.tasks.innerHTML = htmlContent;
}

function completedTaskRender(taskList) {
	let htmlContent = '';

	for (let task in taskList) {
		const taskContent = `<li id=${taskList[task].id} class="completed-todo__task">
			<time class="completed-todo__date">${taskList[task].date} ${taskList[task].month} ‧ ${taskList[task].day}</time>
			<div class="completed-todo__body">
				<p class="completed-todo__text">
					<strong>You</strong> completed a task: <span>${taskList[task].text}</span>
				</p>
				<time class="completed-todo__time">${taskList[task].hours}:${taskList[task].minutes}</time>
			</div>
		</li>`;
		htmlContent += taskContent;
	}
	dom.completed.innerHTML = htmlContent;
}

function notify(text) {
	dom.notify.innerHTML = `<div class="notification__content">
		<span class="notification__caption">${text}!</span>
		<button class="notification__close btn-close" title="Close"></button>
	</div>`;
	const notifyClose = document.querySelector('.notification__close');
	notifyClose.addEventListener('click', e => {
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
		let minutes = now.getMinutes();
		const date = now.getDate();
		const day = daysOfTheWeek[now.getDay()];
		const month = monthNames[now.getMonth()];

		if (minutes < 10) {
			minutes = `0${minutes}`
		}

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
			localStorage.setItem('addedTasks', JSON.stringify(addedTasks));
			localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
			checkCounter(addedTasks, dom.inboxCounter);
			checkCounter(completedTasks, dom.completedCounter);
		}, 300);
		notify(mssg = 'Task completed');
	}

	if (btnDeleteEl) {
		const task = el.parentElement.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		const taskText = task.querySelector('.todo__task-text').innerHTML;
		deleteTask(task, taskId, taskText, addedTasks);
	}

	if (btnEditEl) {
		document.querySelectorAll('.todo__task').forEach(a => {
			a.classList.remove('todo__task--editing');
		});
		const task = el.parentElement.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		const taskText = task.querySelector('.todo__task-text');
		const taskCheckbox = task.querySelector('.todo__checkbox');
		const taskActions = task.querySelector('.todo__task-actions');
		taskEditing(task, taskId, taskText, taskCheckbox, taskActions);
	}
});

function changeTaskStatus(id, addedTaskList, completedTaskList) {
	let htmlContent = '';

	addedTaskList.forEach((task, index) => {
		if (task.id === parseInt(id)) {
			addedTaskList.splice(index, 1);
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

function taskEditing(task, id, text, checkbox, actions) {
	const taskId = id;
	task.classList.add('todo__task--editing');
	actions.classList.add('todo__task-actions--editing');
	checkbox.remove();
	text.style.paddingBottom = '10px';
	actions.innerHTML = `
		<button class="todo__task-cancel btn-cancel" title="Cancel">Cancel</button>
		<button class="todo__task-save btn-save" title="Save">Save</button>
	`;

	const btnCancel = actions.querySelector('.todo__task-cancel');
	const btnSave = actions.querySelector('.todo__task-save');
	const input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.classList.add('todo__task-input');
	input.value = text.innerHTML;
	text.replaceWith(input);
	input.focus();

	input.addEventListener('input', e => {
		const targetValue = e.target.value;
		btnStatus(targetValue, btnSave);
	});

	input.addEventListener('keyup', e => {
		if (e.key == 'Enter' && !e.target.value == '') {
			saveTaskEditing(addedTasks, taskId, input);
		}
	});

	input.addEventListener('keydown', e => {
		if (e.key == 'Escape') {
			cancelTaskEditing();
		}
	});

	btnCancel.addEventListener('click', cancelTaskEditing);

	btnSave.addEventListener('click', () => {
		saveTaskEditing(addedTasks, taskId, input);
	});
}

function btnStatus(value, btn) {
	if (value === '') {
		btn.disabled = true;
		btn.style.opacity = 0.8;
		btn.style.pointerEvents = 'none';
	} else {
		btn.disabled = false;
		btn.style.opacity = 1;
		btn.style.pointerEvents = 'all';
	}
}

function saveTaskEditing(taskList, id, input) {
	taskList.forEach(task => {
		if (task.id === parseInt(id)) {
			task.text = input.value;
		}
	});
	taskRender(addedTasks);
	localStorage.setItem('addedTasks', JSON.stringify(addedTasks));
}

function cancelTaskEditing() {
	taskRender(addedTasks);
}

function modalClose() {
	dom.modalDel.classList.remove('modal-del--open');
}

function deleteTask(task, id, taskText, taskList) {
	dom.modalDel.classList.add('modal-del--open');
	dom.modalDelText.innerHTML = taskText;
	dom.modalDelClose.addEventListener('click', modalClose);
	dom.modalDelCancel.addEventListener('click', modalClose);
	dom.modalDelRemove.addEventListener('click', () => {
		task.remove();
		taskList.forEach((task, index) => {
			if (task.id === parseInt(id)) {
				taskList.splice(index, 1);
			}
		});
		localStorage.setItem('addedTasks', JSON.stringify(taskList));
		checkCounter(addedTasks, dom.inboxCounter);
		notify(mssg = 'Task deleted');
		modalClose();
	});
}