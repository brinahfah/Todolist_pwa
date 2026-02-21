document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('newTask');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    let tasks = loadTasks();
    renderTasks();

    addTaskBtn.addEventListener('click', addTask);

    
    const openFeedbackBtn = document.getElementById('openFeedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedbackBtn = document.getElementById('closeFeedbackBtn');
    const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
    const feedbackText = document.getElementById('feedbackText');

    openFeedbackBtn.addEventListener('click', () => {
        feedbackText.value = '';
        feedbackModal.style.display = 'flex';
    });

    closeFeedbackBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
    });

    sendFeedbackBtn.addEventListener('click', () => {
        const message = feedbackText.value.trim();
        if (message === '') {
            alert('Veuillez saisir un message avant d’envoyer.');
            return;
        }

        // Charger les anciens feedbacks depuis localStorage
        let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];

        // Ajouter le nouveau feedback avec date
        feedbacks.push({
            date: new Date().toISOString(),
            message: message
        });

        // Sauvegarder dans localStorage
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

        alert('Merci pour votre feedback !');
        feedbackModal.style.display = 'none';
    });

    // Fermer modal en cliquant hors contenu
    window.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            feedbackModal.style.display = 'none';
        }
    });

    // Gestion du tutoriel modal
    const tutorialModal = document.getElementById('tutorialModal');
    const closeTutorialBtn = document.getElementById('closeTutorialBtn');
    
    const exportFeedbacksBtn = document.getElementById('exportFeedbacksBtn');

    exportFeedbacksBtn.addEventListener('click', () => {
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];

        if (feedbacks.length === 0) {
            alert('Aucun feedback à exporter.');
            return;
        }

        const dataStr = JSON.stringify(feedbacks, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `feedbacks_${new Date().toISOString().slice(0,10)}.json`;
        a.click();

        URL.revokeObjectURL(url);
    });

    const exportTasksBtn = document.getElementById('exportTasksBtn');
    const importTasksBtn = document.getElementById('importTasksBtn');
    const importTasksFile = document.getElementById('importTasksFile');

    // Exporter les tâches au format JSON
    exportTasksBtn.addEventListener('click', () => {
        if (tasks.length === 0) {
            alert('Aucune tâche à exporter.');
            return;
        }
        const dataStr = JSON.stringify(tasks, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_${new Date().toISOString().slice(0,10)}.json`;
        a.click();

        URL.revokeObjectURL(url);
    });

    // Ouvrir le dialogue fichier pour importer
    importTasksBtn.addEventListener('click', () => {
        importTasksFile.click();
    });

    // Gestion de l’import des tâches
    importTasksFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (!Array.isArray(importedTasks)) {
                    alert('Fichier invalide : format JSON attendu.');
                    return;
                }

                // Demander confirmation avant remplacement
                const confirmImport = confirm('Importer ce fichier remplacera vos tâches actuelles. Confirmez-vous ?');
                if (!confirmImport) return;

                // Remplacer les tâches et sauvegarder
                tasks = importedTasks;
                saveTasks();
                renderTasks();
                alert('Tâches importées avec succès !');
            } catch (err) {
                alert('Erreur lors de la lecture du fichier JSON.');
            }
        };
        reader.readAsText(file);

        // Reset input pour pouvoir réimporter le même fichier si besoin
        event.target.value = '';
    });
    
    // Afficher le tutoriel à chaque chargement
    tutorialModal.style.display = 'flex';

    closeTutorialBtn.addEventListener('click', () => {
        tutorialModal.style.display = 'none';
    });



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

    function requestNotificationPermission() {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'denied') {
            console.warn("Notifications bloquées par le navigateur.");
            return;
        }

        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log("Permission :", permission);
            });
        }
    }

    // Exécuter la vérification toutes les 15 minutes (900000 ms) 
    setInterval(remindUncompletedTasks, 900000);
});


