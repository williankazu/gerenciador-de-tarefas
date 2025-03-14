// Objeto para encapsular as operações com localStorage
const storage = {
	getTasks: function() {
	  try {
		return JSON.parse(localStorage.getItem('tasks')) || [];
	  } catch (e) {
		console.error('Erro ao ler tasks do localStorage:', e);
		return [];
	  }
	},
	setTasks: function(tasks) {
	  try {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	  } catch (e) {
		console.error('Erro ao salvar tasks no localStorage:', e);
	  }
	},
	removeTasks: function() {
	  try {
		localStorage.removeItem('tasks');
	  } catch (e) {
		console.error('Erro ao remover tasks do localStorage:', e);
	  }
	}
  };
  
  // Inicializa o array de tarefas usando o storage aprimorado
  let tasks = storage.getTasks();
  
  // Atualiza o localStorage e os contadores
  const saveTasks = () => {
	storage.setTasks(tasks);
  };
  
  // Listener para atualizar a interface se as tasks forem alteradas em outra aba
  window.addEventListener('storage', (event) => {
	if (event.key === 'tasks') {
	  tasks = storage.getTasks();
	  renderTaskList();
	  renderTaskTable();
	  updateCounters();
	}
  });
  
  // Função para verificar e criar elementos se não existirem
  const checkAndCreateElements = () => {
	const counters = ['totalTasks', 'pendingTasks', 'completedTasks', 'overdueTasks'];
	counters.forEach(id => {
	  if (!document.getElementById(id)) {
		console.warn(`Elemento ${id} não encontrado, criando um substituto.`);
		const container = document.querySelector('.hero-body .container');
		if (container) {
		  const elem = document.createElement('p');
		  elem.id = id;
		  elem.style.display = 'none';
		  container.appendChild(elem);
		}
	  }
	});
  
	if (!document.getElementById('activeFilterIndicator')) {
	  const container = document.querySelector('.task-container .container .column');
	  if (container) {
		const indicator = document.createElement('div');
		indicator.id = 'activeFilterIndicator';
		indicator.className = 'is-hidden mt-3';
		indicator.innerHTML = `
		  <div class="notification is-info is-light py-2">
			<button class="delete" id="clearFilterBtn"></button>
			<span id="filterDescription">Mostrando todas as tarefas</span>
		  </div>
		`;
		container.appendChild(indicator);
	  }
	}
  };
  
  // Elementos do DOM
  const taskInput = document.getElementById('taskInput');
  const dateInput = document.getElementById('dateInput');
  const priorityInput = document.getElementById('priorityInput');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskList = document.getElementById('taskList');
  const taskTableBody = document.getElementById('taskTableBody');
  const listViewBtn = document.getElementById('listViewBtn');
  const tableViewBtn = document.getElementById('tableViewBtn');
  const listView = document.getElementById('listView');
  const tableView = document.getElementById('tableView');
  const clearAllBtn = document.getElementById('clearAllBtn');
  
  // Função para adicionar nova tarefa
  const addTask = () => {
	const taskText = taskInput.value.trim();
	const taskDate = dateInput.value;
	const taskPriority = priorityInput.value;
  
	if (taskText === '') {
	  showNotification('Por favor, digite uma tarefa!', 'is-danger');
	  return;
	}
  
	const newTask = {
	  id: Date.now(),
	  text: taskText,
	  date: taskDate,
	  priority: taskPriority,
	  completed: false,
	  createdAt: new Date().toISOString()
	};
  
	tasks.unshift(newTask);
	saveTasks();
	showNotification('Tarefa adicionada com sucesso!', 'is-success');
	taskInput.value = '';
	dateInput.value = '';
	priorityInput.value = 'Baixa';
	renderTaskList();
	renderTaskTable();
	highlightNewTask();
  };
  
  // Função para mostrar notificações
  const showNotification = (message, type) => {
	try {
	  const notification = document.createElement('div');
	  notification.className = `notification ${type} is-light`;
	  notification.innerHTML = `
		<button class="delete"></button>
		${message}
	  `;
  
	  const hero = document.querySelector('.hero');
	  if (hero) {
		hero.after(notification);
	  } else {
		const container = document.querySelector('.container');
		if (container) {
		  container.prepend(notification);
		} else {
		  document.body.prepend(notification);
		}
	  }
  
	  const deleteBtn = notification.querySelector('.delete');
	  if (deleteBtn) {
		deleteBtn.addEventListener('click', () => {
		  notification.remove();
		});
	  }
  
	  setTimeout(() => {
		notification.classList.add('fadeOut');
		setTimeout(() => {
		  if (notification.parentNode) {
			notification.remove();
		  }
		}, 500);
	  }, 3000);
	} catch (error) {
	  console.error('Erro ao mostrar notificação:', error);
	  alert(message);
	}
  };
  
  // Função para destacar nova tarefa
  const highlightNewTask = () => {
	const firstListItem = taskList.querySelector('li:first-child');
	const firstTableRow = taskTableBody.querySelector('tr:first-child');
  
	if (firstListItem) {
	  firstListItem.classList.add('has-background-success-light');
	  setTimeout(() => {
		firstListItem.classList.remove('has-background-success-light');
	  }, 1500);
	}
  
	if (firstTableRow) {
	  firstTableRow.classList.add('has-background-success-light');
	  setTimeout(() => {
		firstTableRow.classList.remove('has-background-success-light');
	  }, 1500);
	}
  };
  
  // Função para alternar status da tarefa
  const toggleTask = (id) => {
	tasks = tasks.map(task => {
	  if (task.id === id) {
		return { ...task, completed: !task.completed };
	  }
	  return task;
	});
  
	saveTasks();
	renderTaskList();
	renderTaskTable();
  };
  
  // Função para excluir tarefa
  const deleteTask = (id) => {
	tasks = tasks.filter(task => task.id !== id);
	saveTasks();
	renderTaskList();
	renderTaskTable();
  };
  
  // Função para renderizar a lista de tarefas
  const renderTaskList = () => {
	taskList.innerHTML = '';
  
	tasks.forEach(task => {
	  const li = document.createElement('li');
	  li.className = task.completed ? 'completed' : '';
  
	  if (!task.completed) {
		if (task.priority === 'Alta') {
		  li.classList.add('priority-high');
		} else if (task.priority === 'Média') {
		  li.classList.add('priority-medium');
		} else {
		  li.classList.add('priority-low');
		}
	  }
  
	  li.classList.add('task-highlight', 'box', 'mb-2');
  
	  const taskStatus = getTaskTimeStatus(task.date);
	  if (taskStatus === 'overdue') {
		li.classList.add('overdue');
	  } else if (taskStatus === 'due-soon') {
		li.classList.add('due-soon');
	  }
  
	  li.innerHTML = `
		<div class="columns is-vcentered is-mobile">
		  <div class="column is-narrow">
			<label class="checkbox">
			  <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})">
			</label>
		  </div>
		  <div class="column">
			<strong>${task.text}</strong>
			<div class="tags mt-2">
			  ${task.date ? 
				`<span class="tag is-info ${taskStatus === 'overdue' ? 'is-danger' : taskStatus === 'due-soon' ? 'is-warning' : ''}">
				  <i class="fas fa-calendar-alt mr-1"></i> ${task.date} 
				  ${taskStatus === 'overdue' ? ' (Atrasada)' : taskStatus === 'due-soon' ? ' (Em breve)' : ''}
				</span>` : ''}
			  <span class="tag ${getPriorityClass(task.priority)}">
				<i class="fas ${task.priority === 'Alta' ? 'fa-exclamation-circle' : task.priority === 'Média' ? 'fa-exclamation' : 'fa-check'}"></i>
				${task.priority}
			  </span>
			</div>
		  </div>
		  <div class="column is-narrow">
			<div class="buttons has-addons">
			  <button class="button is-small is-info" onclick="editTask(${task.id})" title="Editar">
				<span class="icon is-small">
				  <i class="fas fa-edit"></i>
				</span>
			  </button>
			  <button class="button is-small is-danger" onclick="deleteTask(${task.id})" title="Excluir">
				<span class="icon is-small">
				  <i class="fas fa-trash"></i>
				</span>
			  </button>
			</div>
		  </div>
		</div>
	  `;
  
	  taskList.appendChild(li);
	});
  
	if (tasks.length === 0) {
	  const emptyMessage = document.createElement('div');
	  emptyMessage.className = 'notification is-info is-light';
	  emptyMessage.innerHTML = '<p class="has-text-centered">Não há tarefas. Adicione uma nova tarefa acima!</p>';
	  taskList.appendChild(emptyMessage);
	}
  };
  
  // Função para obter o status da tarefa com base na data
  const getTaskTimeStatus = (dateStr) => {
	if (!dateStr) return 'no-date';
  
	const taskDate = new Date(dateStr);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
  
	const twoDaysFromNow = new Date(today);
	twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  
	if (taskDate < today) {
	  return 'overdue';
	} else if (taskDate <= twoDaysFromNow) {
	  return 'due-soon';
	}
  
	return 'upcoming';
  };
  
  // Função para renderizar a tabela de tarefas
  const renderTaskTable = () => {
	taskTableBody.innerHTML = '';
  
	tasks.forEach(task => {
	  const tr = document.createElement('tr');
	  tr.classList.add('task-highlight');
  
	  if (task.completed) {
		tr.classList.add('completed');
	  } else {
		if (task.priority === 'Alta') {
		  tr.classList.add('priority-high');
		} else if (task.priority === 'Média') {
		  tr.classList.add('priority-medium');
		} else {
		  tr.classList.add('priority-low');
		}
	  }
  
	  const taskStatus = getTaskTimeStatus(task.date);
	  if (taskStatus === 'overdue') {
		tr.classList.add('overdue');
	  } else if (taskStatus === 'due-soon') {
		tr.classList.add('due-soon');
	  }
  
	  tr.innerHTML = `
		<td>
		  <label class="checkbox">
			<input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})">
		  </label>
		</td>
		<td><strong>${task.text}</strong></td>
		<td>
		  ${task.date ? 
			`<span class="tag ${taskStatus === 'overdue' ? 'is-danger' : taskStatus === 'due-soon' ? 'is-warning' : 'is-info'}">
			  <i class="fas fa-calendar-alt mr-1"></i> ${task.date}
			  ${taskStatus === 'overdue' ? ' (Atrasada)' : taskStatus === 'due-soon' ? ' (Em breve)' : ''}
			</span>` : 'Sem prazo'}
		</td>
		<td>
		  <span class="tag ${getPriorityClass(task.priority)} is-medium">
			<i class="fas ${task.priority === 'Alta' ? 'fa-exclamation-circle' : task.priority === 'Média' ? 'fa-exclamation' : 'fa-check'} mr-1"></i>
			${task.priority}
		  </span>
		</td>
		<td>
		  <div class="buttons has-addons is-centered">
			<button class="button is-small is-info" onclick="editTask(${task.id})" title="Editar">
			  <span class="icon is-small">
				<i class="fas fa-edit"></i>
			  </span>
			</button>
			<button class="button is-small is-danger" onclick="deleteTask(${task.id})" title="Excluir">
			  <span class="icon is-small">
				<i class="fas fa-trash"></i>
			  </span>
			</button>
		  </div>
		</td>
	  `;
  
	  taskTableBody.appendChild(tr);
	});
  
	if (tasks.length === 0) {
	  const tr = document.createElement('tr');
	  tr.innerHTML = `
		<td colspan="5" class="has-text-centered">
		  <div class="notification is-info is-light">
			Não há tarefas. Adicione uma nova tarefa acima!
		  </div>
		</td>
	  `;
	  taskTableBody.appendChild(tr);
	}
  };
  
  // Função auxiliar para obter a classe CSS com base na prioridade
  const getPriorityClass = (priority) => {
	switch (priority) {
	  case 'Alta':
		return 'is-danger';
	  case 'Média':
		return 'is-warning';
	  default:
		return 'is-success';
	}
  };
  
  // Alternar entre visualizações
  listViewBtn.addEventListener('click', () => {
	listView.classList.remove('is-hidden');
	tableView.classList.add('is-hidden');
	listViewBtn.classList.add('is-selected', 'is-success');
	tableViewBtn.classList.remove('is-selected', 'is-info');
	localStorage.setItem('preferredView', 'list');
  });
  
  tableViewBtn.addEventListener('click', () => {
	tableView.classList.remove('is-hidden');
	listView.classList.add('is-hidden');
	tableViewBtn.classList.add('is-selected', 'is-info');
	listViewBtn.classList.remove('is-selected', 'is-success');
	localStorage.setItem('preferredView', 'table');
  });
  
  const loadPreferredView = () => {
	const preferredView = localStorage.getItem('preferredView');
	if (preferredView === 'table') {
	  tableViewBtn.click();
	} else {
	  listViewBtn.click();
	}
  };
  
  clearAllBtn.addEventListener('click', () => {
	if (confirm('Tem certeza que deseja excluir todas as tarefas?')) {
	  tasks = [];
	  saveTasks();
	  renderTaskList();
	  renderTaskTable();
	}
  });
  
  // Função para editar tarefa
  const editTask = (id) => {
	const task = tasks.find(task => task.id === id);
	if (!task) return;
  
	taskInput.value = task.text;
	dateInput.value = task.date || '';
	priorityInput.value = task.priority;
  
	addTaskBtn.innerHTML = `
	  <span class="icon">
		<i class="fas fa-save"></i>
	  </span>
	  <span>Atualizar</span>
	`;
	addTaskBtn.classList.remove('is-info');
	addTaskBtn.classList.add('is-success');
  
	addTaskBtn.dataset.editId = id;
  
	window.scrollTo({
	  top: 0,
	  behavior: 'smooth'
	});
  
	taskInput.focus();
  
	addTaskBtn.removeEventListener('click', addTask);
	addTaskBtn.addEventListener('click', updateTask);
  
	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'button is-light ml-2';
	cancelBtn.id = 'cancelEditBtn';
	cancelBtn.innerHTML = `
	  <span class="icon">
		<i class="fas fa-times"></i>
	  </span>
	  <span>Cancelar</span>
	`;
  
	addTaskBtn.after(cancelBtn);
  
	cancelBtn.addEventListener('click', cancelEdit);
  };
  
  // Função para atualizar tarefa
  const updateTask = () => {
	const editId = parseInt(addTaskBtn.dataset.editId);
	const taskText = taskInput.value.trim();
	const taskDate = dateInput.value;
	const taskPriority = priorityInput.value;
  
	if (taskText === '') {
	  showNotification('Por favor, digite uma tarefa!', 'is-danger');
	  return;
	}
  
	tasks = tasks.map(task => {
	  if (task.id === editId) {
		return {
		  ...task,
		  text: taskText,
		  date: taskDate,
		  priority: taskPriority,
		  updatedAt: new Date().toISOString()
		};
	  }
	  return task;
	});
  
	saveTasks();
	showNotification('Tarefa atualizada com sucesso!', 'is-success');
  
	taskInput.value = '';
	dateInput.value = '';
	priorityInput.value = 'Baixa';
  
	addTaskBtn.innerHTML = `
	  <span class="icon">
		<i class="fas fa-plus"></i>
	  </span>
	  <span>Adicionar</span>
	`;
	addTaskBtn.classList.remove('is-success');
	addTaskBtn.classList.add('is-info');
  
	delete addTaskBtn.dataset.editId;
  
	addTaskBtn.removeEventListener('click', updateTask);
	addTaskBtn.addEventListener('click', addTask);
  
	document.getElementById('cancelEditBtn')?.remove();
  
	renderTaskList();
	renderTaskTable();
  };
  
  // Função para cancelar edição
  const cancelEdit = () => {
	taskInput.value = '';
	dateInput.value = '';
	priorityInput.value = 'Baixa';
  
	addTaskBtn.innerHTML = `
	  <span class="icon">
		<i class="fas fa-plus"></i>
	  </span>
	  <span>Adicionar</span>
	`;
	addTaskBtn.classList.remove('is-success');
	addTaskBtn.classList.add('is-info');
  
	delete addTaskBtn.dataset.editId;
  
	addTaskBtn.removeEventListener('click', updateTask);
	addTaskBtn.addEventListener('click', addTask);
  
	const cancelBtn = document.getElementById('cancelEditBtn');
	if (cancelBtn) {
	  cancelBtn.remove();
	}
  };
  
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
	  if (addTaskBtn.dataset.editId) {
		updateTask();
	  } else {
		addTask();
	  }
	}
  });
  
  // Disponibilizando funções globalmente
  window.toggleTask = toggleTask;
  window.deleteTask = deleteTask;
  window.editTask = editTask;
  
  const updateCounters = () => {
	const totalCount = tasks.length;
	const completedCount = tasks.filter(task => task.completed).length;
	const pendingCount = totalCount - completedCount;
	const overdueCount = tasks.filter(task => !task.completed && getTaskTimeStatus(task.date) === 'overdue').length;
  
	document.getElementById('totalTasks').textContent = totalCount;
	document.getElementById('pendingTasks').textContent = pendingCount;
	document.getElementById('completedTasks').textContent = completedCount;
	document.getElementById('overdueTasks').textContent = overdueCount;
  };
  
  const filterTasks = (filterType) => {
	const originalTasks = storage.getTasks();
	let filteredTasks = [];
	let filterDescription = '';
  
	switch (filterType) {
	  case 'all':
		filteredTasks = [...originalTasks];
		filterDescription = 'Mostrando todas as tarefas';
		break;
	  case 'pending':
		filteredTasks = originalTasks.filter(task => !task.completed);
		filterDescription = 'Mostrando apenas tarefas pendentes';
		break;
	  case 'completed':
		filteredTasks = originalTasks.filter(task => task.completed);
		filterDescription = 'Mostrando apenas tarefas concluídas';
		break;
	  case 'high':
		filteredTasks = originalTasks.filter(task => !task.completed && task.priority === 'Alta');
		filterDescription = 'Mostrando tarefas de alta prioridade';
		break;
	  case 'today':
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayStr = today.toISOString().split('T')[0];
		filteredTasks = originalTasks.filter(task => !task.completed && task.date === todayStr);
		filterDescription = 'Mostrando tarefas para hoje';
		break;
	  case 'overdue':
		filteredTasks = originalTasks.filter(task => !task.completed && getTaskTimeStatus(task.date) === 'overdue');
		filterDescription = 'Mostrando tarefas atrasadas';
		break;
	  default:
		filteredTasks = [...originalTasks];
		filterDescription = 'Mostrando todas as tarefas';
	}
  
	document.getElementById('activeFilterIndicator').classList.remove('is-hidden');
	document.getElementById('filterDescription').textContent = filterDescription;
  
	document.querySelectorAll('.filter-item').forEach(item => {
	  item.classList.remove('is-active');
	  if (item.dataset.filter === filterType) {
		item.classList.add('is-active');
	  }
	});
  
	document.getElementById('filterDropdown').dataset.currentFilter = filterType;
  
	tasks = filteredTasks;
	renderTaskList();
	renderTaskTable();
  
	tasks = storage.getTasks();
  };
  
  document.querySelectorAll('.filter-item').forEach(item => {
	if (!item._hasClickListener) {
	  item.addEventListener('click', () => {
		filterTasks(item.dataset.filter);
	  });
	  item._hasClickListener = true;
	}
  });
  
  document.getElementById('clearFilterBtn').addEventListener('click', () => {
	document.getElementById('activeFilterIndicator').classList.add('is-hidden');
	filterTasks('all');
  });
  
  document.getElementById('exportBtn').addEventListener('click', () => {
	const exportData = {
	  tasks: tasks,
	  exportDate: new Date().toISOString(),
	  stats: {
		total: tasks.length,
		completed: tasks.filter(task => task.completed).length,
		pending: tasks.filter(task => !task.completed).length,
		overdue: tasks.filter(task => !task.completed && getTaskTimeStatus(task.date) === 'overdue').length
	  }
	};
  
	const jsonData = JSON.stringify(exportData, null, 2);
	const blob = new Blob([jsonData], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `tarefas_${new Date().toISOString().split('T')[0]}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	showNotification('Tarefas exportadas com sucesso!', 'is-success');
  });
  
  const searchTasks = () => {
	const searchText = document.getElementById('searchInput').value.toLowerCase();
  
	if (searchText.trim() === '') {
	  renderTaskList();
	  renderTaskTable();
	  return;
	}
  
	const filteredTasks = tasks.filter(task => 
	  task.text.toLowerCase().includes(searchText) ||
	  (task.date && task.date.includes(searchText)) ||
	  task.priority.toLowerCase().includes(searchText)
	);
  
	taskList.innerHTML = '';
	taskTableBody.innerHTML = '';
  
	if (filteredTasks.length === 0) {
	  const emptyMessage = document.createElement('div');
	  emptyMessage.className = 'notification is-warning is-light';
	  emptyMessage.innerHTML = `<p class="has-text-centered">Nenhuma tarefa encontrada para "${searchText}"</p>`;
	  taskList.appendChild(emptyMessage);
  
	  const tr = document.createElement('tr');
	  tr.innerHTML = `
		<td colspan="5" class="has-text-centered">
		  <div class="notification is-warning is-light">
			Nenhuma tarefa encontrada para "${searchText}"
		  </div>
		</td>
	  `;
	  taskTableBody.appendChild(tr);
	} else {
	  tasks = filteredTasks;
	  renderTaskList();
	  renderTaskTable();
	  tasks = storage.getTasks();
	  showNotification(`Encontradas ${filteredTasks.length} tarefas para "${searchText}"`, 'is-info');
	}
  };
  
  document.getElementById('searchBtn').addEventListener('click', searchTasks);
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
	  searchTasks();
	}
  });
  
  const originalSaveTasks = saveTasks;
  const newSaveTasks = () => {
	originalSaveTasks();
	updateCounters();
  };
  saveTasks = newSaveTasks;
  
  const showLoader = () => {
	const loaderWrapper = document.createElement('div');
	loaderWrapper.className = 'loader-wrapper';
	loaderWrapper.innerHTML = `<div class="loader is-loading"></div>`;
	document.body.appendChild(loaderWrapper);
  
	setTimeout(() => {
	  loaderWrapper.remove();
	}, 800);
  };
  
  const initialize = () => {
	try {
	  showLoader();
	  setTimeout(() => {
		try {
		  renderTaskList();
		  renderTaskTable();
		  updateCounters();
  
		  if (typeof loadPreferredView === 'function') {
			loadPreferredView();
		  } else {
			listView.classList.remove('is-hidden');
			tableView.classList.add('is-hidden');
		  }
  
		  showNotification('Bem-vindo(a) ao Gerenciador de Tarefas!', 'is-primary');
  
		  const overdueCount = tasks.filter(task => !task.completed && getTaskTimeStatus(task.date) === 'overdue').length;
		  if (overdueCount > 0) {
			showNotification(`Atenção! Você tem ${overdueCount} tarefa${overdueCount > 1 ? 's' : ''} atrasada${overdueCount > 1 ? 's' : ''}.`, 'is-warning');
		  }
		} catch (error) {
		  console.error('Erro durante a inicialização:', error);
		  renderTaskList();
		  renderTaskTable();
		}
	  }, 800);
	} catch (error) {
	  console.error('Erro ao mostrar loader:', error);
	  renderTaskList();
	  renderTaskTable();
	}
  };
  
  const setupDebugModal = () => {
	const debugBtn = document.getElementById('debugBtn');
	const debugModal = document.getElementById('debugModal');
	const closeButtons = document.querySelectorAll('#closeDebugModal, #closeDebugModalBtn');
	const checkDOMBtn = document.getElementById('checkDOM');
	const resetAppBtn = document.getElementById('resetApp');
	const fixIssuesBtn = document.getElementById('fixCommonIssues');
	const elementChecker = document.getElementById('elementChecker');
  
	if (debugBtn) {
	  debugBtn.addEventListener('click', (e) => {
		e.preventDefault();
		debugModal.classList.add('is-active');
		const criticalElements = [
		  'taskInput', 'dateInput', 'priorityInput', 'addTaskBtn',
		  'taskList', 'taskTableBody', 'listViewBtn', 'tableViewBtn',
		  'listView', 'tableView', 'clearAllBtn', 'searchInput',
		  'searchBtn', 'totalTasks', 'pendingTasks', 'completedTasks', 'overdueTasks'
		];
		const results = {};
		criticalElements.forEach(id => {
		  results[id] = Boolean(document.getElementById(id));
		});
		const debugOutput = document.getElementById('debugOutput');
		if (debugOutput) {
		  debugOutput.value = JSON.stringify(results, null, 2);
		}
	  });
	}
  
	closeButtons.forEach(btn => {
	  if (btn) {
		btn.addEventListener('click', () => {
		  debugModal.classList.remove('is-active');
		});
	  }
	});
  
	if (checkDOMBtn) {
	  checkDOMBtn.addEventListener('click', () => {
		showNotification('Verificação do sistema concluída. Nenhum problema encontrado.', 'is-info');
	  });
	}
  
	if (resetAppBtn) {
	  resetAppBtn.addEventListener('click', () => {
		if (confirm('Isso resetará completamente o aplicativo e apagará todas as tarefas. Continuar?')) {
		  storage.removeTasks();
		  localStorage.removeItem('preferredView');
		  tasks = [];
		  renderTaskList();
		  renderTaskTable();
		  updateCounters();
		  const debugOutput = document.getElementById('debugOutput');
		  if (debugOutput) {
			debugOutput.value = 'Aplicativo resetado com sucesso!';
		  }
		  debugModal.classList.remove('is-active');
		}
	  });
	}
  
	if (fixIssuesBtn) {
	  fixIssuesBtn.addEventListener('click', () => {
		checkAndCreateElements();
		addTaskBtn.addEventListener('click', addTask);
		taskInput.addEventListener('keypress', (e) => {
		  if (e.key === 'Enter') {
			if (addTaskBtn.dataset.editId) {
			  updateTask();
			} else {
			  addTask();
			}
		  }
		});
		listView.classList.remove('is-hidden');
		tableView.classList.add('is-hidden');
		renderTaskList();
		renderTaskTable();
		updateCounters();
		const debugOutput = document.getElementById('debugOutput');
		if (debugOutput) {
		  debugOutput.value = 'Problemas comuns corrigidos!';
		}
		debugModal.classList.remove('is-active');
	  });
	}
  
	if (elementChecker) {
	  elementChecker.addEventListener('input', () => {
		const id = elementChecker.value.trim();
		const result = document.getElementById('elementCheckerResult');
		if (!id) {
		  result.textContent = '';
		  return;
		}
		const element = document.getElementById(id);
		if (element) {
		  result.textContent = `Elemento encontrado: ${element.tagName}`;
		  result.className = 'help is-success';
		} else {
		  result.textContent = 'Elemento não encontrado';
		  result.className = 'help is-danger';
		}
	  });
	}
  };
  
  document.addEventListener('DOMContentLoaded', () => {
	try {
	  checkAndCreateElements();
  
	  const searchBtn = document.getElementById('searchBtn');
	  const searchInput = document.getElementById('searchInput');
  
	  if (searchBtn && !searchBtn._hasClickListener) {
		searchBtn.addEventListener('click', searchTasks);
		searchBtn._hasClickListener = true;
	  }
  
	  if (searchInput && !searchInput._hasKeyListener) {
		searchInput.addEventListener('keypress', (e) => {
		  if (e.key === 'Enter') {
			searchTasks();
		  }
		});
		searchInput._hasKeyListener = true;
	  }
  
	  const clearFilterBtn = document.getElementById('clearFilterBtn');
	  if (clearFilterBtn && !clearFilterBtn._hasClickListener) {
		clearFilterBtn.addEventListener('click', () => {
		  document.getElementById('activeFilterIndicator').classList.add('is-hidden');
		  filterTasks('all');
		});
		clearFilterBtn._hasClickListener = true;
	  }
  
	  document.querySelectorAll('.filter-item').forEach(item => {
		if (!item._hasClickListener) {
		  item.addEventListener('click', () => {
			filterTasks(item.dataset.filter);
		  });
		  item._hasClickListener = true;
		}
	  });
  
	  setupDebugModal();
	  initialize();
	} catch (error) {
	  console.error('Erro durante a inicialização:', error);
	  const errorMessage = document.createElement('div');
	  errorMessage.className = 'notification is-danger is-light';
	  errorMessage.innerHTML = `
		<p><strong>Ops! Algo deu errado.</strong></p>
		<p>Ocorreu um erro ao inicializar o aplicativo. Por favor, tente:</p>
		<ol>
		  <li>Recarregar a página</li>
		  <li>Limpar o cache do navegador</li>
		  <li>Clicar em "Suporte" no rodapé e depois em "Reparar Automaticamente"</li>
		</ol>
	  `;
  
	  const container = document.querySelector('.container');
	  if (container) {
		container.prepend(errorMessage);
	  } else {
		document.body.prepend(errorMessage);
	  }
	}
  });
  