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
        if (!storedTasks) return [];
        const parsedTasks = JSON.parse(storedTasks);

        // S’assurer que chaque tâche a un champ notified (pour les anciennes données)
        parsedTasks.forEach(task => {
            if (typeof task.notified === 'undefined') {
                task.notified = false;
            }
        });

    return parsedTasks;
}



    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const listItem = document.createElement('li');

            let dueDateDisplay = '';
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                dueDateDisplay = `<span class="due-date"> - Rappel prévu le ${date.toLocaleString()}</span>`;
            }

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
        const dueDateInput = document.getElementById('dueDate');
        const dueDateValue = dueDateInput.value; // format ISO local (ex: "2026-01-16T18:30")

        if (newTaskText !== '') {
            tasks.push({ 
                text: newTaskText, 
                completed: false,
                dueDate: dueDateValue || null,  // stocker la date ou null si pas 
                notified: false  // ajout du flag de notification
            });
            newTaskInput.value = '';
            dueDateInput.value = ''; // reset du champ date
            saveTasks();
            renderTasks();
        }
    }

    function toggleComplete(event) {
        const index = parseInt(event.target.dataset.index);
        const task = tasks[index];
        task.completed = !task.completed;

        // Si on remet la tâche en non faite, reset la notification
        if (!task.completed) {
            task.notified = false;
        }


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
        const now = new Date();

        tasks.forEach(task => {
            if (!task.completed && task.dueDate && !task.notified) {
                const dueDate = new Date(task.dueDate);

                if (now >= dueDate) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        showNotification(`Rappel : Tâche à faire - "${task.text}"`);
                        task.notified = true; // on marque la tâche comme déjà notifiée
                        saveTasks();
                    }
                }
            }
        });
    }

    // Exécuter la vérification toutes les 15 minutes (900000 ms) 
    setInterval(remindUncompletedTasks, 900000);
});


