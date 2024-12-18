// test-handler.js
class TestHandler {
    constructor() {
        this.testData = null;
        this.answers = {};
        this.timeLimit = 0;
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.testStarted = false;
    }

    loadTest(jsonString) {
        try {
            this.testData = JSON.parse(jsonString);
            this.timeLimit = this.testData.time * 60;
            this.timeRemaining = this.timeLimit;
            this.answers = {};
            this.testStarted = false;
            this.renderQuestions();
            return true;
        } catch (error) {
            console.error('Error loading test:', error);
            alert('Fehler beim Laden der Testdatei. Bitte überprüfen Sie das Format.');
            return false;
        }
    }

    renderQuestions() {
        const container = document.getElementById('questions-container');
        if (!container) return;

        container.innerHTML = '';

        this.testData.tasks.forEach((task) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            
            const header = document.createElement('div');
            header.className = 'question-header';
            header.innerHTML = `
                <span>Aufgabe ${task.nr}: ${task.question}</span>
                <span>${task.points} Punkt${task.points !== 1 ? 'e' : ''}</span>
            `;
            questionDiv.appendChild(header);

            switch(task.type) {
                case 'multiple':
                    this.renderMultipleChoice(questionDiv, task);
                    break;
                case 'single':
                    this.renderSingleChoice(questionDiv, task);
                    break;
                case 'short':
                case 'long':
                    this.renderTextInput(questionDiv, task);
                    break;
            }

            container.appendChild(questionDiv);
        });
    }

    renderMultipleChoice(container, task) {
        task.answers.forEach((answer, answerIndex) => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `q${task.nr}-${answerIndex}`;
            checkbox.addEventListener('change', (e) => {
                if (!this.answers[task.nr]) this.answers[task.nr] = [];
                if (e.target.checked) {
                    this.answers[task.nr].push(answer);
                } else {
                    this.answers[task.nr] = this.answers[task.nr].filter(a => a !== answer);
                }
            });

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = answer;

            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }

    renderSingleChoice(container, task) {
        task.answers.forEach((answer, answerIndex) => {
            const div = document.createElement('div');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question${task.nr}`;
            radio.id = `q${task.nr}-${answerIndex}`;
            radio.addEventListener('change', () => {
                this.answers[task.nr] = answer;
            });

            const label = document.createElement('label');
            label.htmlFor = radio.id;
            label.textContent = answer;

            div.appendChild(radio);
            div.appendChild(label);
            container.appendChild(div);
        });
    }

    renderTextInput(container, task) {
        if (task.explanation) {
            const explanation = document.createElement('p');
            explanation.className = 'explanation';
            explanation.textContent = task.explanation;
            container.appendChild(explanation);
        }

        const textarea = document.createElement('textarea');
        textarea.addEventListener('input', (e) => {
            this.answers[task.nr] = e.target.value;
        });
        container.appendChild(textarea);
    }

    generateAnswerJson(studentName, fullscreenExits, comments) {
        const result = {
            studentName: studentName,
            answers: this.answers,
            timeRemaining: this.timeRemaining,
            fullscreenExits: fullscreenExits,
            generalComments: comments
        };
        return JSON.stringify(result, null, 2);
    }

    loadTest(jsonString) {
        try {
            this.testData = JSON.parse(jsonString);
            this.timeLimit = this.testData.time * 60; // Convert minutes to seconds
            this.timeRemaining = this.timeLimit;
            this.answers = {}; // Reset answers
            this.testStarted = false;
            this.renderQuestions();
            return true;
        } catch (error) {
            console.error('Error loading test:', error);
            alert('Fehler beim Laden der Testdatei. Bitte überprüfen Sie das Format.');
            return false;
        }
    }

    startTimer() {
        if (this.testStarted) return;
        
        this.testStarted = true;
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.endTest();
            }
        }, 1000);

        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    

    endTest() {
        clearInterval(this.timerInterval);
        document.exitFullscreen().then(() => {
            document.getElementById('test-content').style.display = 'none';
            document.getElementById('return-to-test').style.display = 'none';
            
            // Only allow name change and download
            document.getElementById('student-name').disabled = false;
            document.getElementById('download-answers').disabled = false;
            
            // Disable all other inputs
            const inputs = document.querySelectorAll('#test-content input, #test-content textarea');
            inputs.forEach(input => input.disabled = true);
        });
    }

    generateAnswerJson(studentName, fullscreenExits, comments) {
        // Only include student-specific data, not the test structure
        const result = {
            studentName: studentName,
            answers: this.answers,
            timeRemaining: this.timeRemaining,
            fullscreenExits: fullscreenExits,
            generalComments: comments
        };
        return JSON.stringify(result, null, 2);
    }
}