const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const addedTasks = []
const completedTasks = [];
let contentHeight;

const runtimeSound = new Audio('sources/completed-task.mp3');

const dom = {
	burger: document.getElementById('burger'),
	sidebar: document.getElementById('sidebar'),
	inbox: document.getElementById('inbox'),
	completedTasks: document.getElementById('completed-tasks'),
	inboxCounter: document.getElementById('inbox-counter'),
	completedCounter: document.getElementById('completed-counter'),
	new: document.getElementById('new'),
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
	backdrop: document.getElementById('backdrop'),
	notif: document.getElementById('notification'),
}

dom.burger.addEventListener('click', () => {
	dom.sidebar.classList.toggle('todo__sidebar--open');
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
		if (dom.completedTasks.scrollHeight > contentHeight) {
			dom.completedTasks.style.overflowY = 'scroll';
		}
	});
});

document.addEventListener('DOMContentLoaded', () => {
	dom.inbox.classList.remove('todo__content--active');
	dom.completedTasks.classList.add('todo__content--active');
	contentHeight = dom.completedTasks.offsetHeight;
	dom.completedTasks.style.maxHeight = `${contentHeight}px`;
	dom.completedTasks.classList.remove('todo__content--active');
	dom.inbox.classList.add('todo__content--active');

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

function checkCounter() {
	if (addedTasks.length == 0) {
		dom.inboxCounter.innerHTML = '';
	} else {
		dom.inboxCounter.innerHTML = `${addedTasks.length}`;
	}
}

dom.add.addEventListener('click', () => {
	const task = dom.new.value;
	task.lastIndexOf(" ");
	dom.new.value = '';
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
	dom.inboxCounter.innerHTML = `${addedTasks.length}`;
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
		<button class="notification__close btn-close" title="Close"></button>
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
			showBackdrop(addedTasks);
		}, 300);
		dom.completedCounter.innerHTML = `${completedTasks.length}`;
		notif(mssg = 'Task completed');
	}

	if (btnDeleteEl) {
		const task = el.parentElement.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		const taskText = task.querySelector('.todo__task-text').innerHTML;
		deleteTask(task, taskId, taskText, addedTasks);
	}

	if (btnEditEl) {
		const task = el.parentElement.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		const taskText = task.querySelector('.todo__task-text');
		const taskCheckbox = task.querySelector('.todo__checkbox');
		const taskActions = task.querySelector('.todo__task-actions');
		editTask(task, taskId, taskText, taskCheckbox, taskActions);
	}
});

function changeTaskStatus(id, taskList, completedTaskList) {
	let htmlContent = '';

	taskList.forEach((task, index) => {
		if (task.id === parseInt(id)) {
			taskList.splice(index, 1);
		}
	});

	checkCounter();

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

function editTask(task, id, text, checkbox, actions) {
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
			taskSave(addedTasks, taskId, input);
		}
	});

	btnCancel.addEventListener('click', taskCancel);

	btnSave.addEventListener('click', () => {
		taskSave(addedTasks, taskId, input);
	});
}

function btnStatus(value, btnSave) {
	if (value === '') {
		btnSave.disabled = true;
		btnSave.style.opacity = 0.8;
		btnSave.style.pointerEvents = 'none';
	} else {
		btnSave.disabled = false;
		btnSave.style.opacity = 1;
		btnSave.style.pointerEvents = 'all';
	}
}

function taskSave(taskList, id, input) {
	taskList.forEach(task => {
		if (task.id === parseInt(id)) {
			task.text = input.value;
		}
	});
	taskRender(addedTasks);
}

function taskCancel() {
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
		modalClose();
		checkCounter();
		notif(mssg = 'Task deleted');
		showBackdrop(addedTasks);
	});
}