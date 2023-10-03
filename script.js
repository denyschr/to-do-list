const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const dom = {
	new: document.getElementById('new'),
	add: document.getElementById('add'),
	tasks: document.getElementById('tasks'),
	navBtns: document.querySelectorAll('.sidebar-todo__button'),
	contents: document.querySelectorAll('.todo__content'),
	completed: document.getElementById('completed'),
	backdrop: document.getElementById('backdrop'),
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
const completedTasks = [];

document.addEventListener('DOMContentLoaded', () => {
	dom.add.disabled = true;
	dom.add.style.opacity = 0.8;
	dom.add.style.cursor = 'not-allowed';
	dom.new.addEventListener('input', () => {
		setInterval(stateHandle, 100);
	});
});

function stateHandle() {
	if (dom.new.value === '') {
		dom.add.disabled = true;
		dom.add.style.opacity = 0.8;
		dom.add.style.cursor = 'not-allowed';
	} else {
		dom.add.disabled = false;
		dom.add.style.opacity = 1;
		dom.add.style.cursor = 'pointer';
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
	}
	showBackdrop(addedTasks);
	taskList.push(task);
	taskRender(addedTasks);
}

function showBackdrop(taskList) {
	if (!taskList.length == 0) {
		dom.backdrop.remove();
	} else {
		dom.tasks.innerHTML = `<div id="backdrop" class="todo__backdrop backdrop-todo">
			<div class="backdrop-todo__img">
				<img src="img/backdrop.jpg" width="380" alt="">
			</div>
			<h3 class="backdrop-todo__title">What do you need to get done today?</h3>
			<div class="backdrop-todo__text">
				<p>By default, tasks added here will be due today.</p>
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

		task.remove();
		changeTaskStatus(taskId, addedTasks, completedTasks);
		showBackdrop(addedTasks);
	}
	if (btnDeleteEl) {
		const task = el.parentElement.parentElement;
		const taskId = task.getAttribute('id');
		task.remove();
		deleteTask(taskId, addedTasks);
		showBackdrop(addedTasks);
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

function deleteTask(id, taskList) {
	taskList.forEach((task, index) => {
		if (task.id === parseInt(id)) {
			taskList.splice(index, 1);
		}
	});
}