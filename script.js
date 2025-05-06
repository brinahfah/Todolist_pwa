document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('newTask');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    let tasks = loadTasks();
    renderTasks();

    addTaskBtn.addEventListener('click', addTask);

    // Fonction pour demander la permission d'afficher des notifications
    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Permission de notification accordée.');
                } else if (permission === 'denied') {
                    console.log('Permission de notification refusée.');
                } else if (permission === 'default') {
                    console.log('Permission de notification demandée.');
                }
            });
        }
    }

    // Demander la permission au chargement de la page
    requestNotificationPermission();

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
                <div class="task-actions">
                    <button class="complete-btn" data-index="${index}">${task.completed ? 'Non fait' : 'Fait'}</button>
                    <button class="delete-btn" data-index="${index}">Supprimer</button>
                </div>
            `;
            taskList.appendChild(listItem);
        });

        document.querySelectorAll('.complete-btn').forEach(button => {
            button.addEventListener('click', toggleComplete);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteTask);
        });
    }

    function addTask() {
        const newTaskText = newTaskInput.value.trim();
        if (newTaskText !== '') {
            tasks.push({ text: newTaskText, completed: false });
            newTaskInput.value = '';
            saveTasks();
            renderTasks();
        }
    }

    function toggleComplete(event) {
        const index = parseInt(event.target.dataset.index);
        const task = tasks[index];
        task.completed = !task.completed;
        saveTasks();
        renderTasks();

        // Afficher une notification lorsque la tâche est marquée comme faite
        if (task.completed && 'Notification' in window && Notification.permission === 'granted') {
            showNotification(`Tâche "${task.text}" terminée !`);
        }
    }

    function deleteTask(event) {
        const index = parseInt(event.target.dataset.index);
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    // Fonction pour afficher une notification
    function showNotification(body) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Ma Todolist', {
                body: body,
                icon: 'images/icon-192x192.png', // Optionnel : icône de la notification
                vibrate: [200, 100, 200] // Optionnel : vibration sur les appareils compatibles
            });
        });
    }

    // Vérification et rappel des tâches non faites (à exécuter périodiquement)
    function remindUncompletedTasks() {
        tasks.forEach(task => {
            if (!task.completed && 'Notification' in window && Notification.permission === 'granted') {
                showNotification(`Rappel : Tâche à faire - "${task.text}"`);
            }
        });
    }

    // Exécuter la vérification toutes les 5 minutes (300000 millisecondes) - Ajustez l'intervalle selon vos besoins
    setInterval(remindUncompletedTasks, 900000);
});