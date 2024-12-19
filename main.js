// main.js
document.addEventListener('DOMContentLoaded', () => {
    const fullscreenManager = new FullscreenManager();
    const testHandler = new TestHandler();
    
    // Get all necessary DOM elements
    const fileInput = document.getElementById('test-file');
    const studentNameInput = document.getElementById('student-name');
    const startButton = document.getElementById('start-test');
    const downloadButton = document.getElementById('download-answers');
    const returnButton = document.getElementById('return-to-test');

    // Prevent copy/paste and right click in test mode
    document.addEventListener('copy', (e) => {
        if (document.fullscreenElement) {
            e.preventDefault();
        }
    });

    document.addEventListener('paste', (e) => {
        if (document.fullscreenElement) {
            e.preventDefault();
        }
    });

    document.addEventListener('contextmenu', (e) => {
        if (document.fullscreenElement) {
            e.preventDefault();
        }
    });

    // Enable start button only when both file and name are provided
    function updateStartButton() {
        startButton.disabled = !fileInput.files[0] || !studentNameInput.value.trim();
    }

    fileInput.addEventListener('change', updateStartButton);
    studentNameInput.addEventListener('input', updateStartButton);

    // Handle file upload
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                testHandler.loadTest(e.target.result);
            };
            reader.readAsText(file);
        }
    });

    // Handle test start
    startButton.addEventListener('click', async () => {
        const studentName = studentNameInput.value.trim();
        if (!studentName) {
            alert('Bitte geben Sie Ihren Namen ein.');
            return;
        }

        document.getElementById('student-display').textContent = `Schüler: ${studentName}`;
        document.getElementById('initial-screen').style.display = 'none';
        document.getElementById('test-screen').style.display = 'block';
        
        await fullscreenManager.enterFullscreen();
        testHandler.startTimer();
    });

    // Handle return to test
    returnButton.addEventListener('click', () => {
        fullscreenManager.enterFullscreen();
    });

    // Handle answer download
    downloadButton.addEventListener('click', () => {
        const studentName = studentNameInput.value.trim();
        const comments = document.getElementById('general-comments').value;
        const answerJson = testHandler.generateAnswerJson(
            studentName,
            fullscreenManager.getFullscreenExits(),
            fullscreenManager.getFocusLosses(),
            comments
        );
    
        const blob = new Blob([answerJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${studentName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});