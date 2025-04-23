













// Function to create a quiz

let currentGamePin = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let participantName = "";
let selectedAnswer = "";
let timer;
let questionsData = []; // Stores all fetched questions
let currentPage = 1;
const questionsPerPage = 5;
let answerSubmitted = false;


function createQuiz() {
    let title = document.getElementById("quizTitle").value;
    let category = document.getElementById("quizCategory").value;

    fetch("/add_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadQuizzes(); // Refresh quiz list
    })
    .catch(error => console.error("Error creating quiz:", error));
}

// Function to load available quizzes into the dropdown
function loadQuizzes() {
    fetch("/get_quizzes")
    .then(response => response.json())
    .then(data => {
        let quizList = document.getElementById("quizList");
        quizList.innerHTML = ""; // Clear old options to prevent duplicates

        let defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a Quiz";
        quizList.appendChild(defaultOption);

        data.forEach(quiz => {
            let option = document.createElement("option");
            option.value = quiz.id;
            option.textContent = quiz.title;
            quizList.appendChild(option);
        });
    })
    .catch(error => console.error("Error loading quizzes:", error));
}

// Function to add a question to a selected quiz
// Function to add a question to a selected quiz
function addQuestion() {
    const classLevel = document.getElementById("classSelect").value;
    const subject = document.getElementById("subjectSelect").value;
    const bookName = document.getElementById("bookSelect").value;
    const chapter = document.getElementById("chapterSelect").value;
    const question = document.getElementById("questionText").value;
    const option1 = document.getElementById("option1").value;
    const option2 = document.getElementById("option2").value;
    const option3 = document.getElementById("option3").value;
    const option4 = document.getElementById("option4").value;
    const correctAnswer = document.getElementById("correctAnswer").value;

    // Check if all fields are filled
    if (!classLevel || !subject || !bookName || !chapter || !question || !option1 || !option2 || !option3 || !option4 || !correctAnswer) {
        alert("Please fill in all fields!");
        return;
    }

    // Check if the correct answer matches one of the options
    const options = [option1, option2, option3, option4];
    const correctAnswerOption = document.getElementById("correctAnswerOption").value;
    
    // If a specific option was selected using the buttons (has correctAnswerOption)
    if (correctAnswerOption) {
        const optionIndex = parseInt(correctAnswerOption) - 1;
        if (options[optionIndex] !== correctAnswer) {
            alert("Warning: The correct answer value doesn't match the selected option. Please check your inputs.");
            return;
        }
    } else {
        // If manually entered, check if it matches any option
        if (!options.includes(correctAnswer)) {
            alert("Warning: The correct answer doesn't match any of the provided options. Please check your inputs.");
            return;
        }
    }

    fetch("/add_new_question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            class_level: classLevel,
            subject: subject,
            book_name: bookName,
            chapter: chapter,
            question: question,
            option1: option1,
            option2: option2,
            option3: option3,
            option4: option4,
            correct_answer: correctAnswer
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Question added successfully!");
            document.querySelectorAll('#add-questions .form-control').forEach(input => input.value = "");
        } else {
            alert("Error: " + data.error);
        }
    });
}

// Function to unlock the Compare Training feature
function unlockCompareFeature() {
    const accessKey = prompt("Please enter your access key to unlock this feature:");
    
    // For now, the access key is hardcoded as "1234"
    if (accessKey === "1234") {
        // Hide the premium lock screen
        document.getElementById('compare-premium-lock').classList.add('hidden');
        
        // Show the actual compare content
        document.getElementById('compare-content').classList.remove('hidden');
    } else {
        alert("Invalid access key. Please contact support to get access to premium features.");
    }
}

// Check for saved access state on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we previously unlocked this feature in this session
    if (sessionStorage.getItem('compareFeatureUnlocked') === 'true') {
        document.getElementById('compare-premium-lock').classList.add('hidden');
        document.getElementById('compare-content').classList.remove('hidden');
    }
    
    // Add event listener to save state when feature is unlocked
    const originalUnlockFunction = window.unlockCompareFeature;
    window.unlockCompareFeature = function() {
        const result = originalUnlockFunction();
        if (document.getElementById('compare-content').classList.contains('hidden') === false) {
            sessionStorage.setItem('compareFeatureUnlocked', 'true');
        }
        return result;
    };
});

// Function to start a quiz
let responseInterval = null;
// 🎯 Start a Quiz (Host)
// Modified startQuiz function to show waiting participants section

// Function to fetch waiting participants
function fetchWaitingParticipants() {
    if (!currentGamePin) {
        console.error("No game PIN available");
        return;
    }

    fetch(`/get_waiting_participants?game_pin=${currentGamePin}`)
    .then(response => response.json())
    .then(data => {
        let waitingTable = document.getElementById("waitingParticipantsTable");
        
        if (data.participants && data.participants.length > 0) {
            let tableHTML = "";
            
            data.participants.forEach(participant => {
                tableHTML += `
                <tr>
                    <td class="border border-green-200 p-2">${participant.player_name}</td>
                    <td class="border border-green-200 p-2">${participant.district}</td>
                    <td class="border border-green-200 p-2">${participant.join_time}</td>
                </tr>`;
            });
            
            waitingTable.innerHTML = tableHTML;
        } else {
            waitingTable.innerHTML = `
            <tr>
                <td colspan="3" class="text-center p-3">No participants waiting yet</td>
            </tr>`;
        }
    })
    .catch(error => console.error("Error fetching waiting participants:", error));
}

// Function to start quiz for all waiting participants

// Modified startQuiz function to show waiting participants section

// Function to control which step is visible


// Function to control which step is visible
function showQuizStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.quiz-step').forEach(step => {
        step.classList.add('hidden');
        step.classList.remove('active');
    });
    
    // Show the requested step
    const stepToShow = document.getElementById(stepId);
    if (stepToShow) {
        stepToShow.classList.remove('hidden');
        stepToShow.classList.add('active');
    }
}

// Modified startQuiz function to show waiting participants section
function startQuiz() {
    let quiz_id = document.getElementById("quizList").value;

    if (!quiz_id) {
        alert("Please select a quiz first!");
        return;
    }

    fetch("/start_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Quiz Started:", data); // Debugging

        if (data.game_pin) {
            currentGamePin = data.game_pin; // Store Game PIN globally
            document.getElementById("gamePin").textContent = data.game_pin;

            // Show waiting participants section using the new workflow function
            console.log("Showing waiting participants section");
            showQuizStep('waitingParticipantsSection');
            
            // Start polling for waiting participants
            console.log("Setting up polling for waiting participants");
            if (window.waitingParticipantsInterval) {
                clearInterval(window.waitingParticipantsInterval);
            }
            fetchWaitingParticipants(); // Fetch immediately
            window.waitingParticipantsInterval = setInterval(fetchWaitingParticipants, 3000); // Then every 3 seconds
            
            // Also keep the original response tracking
            if (responseInterval) clearInterval(responseInterval);
            responseInterval = setInterval(() => fetchResponses(currentGamePin), 3000);
        } else {
            alert("Error starting quiz.");
        }
    })
    .catch(error => console.error("Error starting quiz:", error));
}

// Function to fetch waiting participants - unchanged
function fetchWaitingParticipants() {
    if (!currentGamePin) {
        console.error("No game PIN available");
        return;
    }

    console.log("Fetching waiting participants for PIN:", currentGamePin);
    fetch(`/get_waiting_participants?game_pin=${currentGamePin}`)
    .then(response => response.json())
    .then(data => {
        console.log("Waiting participants data:", data);
        let waitingTable = document.getElementById("waitingParticipantsTable");
        
        if (data.participants && data.participants.length > 0) {
            let tableHTML = "";
            
            data.participants.forEach(participant => {
                tableHTML += `
                <tr>
                    <td class="border border-green-200 p-2">${participant.player_name}</td>
                    <td class="border border-green-200 p-2">${participant.district}</td>
                    <td class="border border-green-200 p-2">${participant.join_time}</td>
                </tr>`;
            });
            
            waitingTable.innerHTML = tableHTML;
        } else {
            waitingTable.innerHTML = `
            <tr>
                <td colspan="3" class="text-center p-3">No participants waiting yet</td>
            </tr>`;
        }
    })
    .catch(error => {
        console.error("Error fetching waiting participants:", error);
    });
}

// Function to start quiz for all waiting participants - updated to use showQuizStep
function startQuizForAll() {
    if (!currentGamePin) {
        alert("No active quiz session found!");
        return;
    }

    console.log("Starting quiz for all participants with PIN:", currentGamePin);
    fetch("/start_quiz_for_all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin: currentGamePin })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Start for all response:", data);
        if (data.success) {
            alert(`Quiz started for all participants! (${data.participants_count} participants)`);
            
            // Clear polling interval
            if (window.waitingParticipantsInterval) {
                clearInterval(window.waitingParticipantsInterval);
                window.waitingParticipantsInterval = null;
            }
            
            // Fetch quiz questions for host view
            fetchHostQuestions();
        } else {
            alert("Error starting quiz for all: " + (data.error || "Unknown error"));
        }
    })
    .catch(error => {
        console.error("Error starting quiz for all:", error);
    });
}

// Updated to show hostQuizContainer and responsesContainer when questions are fetched
function fetchHostQuestions() {
    console.log("Fetching questions for host view with PIN:", currentGamePin);
    
    fetch("/get_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin: currentGamePin })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Host questions data:", data);
        
        if (data.success && data.questions.length > 0) {
            hostCurrentQuestions = data.questions;
            hostCurrentQuestionIndex = 0;
            
            // Get correct answers for each question
            fetch("/get_correct_answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    game_pin: currentGamePin,
                    question_ids: hostCurrentQuestions.map(q => q.question_id)
                })
            })
            .then(response => response.json())
            .then(correctData => {
                if (correctData.success) {
                    // Add correct answers to questions
                    hostCurrentQuestions.forEach((question, index) => {
                        question.correct_answer = correctData.correct_answers[index];
                    });
                    
                    // Show the host quiz container and responses container
                    showQuizStep('hostQuizContainer');
                    document.getElementById('responsesContainer').classList.remove('hidden');
                    
                    // Update the total questions counter
                    document.getElementById("totalQuestions").textContent = hostCurrentQuestions.length;
                    
                    // Show first question
                    showHostQuestion();
                }
            })
            .catch(error => {
                console.error("Error fetching correct answers:", error);
                
                // Show the host quiz container anyway
                showQuizStep('hostQuizContainer');
                document.getElementById('responsesContainer').classList.remove('hidden');
                
                // Update the total questions counter
                document.getElementById("totalQuestions").textContent = hostCurrentQuestions.length;
                
                // Show first question
                showHostQuestion();
            });
        } else {
            alert("Error: No questions found for this quiz.");
        }
    })
    .catch(error => {
        console.error("Error fetching host questions:", error);
    });
}

// Remaining functions unchanged
let hostCurrentQuestions = [];
let hostCurrentQuestionIndex = 0;
let hostTimer;
let responseChart = null;

function showHostQuestion() {
    if (hostCurrentQuestionIndex < hostCurrentQuestions.length) {
        let questionData = hostCurrentQuestions[hostCurrentQuestionIndex];
        
        // Hide results section from previous question
        document.getElementById("questionResultsSection").classList.add("hidden");
        
        // Update question text
        document.getElementById("hostQuestionText").innerText = questionData.question;
        
        // Update question counter
        document.getElementById("currentQuestionNumber").textContent = (hostCurrentQuestionIndex + 1);
        
        // Clear old options
        let optionsContainer = document.getElementById("hostOptions");
        optionsContainer.innerHTML = "";
        
        // Add new options
        questionData.options.forEach((option, index) => {
            let button = document.createElement("button");
            button.className = "w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md transition duration-200";
            button.innerText = option;
            optionsContainer.appendChild(button);
        });
        
        // Start timer
        startHostTimer(15);
    } else {
        // End of quiz
        document.getElementById("hostQuizContainer").innerHTML = `
            <div class="p-6 bg-white bg-opacity-90 rounded-lg shadow-md text-center">
                <h3 class="text-xl font-bold text-green-600 mb-4">Quiz Completed!</h3>
                <p class="text-gray-700">All questions have been completed. You can check the results in the Leaderboard and Analysis tabs.</p>
            </div>
        `;
    }
}

// Timer function - unchanged
function startHostTimer(seconds) {
    let timeLeft = seconds;
    document.getElementById("hostTimer").textContent = `Time Left: ${timeLeft}s`;
    
    clearInterval(hostTimer); // Reset previous timer
    hostTimer = setInterval(() => {
        timeLeft--;
        document.getElementById("hostTimer").textContent = `Time Left: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            clearInterval(hostTimer);
            document.getElementById("hostTimer").textContent = `Time's up!`;
            
            // Show response results when timer ends
            showQuestionResults();
        }
    }, 1000);
}

// Question results function - unchanged
function showQuestionResults() {
    if (!currentGamePin || hostCurrentQuestionIndex >= hostCurrentQuestions.length) {
        console.error("Cannot show results: Invalid game PIN or question index");
        return;
    }
    
    const currentQuestion = hostCurrentQuestions[hostCurrentQuestionIndex];
    const questionId = currentQuestion.question_id;
    
    // Fetch responses for this specific question
    fetch("/get_question_responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            game_pin: currentGamePin,
            question_id: questionId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show the results section
            document.getElementById("questionResultsSection").classList.remove("hidden");
            
            // Prepare data for chart
            const options = currentQuestion.options;
            const responseCounts = Array(options.length).fill(0);
            
            // Count responses for each option
            data.responses.forEach(response => {
                const optionIndex = options.indexOf(response.answer);
                if (optionIndex >= 0) {
                    responseCounts[optionIndex]++;
                }
            });
            
            // Display the correct answer
            document.getElementById("correctAnswerText").textContent = currentQuestion.correct_answer;
            
            // Create/update the chart
            createResponseChart(options, responseCounts, currentQuestion.correct_answer);
        } else {
            console.error("Error fetching question responses:", data.error);
        }
    })
    .catch(error => {
        console.error("Error fetching question responses:", error);
    });
}

// Chart creation function - unchanged
function createResponseChart(labels, data, correctAnswer) {
    const ctx = document.getElementById('responseChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (responseChart) {
        responseChart.destroy();
    }
    
    // Prepare chart colors (highlight correct answer)
    const backgroundColors = labels.map(label => 
        label === correctAnswer ? 'rgba(34, 197, 94, 0.6)' : 'rgba(99, 102, 241, 0.6)'
    );
    
    const borderColors = labels.map(label => 
        label === correctAnswer ? 'rgb(21, 128, 61)' : 'rgb(79, 70, 229)'
    );
    
    // Calculate percentages for display
    const total = data.reduce((sum, value) => sum + value, 0) || 1; // Avoid division by zero
    const percentages = data.map(value => ((value / total) * 100).toFixed(1));
    
    // Create new chart
    responseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Response Count',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                barPercentage: 0.5,
                categoryPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = percentages[context.dataIndex];
                            return `${value} responses (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Responses'
                    },
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Modified function to move to the next question - unchanged core functionality
function moveToNextQuestion() {
    clearInterval(hostTimer);
    
    // Call server to update current question for all participants
    fetch("/move_to_next_question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            game_pin: currentGamePin,
            new_question_index: hostCurrentQuestionIndex + 1  // Move to next question
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hostCurrentQuestionIndex++;
            if (hostCurrentQuestionIndex < hostCurrentQuestions.length) {
                showHostQuestion();
            } else {
                // Show quiz completed
                document.getElementById("hostQuizContainer").innerHTML = `
                    <div class="p-6 bg-white bg-opacity-90 rounded-lg shadow-md text-center">
                        <h3 class="text-xl font-bold text-green-600 mb-4">Quiz Completed!</h3>
                        <p class="text-gray-700">All questions have been completed. Check the results in the Leaderboard and Analysis tabs.</p>
                    </div>
                `;
                
                // Optional: Switch to the leaderboard tab when quiz is complete
                // showTab('leaderboard');
            }
        } else {
            console.error("Error moving to next question:", data.error || "Unknown error");
        }
    })
    .catch(error => {
        console.error("Error moving to next question:", error);
        
        // Fallback - proceed anyway for testing
        console.log("Using fallback progression due to server error");
        hostCurrentQuestionIndex++;
        if (hostCurrentQuestionIndex < hostCurrentQuestions.length) {
            showHostQuestion();
        } else {
            // Show quiz completed
            document.getElementById("hostQuizContainer").innerHTML = `
                <div class="p-6 bg-white bg-opacity-90 rounded-lg shadow-md text-center">
                    <h3 class="text-xl font-bold text-green-600 mb-4">Quiz Completed!</h3>
                    <p class="text-gray-700">All questions have been completed. Check the results in the Leaderboard and Analysis tabs.</p>
                </div>
            `;
            
            // Optional: Switch to the leaderboard tab when quiz is complete
            // showTab('leaderboard');
        }
    });
}

// Make sure the first step is visible when the page loads
document.addEventListener('DOMContentLoaded', function() {
    showQuizStep('quizSelectionSection');
});








/*
// Function to fetch live responses
function fetchResponses(game_pin) {
    fetch("/get_responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin })
    })
    .then(response => response.json())
    .then(data => {
        let responseTable = document.getElementById("responseTable");
        
        // Check if responseTable exists before trying to update it
        if (responseTable) {
            responseTable.innerHTML = ""; // Clear old responses

            data.responses.forEach(response => {
                let row = `<tr>
                    <td>${response.participant}</td>
                    <td>${response.question_id}</td>
                    <td>${response.answer}</td>
                    <td>${response.is_correct ? "✅" : "❌"}</td>
                </tr>`;
                responseTable.innerHTML += row;
            });
        } else {
            console.log("responseTable element not found - responses available but not displayed");
            // Optionally create the element if needed
        }
    })
    .catch(error => console.error("Error fetching responses:", error));
}


*/



function fetchChapters() {
    let class_level = document.getElementById("filterClass").value;
    let subject = document.getElementById("filterSubject").value;
    let book_name = document.getElementById("filterBook").value;

    if (!class_level || !subject || !book_name) {
        console.log("⚠️ Please select Class, Subject, and Book first!");
        return;
    }

    fetch("/get_chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject, book_name })
    })
    .then(response => response.json())
    .then(data => {
        let chapterSelect = document.getElementById("filterChapter");
        chapterSelect.innerHTML = "<option value=''>Select Chapter</option>"; // Reset dropdown

        if (data.chapters.length === 0) {
            alert("❌ No chapters found for this selection!");
            return;
        }

        // Populate dropdown with available chapters
        data.chapters.forEach(chapter => {
            let option = document.createElement("option");
            option.value = chapter;
            option.textContent = chapter;
            chapterSelect.appendChild(option);
        });
    })
    .catch(error => console.error("❌ Error fetching chapters:", error));
}

// ✅ Trigger `fetchChapters()` when Book is selected
document.getElementById("filterBook").addEventListener("change", fetchChapters);




function fetchChapters() {
    let class_level = document.getElementById("filterClass").value;
    let subject = document.getElementById("filterSubject").value;
    let book_name = document.getElementById("filterBook").value;

    if (!class_level || !subject || !book_name) {
        alert("⚠️ Please select Class, Subject, and Book first!");
        return;
    }

    fetch("/get_chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject, book_name })
    })
    .then(response => response.json())
    .then(data => {
        let chapterSelect = document.getElementById("filterChapter");
        chapterSelect.innerHTML = "<option value=''>Select Chapter</option>"; // Reset dropdown

        if (data.chapters.length === 0) {
            chapterSelect.innerHTML += "<option value='' disabled>❌ No Chapters Found</option>";
        } else {
            data.chapters.forEach(chapter => {
                let option = document.createElement("option");
                option.value = chapter;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
        }
    })
    .catch(error => console.error("❌ Error fetching chapters:", error));
}




// -------------------- PARTICIPANT FUNCTIONS --------------------

// -------------------- PARTICIPANT FUNCTIONS --------------------





// 🎯 Function to Join Quiz
// Function to Join Quiz
function joinQuiz() {
    let playerName = document.getElementById("playerName").value;
    let phoneNumber = document.getElementById("phoneNumber").value;
    let emailId = document.getElementById("emailId").value;
    let district = document.getElementById("districtSelect").value;
    let gamePin = document.getElementById("gamePin").value;

    if (!playerName || !phoneNumber || !emailId || !district || !gamePin) {
        alert("⚠️ Please fill in all details before joining!");
        return;
    }

    fetch("/join_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, phoneNumber, emailId, district, gamePin })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store these values
            currentGamePin = gamePin;
            participantName = playerName;

            // Hide join form
            document.getElementById("joinForm").style.display = "none";
            
            // Show waiting screen instead of immediately showing quiz
            const waitingDiv = document.createElement('div');
            waitingDiv.id = 'waitingScreen';
            waitingDiv.className = 'text-center py-8';
            waitingDiv.innerHTML = `
                <div class="mb-4">
                    <div class="text-2xl font-bold text-blue-600">Waiting for host approval</div>
                    <p class="text-gray-600 mt-2">The host will start the quiz shortly</p>
                </div>
                <div class="mx-auto my-6 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            `;
            
            document.querySelector('.gov-card').appendChild(waitingDiv);
            
            // Start polling to check if quiz has started
            checkQuizStatus(gamePin, playerName);
        } else {
            alert("❌ Error: " + data.error);
        }
    })
    .catch(error => console.error("Error joining quiz:", error));
}


// Function to Join Quiz
function joinQuiz() {
    let playerName = document.getElementById("playerName").value;
    let phoneNumber = document.getElementById("phoneNumber").value;
    let emailId = document.getElementById("emailId").value;
    let district = document.getElementById("districtSelect").value;
    let gamePin = document.getElementById("gamePin").value;

    if (!playerName || !phoneNumber || !emailId || !district || !gamePin) {
        alert("⚠️ Please fill in all details before joining!");
        return;
    }

    fetch("/join_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, phoneNumber, emailId, district, gamePin })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Successfully joined quiz, waiting for host approval");
            // Store these values
            currentGamePin = gamePin;
            participantName = playerName;

            // Hide join form
            document.getElementById("joinForm").style.display = "none";
            
            // Show waiting screen instead of immediately showing quiz
            const waitingDiv = document.createElement('div');
            waitingDiv.id = 'waitingScreen';
            waitingDiv.className = 'text-center py-8';
            waitingDiv.innerHTML = `
                <div class="mb-4">
                    <div class="text-2xl font-bold text-blue-600">Waiting for host approval</div>
                    <p class="text-gray-600 mt-2">The host will start the quiz shortly</p>
                </div>
                <div class="mx-auto my-6 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            `;
            
            document.querySelector('.gov-card').appendChild(waitingDiv);
            
            // Start polling to check if quiz has started
            checkQuizStatus(gamePin, playerName);
        } else {
            alert("❌ Error: " + data.error);
        }
    })
    .catch(error => console.error("Error joining quiz:", error));
}

// Function to poll server for quiz status
function checkQuizStatus(gamePin, playerName) {
    console.log("Starting to check quiz status...");
    const statusCheckInterval = setInterval(() => {
        console.log("Checking if quiz has started...");
        fetch(`/check_quiz_status?game_pin=${gamePin}&player_name=${encodeURIComponent(playerName)}`)
        .then(response => response.json())
        .then(data => {
            console.log("Quiz status check response:", data);
            if (data.status === 'started') {
                console.log("Quiz has started! Showing quiz interface...");
                // Quiz has started, remove waiting screen
                clearInterval(statusCheckInterval);
                document.getElementById('waitingScreen').remove();
                
                // Show quiz container and fetch questions
                document.getElementById("quizContainer").classList.remove("hidden");
                fetchQuestions(); 
            } else {
                console.log("Quiz not started yet, continuing to wait...");
            }
            // Continue waiting if not started
        })
        .catch(error => {
            console.error("Error checking quiz status:", error);
        });
    }, 3000); // Check every 3 seconds
}




/*
function joinQuiz() {
    let playerName = document.getElementById("playerName").value;
    let phoneNumber = document.getElementById("phoneNumber").value;
    let emailId = document.getElementById("emailId").value;
    let district = document.getElementById("districtSelect").value;
    let gamePin = document.getElementById("gamePin").value;

    if (!playerName || !phoneNumber || !emailId || !district || !gamePin) {
        alert("⚠️ Please fill in all details before joining!");
        return;
    }

    fetch("/join_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, phoneNumber, emailId, district, gamePin })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store these values as you currently do
            currentGamePin = gamePin;
            participantName = playerName;

            // Hide join form
            document.getElementById("joinForm").style.display = "none";
            
            // Show waiting screen instead of immediately showing quiz
            const waitingDiv = document.createElement('div');
            waitingDiv.id = 'waitingScreen';
            waitingDiv.className = 'text-center py-8';
            waitingDiv.innerHTML = `
                <div class="mb-4">
                    <div class="text-2xl font-bold text-blue-600">Waiting for host approval</div>
                    <p class="text-gray-600 mt-2">The host will start the quiz shortly</p>
                </div>
                <div class="mx-auto my-6 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            `;
            
            document.querySelector('.gov-card').appendChild(waitingDiv);
            
            // Start polling to check if quiz has started
            checkQuizStatus(gamePin, playerName);
        } else {
            alert("❌ Error: " + data.error);
        }
    })
    .catch(error => console.error("Error joining quiz:", error));
}

// Function to poll server for quiz status
function checkQuizStatus(gamePin, playerName) {
    const statusCheckInterval = setInterval(() => {
        fetch(`/check_quiz_status?game_pin=${gamePin}&player_name=${encodeURIComponent(playerName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'started') {
                // Quiz has started, remove waiting screen
                clearInterval(statusCheckInterval);
                document.getElementById('waitingScreen').remove();
                
                // Show quiz container and fetch questions as you currently do
                document.getElementById("quizContainer").classList.remove("hidden");
                fetchQuestions(); 
            }
            // Continue waiting if not started
        })
        .catch(error => {
            console.error("Error checking quiz status:", error);
        });
    }, 3000); // Check every 3 seconds
}


*/







// 📥 Fetch All Questions for the Quiz
function fetchQuestions() {
    console.log(`Fetching questions for Game PIN: ${currentGamePin}`);

    fetch("/get_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin: currentGamePin })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Received data:", data); // 🔍 Debugging

        if (data.success && data.questions.length > 0) {
            currentQuestions = data.questions;  // ✅ Store all questions
            currentQuestionIndex = 0;  // ✅ Reset index
            answerSubmitted = false;  // Reset flag
            showQuestion();  // ✅ Show first question
        } else {
            alert("✅ Quiz completed! No more questions.");
            document.getElementById("quizContainer").style.display = "none";
        }
    })
    .catch(error => {
        console.error("❌ Error fetching questions:", error);
        alert("❌ Error fetching questions. Check console.");
    });
}

// Modified showQuestion to handle host-controlled navigation
function showQuestion() {
    answerSubmitted = false; // Reset for new question
    
    // Remove waiting message if it exists
    const waitingMessage = document.getElementById("waitingForHost");
    if (waitingMessage) {
        waitingMessage.remove();
    }
    
    if (currentQuestionIndex < currentQuestions.length) {
        let questionData = currentQuestions[currentQuestionIndex];
        document.getElementById("questionText").innerText = questionData.question;

        // Remove any previous message
        const existingMessage = document.getElementById("answerMessage");
        if (existingMessage) {
            existingMessage.remove();
        }

        let optionsContainer = document.getElementById("options");
        optionsContainer.innerHTML = ""; // Clear old options

        questionData.options.forEach(option => {
            let button = document.createElement("button");
            button.classList = "w-full p-3 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-md option-btn";
            button.innerText = option;
            button.onclick = () => selectAnswer(option, button);
            optionsContainer.appendChild(button);
        });

        startTimer(15);
    } else {
        // Quiz completed
        document.getElementById("quizContainer").innerHTML = `
            <div class="p-6 bg-white bg-opacity-90 rounded-lg shadow-md text-center">
                <h3 class="text-xl font-bold text-green-600 mb-4">Quiz Completed!</h3>
                <p class="text-gray-700">Thank you for participating!</p>
            </div>
        `;
    }
}
// 🎯 Select an Answer (Highlight Effect)
function selectAnswer(answer, button) {
    console.log(`Selected answer: ${answer}`);
    selectedAnswer = answer;

    // Remove selection from all buttons
    document.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("bg-yellow-500"));
    
    // Highlight the selected option
    button.classList.add("bg-yellow-500");

    // Submit answer to server but don't advance yet
    submitAnswer(answer, false);
    
    // Disable all option buttons after selection
    document.querySelectorAll(".option-btn").forEach(btn => {
        btn.disabled = true;
        btn.classList.add("opacity-60");
    });
    
    // Remove existing message if there is one
    const existingMessage = document.getElementById("answerMessage");
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Show message that answer is locked
    const messageDiv = document.createElement("div");
    messageDiv.id = "answerMessage";
    messageDiv.className = "mt-4 p-2 bg-green-100 text-green-800 text-center rounded";
    messageDiv.textContent = "Answer submitted! Waiting for timer to complete...";
    document.getElementById("options").appendChild(messageDiv);
}

// ✅ Modified Submit Answer Function - only advance when told to
function submitAnswer(answer, advanceQuestion = true) {
    console.log(`Submitting answer: ${answer}, advance: ${advanceQuestion}`);
    
    // If we've already submitted an answer for this question, don't submit again
    if (answerSubmitted && !advanceQuestion) {
        console.log("Answer already submitted for this question, ignoring");
        return;
    }
    
    // Mark that we've submitted an answer for this question
    answerSubmitted = true;
    
    fetch("/submit_answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            game_pin: currentGamePin,
            participant: participantName,
            question_id: currentQuestions[currentQuestionIndex].question_id,
            answer: answer
        })
    })
    .then(response => response.json())
    .then((data) => {
        console.log(`Answer submitted successfully, advanceQuestion: ${advanceQuestion}`);
        // Only advance to next question if advanceQuestion is true
        if (advanceQuestion) {
            console.log("Advancing to next question after submission");
            currentQuestionIndex++;  // Move to next question
            answerSubmitted = false; // Reset for next question
            showQuestion();  // Show next question
        } else {
            console.log("Not advancing to next question after submission, waiting for timer");
        }
    })
    .catch(error => {
        console.error("Error submitting answer:", error);
    });
}

// ⏳ Timer Function (Moves to Next Question After Time Ends)
// Replace the existing timer function
// Modified timer function for participants
function startTimer(seconds) {
    let timeLeft = seconds;
    document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;

    clearInterval(timer); // Reset previous timer
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            
            // Show waiting message after timer ends
            document.getElementById("timer").textContent = "Time's up!";
            
            // If no answer was submitted, submit "No Answer"
            if (!answerSubmitted) {
                console.log("No answer submitted, sending 'No Answer'");
                submitAnswer("No Answer", false);
            }
            
            // Show waiting message 
            showWaitingForHost();
        }
    }, 1000);
}



// New function to show waiting message
function showWaitingForHost() {
    // Create or update waiting message
    let messageDiv = document.getElementById("waitingForHost");
    
    if (!messageDiv) {
        messageDiv = document.createElement("div");
        messageDiv.id = "waitingForHost";
        messageDiv.className = "mt-4 p-3 bg-yellow-100 text-yellow-800 text-center rounded-md";
        document.getElementById("quizContainer").appendChild(messageDiv);
    }
    
    messageDiv.textContent = "Waiting for host to move to the next question...";
    
    // Disable any remaining active option buttons
    document.querySelectorAll(".option-btn").forEach(btn => {
        btn.disabled = true;
        btn.classList.add("opacity-60");
    });
    
    // Start polling to check for next question
    startPollingForNextQuestion();
}

// New polling function to check when host moves to next question
function startPollingForNextQuestion() {
    if (window.nextQuestionPollInterval) {
        clearInterval(window.nextQuestionPollInterval);
    }
    
    window.nextQuestionPollInterval = setInterval(() => {
        console.log("Checking if host has moved to next question...");
        
        fetch(`/check_current_question?game_pin=${currentGamePin}`)
        .then(response => response.json())
        .then(data => {
            console.log("Current question index from server:", data.current_question_index);
            console.log("Local question index:", currentQuestionIndex);
            
            if (data.current_question_index > currentQuestionIndex) {
                console.log("Host has moved to next question! Updating...");
                
                // Stop polling
                clearInterval(window.nextQuestionPollInterval);
                
                // Update to the new question index
                currentQuestionIndex = data.current_question_index;
                
                // Show the next question
                showQuestion();
            }
        })
        .catch(error => {
            console.error("Error checking for next question:", error);
        });
    }, 2000); // Check every 2 seconds
}



















function loadQuizzes() {
    let quizList = document.getElementById("quizList");

    if (!quizList) {
        console.error("❌ quizList dropdown not found in DOM! Ensure script is at the bottom.");
        return;
    }

    console.log("📢 Fetching Quizzes...");

    fetch("/get_quizzes")
    .then(response => response.json())
    .then(data => {
        console.log("📥 API Response:", data); // Debugging API response

        let dropdownHTML = `<option value="">Select a Quiz</option>`;

        if (!Array.isArray(data) || data.length === 0) {
            dropdownHTML = `<option value="">No quizzes available</option>`;
        } else {
            data.forEach(quiz => {
                console.log(`📌 Adding Quiz: ID=${quiz.id}, Title=${quiz.title}`);
                dropdownHTML += `<option value="${quiz.id}">${quiz.title} (${quiz.category})</option>`;
            });
        }

        quizList.innerHTML = dropdownHTML; // ✅ Apply the new HTML
        console.log("✅ Dropdown Updated Successfully!");
    })
    .catch(error => console.error("❌ Error loading quizzes:", error));
}


// ✅ Run this when page loads

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ Page Loaded, Fetching Quizzes...");
    loadQuizzes();
});







// 🏆 Fetch & Display Most Incorrectly Answered Questions
function fetchMostIncorrectQuestions() {
    if (!currentGamePin) {
        alert("Game PIN not found! Start a quiz first.");
        return;
    }

    fetch("/most_incorrect_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin: currentGamePin })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Most Incorrect Questions:", data);

        let incorrectQuestionsTable = document.getElementById("incorrectQuestionsTable");
        incorrectQuestionsTable.innerHTML = ""; // Clear previous data

        if (data.incorrect_questions.length === 0) {
            incorrectQuestionsTable.innerHTML = `<tr><td colspan="2">No incorrect responses found.</td></tr>`;
            return;
        }

        data.incorrect_questions.forEach((entry, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${entry.question}</td>
                <td>${entry.incorrect_count} ❌</td>
            </tr>`;
            incorrectQuestionsTable.innerHTML += row;
        });
    })
    .catch(error => {
        console.error("Error fetching most incorrect questions:", error);
        alert("Error fetching most incorrect questions. Check console.");
    });
}


// 🏆 Fetch & Display Leaderboard
// 🏆 Fetch & Display Leaderboard
// 🏆 Fetch & Display Leaderboard
function fetchLeaderboard() {
    console.log("Current Game PIN:", currentGamePin); // ✅ Debugging

    if (!currentGamePin) {
        alert("Game PIN not found! Start a quiz first.");
        return;
    }

    fetch("/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin: currentGamePin })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Leaderboard Data:", data); // ✅ Debugging

        let leaderboardTable = document.getElementById("leaderboardTable");
        leaderboardTable.innerHTML = ""; // Clear old data

        if (data.leaderboard.length === 0) {
            leaderboardTable.innerHTML = `<tr><td colspan="3">No data yet.</td></tr>`;
            return;
        }

        // Loop through leaderboard & display participants
        data.leaderboard.forEach((entry, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${entry.participant}</td>
                <td>${entry.score}</td>
            </tr>`;
            leaderboardTable.innerHTML += row;
        });
    })
    .catch(error => {
        console.error("Error fetching leaderboard:", error);
        alert("Error fetching leaderboard. Check console.");
    });
}


function fetchIncorrectQuestions() {
    fetch("/most_incorrect_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin: currentGamePin })
    })
    .then(response => response.json())
    .then(data => {
        let table = document.getElementById("incorrectQuestionsTable");
        table.innerHTML = "";  // Clear old data

        if (data.incorrect_questions.length === 0) {
            table.innerHTML = `<tr><td colspan="3">No incorrect responses found.</td></tr>`;
            return;
        }

        data.incorrect_questions.forEach(q => {
            let row = `<tr>
                <td>${q.question}</td>
                <td>${q.correct_answer}</td>
                <td>${q.incorrect_percentage}</td>
            </tr>`;
            table.innerHTML += row;
        });
    })
    .catch(error => console.error("Error fetching incorrect questions:", error));
}


// 🏆 Fetch Performance Analysis Data
// 🏆 Fetch Performance Analysis Data
function fetchPerformanceAnalysis() {
    console.log("Fetching performance analysis for game PIN:", currentGamePin); // Debugging

    if (!currentGamePin) {
        alert("Game PIN not found! Start a quiz first.");
        return;
    }

    fetch("/performance_analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin: currentGamePin })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Performance Data:", data);

        // Update summary metrics
        updatePerformanceSummary(data);
        
        // 📊 Update Score Distribution Chart
        updateChart("scoreChart", "Score Distribution", data.participants, data.scores, "rgba(75, 192, 192, 0.6)");

        // ✅❌ Update Accuracy Chart
        updateChart("accuracyChart", "Correct vs Incorrect", ["Correct", "Incorrect"], [data.correct, data.incorrect], ["#2ECC71", "#E74C3C"]);
        
        // Create performance distribution chart
        createPerformanceDistribution(data);
        
        // Update percentiles visualization
        updatePercentiles(data.scores);
    })
    .catch(error => {
        console.error("Error fetching performance analysis:", error);
        alert("Error fetching analysis. Check console.");
    });
}

// Update performance summary cards
function updatePerformanceSummary(data) {
    // Calculate and update metrics
    document.getElementById('totalParticipants').textContent = data.participants.length;
    
    const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length || 0;
    document.getElementById('avgScore').textContent = avgScore.toFixed(1) + " pts";
    
    const totalAnswers = data.correct + data.incorrect;
    const accuracyRate = (data.correct / totalAnswers * 100) || 0;
    document.getElementById('accuracyRate').textContent = accuracyRate.toFixed(1) + "%";
    
    const topScore = Math.max(...data.scores) || 0;
    document.getElementById('topScore').textContent = topScore + " pts";
}

// Create performance distribution chart
function createPerformanceDistribution(data) {
    // Group scores into ranges for better visualization
    const scoreRanges = groupScoresIntoRanges(data.scores);
    
    // Create a bar chart for score distribution
    const ctx = document.getElementById('performanceDistribution').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.performanceDistChart) {
        window.performanceDistChart.destroy();
    }
    
    window.performanceDistChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(scoreRanges),
            datasets: [{
                label: 'Number of Students',
                data: Object.values(scoreRanges),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 205, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Score Distribution by Range'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Students'
                    },
                    ticks: {
                        precision: 0
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Score Range'
                    }
                }
            }
        }
    });
}

// Group scores into logical ranges
function groupScoresIntoRanges(scores) {
    // Find max possible score to create appropriate ranges
    const maxScore = Math.max(...scores) || 100;
    const rangeSize = Math.ceil(maxScore / 5); // Divide into 5 ranges
    
    // Initialize ranges
    const ranges = {};
    for (let i = 0; i < 5; i++) {
        const lowerBound = i * rangeSize;
        const upperBound = (i + 1) * rangeSize - 1;
        ranges[`${lowerBound}-${upperBound}`] = 0;
    }
    
    // Count scores in each range
    scores.forEach(score => {
        for (let i = 0; i < 5; i++) {
            const lowerBound = i * rangeSize;
            const upperBound = (i + 1) * rangeSize - 1;
            if (score >= lowerBound && score <= upperBound) {
                const rangeKey = `${lowerBound}-${upperBound}`;
                ranges[rangeKey]++;
                break;
            }
        }
    });
    
    return ranges;
}

// Update percentiles visualization
function updatePercentiles(scores) {
    if (!scores || scores.length === 0) {
        return;
    }
    
    // Sort scores to calculate percentiles
    const sortedScores = [...scores].sort((a, b) => a - b);
    const count = sortedScores.length;
    
    // Calculate percentile values
    const p25 = sortedScores[Math.floor(count * 0.25)];
    const p50 = sortedScores[Math.floor(count * 0.5)];
    const p75 = sortedScores[Math.floor(count * 0.75)];
    const p100 = sortedScores[count - 1];
    
    // Update the percentile display
    document.getElementById('p25Value').textContent = p25;
    document.getElementById('p50Value').textContent = p50;
    document.getElementById('p75Value').textContent = p75;
    document.getElementById('p100Value').textContent = p100;
    
    // Update percentile info text
    document.getElementById('percentileInfo').textContent = 
        `Min: ${sortedScores[0]} | Median: ${p50} | Max: ${p100}`;
        
    // Calculate width percentages for more accurate visualization
    const min = sortedScores[0];
    const max = p100;
    const range = max - min || 1; // Avoid division by zero
    
    // Calculate width of each segment relative to the full range
    const p25Width = ((p25 - min) / range) * 100;
    const p50Width = ((p50 - p25) / range) * 100;
    const p75Width = ((p75 - p50) / range) * 100;
    const p100Width = ((p100 - p75) / range) * 100;
    
    // Update the widths of the percentile bars
    document.getElementById('p25').style.width = `${p25Width}%`;
    document.getElementById('p50').style.width = `${p50Width}%`;
    document.getElementById('p75').style.width = `${p75Width}%`;
    document.getElementById('p100').style.width = `${p100Width}%`;
}

// Generic function to update charts (existing function)
function updateChart(chartId, label, labels, data, backgroundColor) {
    const ctx = document.getElementById(chartId).getContext('2d');
    
    // Destroy existing chart if it exists
    if (window[chartId + 'Instance']) {
        window[chartId + 'Instance'].destroy();
    }
    
    // Create chart type based on data
    let chartType = 'bar';
    let chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: label === "Correct vs Incorrect"
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };
    
    // For the accuracy pie chart
    if (label === "Correct vs Incorrect") {
        chartType = 'pie';
        chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        };
    }
    
    // Create new chart
    window[chartId + 'Instance'] = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: Array.isArray(backgroundColor) ? backgroundColor : [backgroundColor],
                borderColor: Array.isArray(backgroundColor) 
                    ? backgroundColor.map(color => color.replace('0.6', '1')) 
                    : backgroundColor.replace('0.6', '1'),
                borderWidth: 1
            }]
        },
        options: chartOptions
    });
}



function fetchQuizAnalysis() {
    fetch("/quiz_analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_pin: currentGamePin })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("successRate").textContent = data.success_rate;
        document.getElementById("averageScore").textContent = data.average_score;
        document.getElementById("difficultyLevel").textContent = data.difficulty_level;
    })
    .catch(error => console.error("Error fetching quiz analysis:", error));
}


// 📊 Function to Update Charts
function updateChart(chartId, label, labels, values, colors) {
    let ctx = document.getElementById(chartId).getContext("2d");
    
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                backgroundColor: Array.isArray(colors) ? colors : [colors],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}


// 🧠 Upload File & Generate AI Questions
function uploadAndGenerateQuestions() {
    let fileInput = document.getElementById("fileInput").files[0];

    if (!fileInput) {
        alert("Please select a file first!");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput);

    fetch("/generate_questions", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        let aiQuestionsList = document.getElementById("aiQuestionsList");
        aiQuestionsList.innerHTML = ""; // Clear old questions

        data.questions.forEach((q, index) => {
            let li = document.createElement("li");
            li.classList.add("bg-gray-800", "p-3", "rounded-md", "shadow-md");

            li.innerHTML = `
                <strong>Q${index + 1}: ${q.question}</strong>
                <ul class="mt-2">
                    <li>✅ ${q.correct_answer}</li>
                    <li>❌ ${q.incorrect_options[0]}</li>
                    <li>❌ ${q.incorrect_options[1]}</li>
                    <li>❌ ${q.incorrect_options[2]}</li>
                </ul>
            `;
            aiQuestionsList.appendChild(li);
        });

        document.getElementById("aiQuestionsContainer").classList.remove("hidden"); // Show generated questions
    })
    .catch(error => console.error("Error generating questions:", error));
}

// 🏆 Add AI Questions to Selected Quiz

function addAIQuestionsToQuiz() {
    let quiz_id = document.getElementById("quizList").value;

    if (!quiz_id) {
        alert("❌ Please select a quiz first!");
        return;
    }

    let questions = [];
    document.querySelectorAll("#aiQuestionsList li").forEach(li => {
        let questionText = li.querySelector("strong").textContent.replace(/^Q\d+: /, "");
        let options = Array.from(li.querySelectorAll("ul li")).map(li => li.textContent.replace(/[✅❌] /, ""));
        let correctAnswer = options[0];

        questions.push({
            question: questionText,
            correct_answer: correctAnswer,
            incorrect_options: options.slice(1)
        });
    });

    console.log("📤 Sending Data to Backend:", JSON.stringify({ quiz_id, questions }));  // Debugging

    fetch("/add_ai_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id, questions })
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Server Response:", data);  // Debugging
        alert(data.message);
    })
    .catch(error => console.error("❌ Error adding AI questions:", error));
}



// Function to fetch questions based on selected filters


// Function to Fetch and Display Questions with Pagination

function fetchFilteredQuestions() {
    let class_level = document.getElementById("filterClass").value;
    let subject = document.getElementById("filterSubject").value;
    let book_name = document.getElementById("filterBook").value;
    let chapter = document.getElementById("filterChapter").value;

    if (!class_level || !subject || !book_name || !chapter) {
        alert("⚠️ Please select Class, Subject, Book, and Chapter!");
        return;
    }

    console.log("🟢 Sending Request:", { class_level, subject, book_name, chapter });

    fetch("/fetch_filtered_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject, book_name, chapter })
    })
    .then(response => response.json())
    .then(data => {
        console.log("📤 Server Response:", data); // ✅ Debugging Output

        if (!data || !data.questions) {
            console.error("❌ Invalid API response!", data);
            return;
        }

        if (data.questions.length === 0) {
            document.getElementById("questionsList").innerHTML = "<p class='text-red-400'>❌ No questions found!</p>";
            return;
        }

        // ✅ Store questions globally
        questionsData = data.questions;
        currentPage = 1;
        displayQuestions(); // ✅ Render questions
        document.getElementById("questionsContainer").classList.remove("hidden"); // ✅ Show container
    })
    .catch(error => console.error("❌ Error fetching questions:", error));
}


function displayQuestions() {
    let questionsList = document.getElementById("questionsList");
    let pageNumber = document.getElementById("pageNumber");
    let prevButton = document.getElementById("prevPage");
    let nextButton = document.getElementById("nextPage");

    if (!questionsData || questionsData.length === 0) {
        questionsList.innerHTML = "<p class='text-red-400'>❌ No questions to display!</p>";
        return;
    }

    console.log("🔄 Displaying Questions:", questionsData); // ✅ Debugging

    questionsList.innerHTML = ""; // Clear previous content

    let start = (currentPage - 1) * 5;
    let end = start + 5;
    let paginatedQuestions = questionsData.slice(start, end);

    paginatedQuestions.forEach((question, index) => {
        let questionBox = document.createElement("div");
        questionBox.classList.add("p-4", "bg-white", "rounded-lg", "shadow-md", "mb-4", "border-l-4", "border-blue-400");

        questionBox.innerHTML = `
            <h4 class="text-lg font-semibold text-gray-700 mb-2">${start + index + 1}. ${question.question}</h4>
            <ul class="space-y-2">
                <li class="p-2 rounded ${question.correct_answer === question.option1 ? 'bg-green-200' : 'bg-gray-100'}">✅ ${question.option1}</li>
                <li class="p-2 rounded ${question.correct_answer === question.option2 ? 'bg-green-200' : 'bg-gray-100'}">❌ ${question.option2}</li>
                <li class="p-2 rounded ${question.correct_answer === question.option3 ? 'bg-green-200' : 'bg-gray-100'}">❌ ${question.option3}</li>
                <li class="p-2 rounded ${question.correct_answer === question.option4 ? 'bg-green-200' : 'bg-gray-100'}">❌ ${question.option4}</li>
            </ul>
        `;
        questionsList.appendChild(questionBox);
    });

    pageNumber.textContent = `Page ${currentPage} of ${Math.ceil(questionsData.length / 5)}`;

    prevButton.style.display = currentPage > 1 ? "inline-flex" : "none";
    nextButton.style.display = end < questionsData.length ? "inline-flex" : "none";
}



// Function to Handle Pagination Navigation
function changePage(direction) {
    currentPage += direction;
    displayQuestions();
}




document.getElementById("filterSubject").addEventListener("change", function () {
    let classLevel = document.getElementById("filterClass").value;
    let subject = this.value;
    let bookSelect = document.getElementById("filterBook");

    if (!classLevel || !subject) {
        bookSelect.innerHTML = "<option value=''>Select Book</option>";
        return;
    }

    fetch("/get_books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level: classLevel, subject: subject })
    })
    .then(response => response.json())
    .then(data => {
        bookSelect.innerHTML = "<option value=''>Select Book</option>";

        if (data.books.length > 0) {
            data.books.forEach(book => {
                let option = document.createElement("option");
                option.value = book;
                option.textContent = book;
                bookSelect.appendChild(option);
            });
        } else {
            bookSelect.innerHTML = "<option value=''>No books found</option>";
        }
    })
    .catch(error => console.error("Error fetching books:", error));
});





document.getElementById("filterBook").addEventListener("change", function () {
    let classLevel = document.getElementById("filterClass").value;
    let subject = document.getElementById("filterSubject").value;
    let bookName = this.value;
    let chapterSelect = document.getElementById("filterChapter");

    if (!classLevel || !subject || !bookName) {
        chapterSelect.innerHTML = "<option value=''>Select Chapter</option>";
        return;
    }

    fetch("/get_chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level: classLevel, subject: subject, book_name: bookName })
    })
    .then(response => response.json())
    .then(data => {
        chapterSelect.innerHTML = "<option value=''>Select Chapter</option>";

        if (data.chapters.length > 0) {
            data.chapters.forEach(chapter => {
                let option = document.createElement("option");
                option.value = chapter;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
        } else {
            chapterSelect.innerHTML = "<option value=''>No chapters found</option>";
        }
    })
    .catch(error => console.error("Error fetching chapters:", error));
});




document.getElementById("classSelect").addEventListener("change", fetchBooks);
document.getElementById("subjectSelect").addEventListener("change", fetchBooks);

function fetchBooks() {
    let class_level = document.getElementById("classSelect").value;
    let subject = document.getElementById("subjectSelect").value;
    let bookSelect = document.getElementById("bookSelect");
    bookSelect.innerHTML = "<option value=''>Select Book</option>";

    if (!class_level || !subject) return;

    fetch("/get_books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject })
    })
    .then(res => res.json())
    .then(data => {
        data.books.forEach(book => {
            let option = document.createElement("option");
            option.value = book;
            option.textContent = book;
            bookSelect.appendChild(option);
        });
    });
}

// Fetch Chapters when Book is selected
document.getElementById("bookSelect").addEventListener("change", () => {
    let class_level = document.getElementById("classSelect").value;
    let subject = document.getElementById("subjectSelect").value;
    let book = document.getElementById("bookSelect").value;
    let chapterSelect = document.getElementById("chapterSelect");
    chapterSelect.innerHTML = "<option value=''>Select Chapter</option>";

    if (!class_level || !subject || !book) return;

    fetch("/get_chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject, book })
    })
    .then(res => res.json())
    .then(data => {
        data.chapters.forEach(chapter => {
            let option = document.createElement("option");
            option.value = chapter;
            option.textContent = chapter;
            chapterSelect.appendChild(option);
        });
    });
});





// Function to limit selection to 15 questions
function limitSelection() {
    let checkboxes = document.querySelectorAll(".questionCheckbox:checked");
    let submitBtn = document.getElementById("submitQuizBtn");

    if (checkboxes.length > 15) {
        alert("⚠️ You can select a maximum of 15 questions!");
        this.checked = false; // Uncheck the last selected checkbox
    }

    submitBtn.disabled = checkboxes.length === 0;
}

// Function to submit selected questions as a new quiz
function submitQuiz() {
    let selectedQuestions = [];
    document.querySelectorAll(".question-checkbox:checked").forEach(checkbox => {
        selectedQuestions.push(checkbox.value);
    });

    if (selectedQuestions.length === 0) {
        alert("⚠️ Please select at least one question!");
        return;
    }

    // Ask admin for quiz title and category
    let quizTitle = prompt("Enter Quiz Title:");
    if (!quizTitle) return;

    let quizCategory = prompt("Enter Quiz Category:");
    if (!quizCategory) return;

    fetch("/create_quiz_from_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizTitle, quizCategory, selectedQuestions })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("✅ Quiz created successfully!");
            window.location.reload();  // Refresh to update quiz list
        } else {
            alert("❌ Error: " + data.error);
        }
    })
    .catch(error => console.error("Error:", error));
}



// Function to fetch available books based on selected class & subject
function fetchBooks() {
    let class_level = document.getElementById("filterClass").value;
    let subject = document.getElementById("filterSubject").value;

    if (!class_level || !subject) {
        console.log("⚠️ Please select Class and Subject first!");
        return;
    }

    fetch("/get_books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject })
    })
    .then(response => response.json())
    .then(data => {
        let bookSelect = document.getElementById("filterBook");
        bookSelect.innerHTML = "<option value=''>Select Book</option>"; // Reset dropdown

        if (data.books.length === 0) {
            alert("❌ No books found for this Class & Subject!");
            return;
        }

        // Populate dropdown with available books
        data.books.forEach(book => {
            let option = document.createElement("option");
            option.value = book;
            option.textContent = book;
            bookSelect.appendChild(option);
        });
    })
    .catch(error => console.error("❌ Error fetching books:", error));
}


// Attach event listeners
document.getElementById("filterClass").addEventListener("change", fetchBooks);
document.getElementById("filterSubject").addEventListener("change", fetchBooks);

// Attach event listeners to trigger book fetching
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("classSelect").addEventListener("change", fetchBooks);
    document.getElementById("subjectSelect").addEventListener("change", fetchBooks);
});

document.getElementById("showCriteriaBtn").addEventListener("click", function () {
    document.getElementById("quizCriteria").style.display = "block";
});



function togglePrePostForm() {
    let prePostForm = document.getElementById("prePostQuizForm");

    if (prePostForm.classList.contains("hidden")) {
        prePostForm.classList.remove("hidden"); // Show form
    } else {
        prePostForm.classList.add("hidden"); // Hide form
    }
}

// Function to Generate Pre & Post Assessment Quiz
// Function to Generate Pre & Post Assessment Quiz
function generatePrePostQuiz() {
    let class_level = document.getElementById("prePostClass").value;
    let subject = document.getElementById("prePostSubject").value;
    let book_name = document.getElementById("prePostBook").value;
    let chapter = document.getElementById("prePostChapter").value;

    if (!class_level || !subject || !book_name || !chapter) {
        alert("⚠️ Please select Class, Subject, Book, and Chapter!");
        return;
    }

    fetch("/generate_pre_post_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject, book_name, chapter })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("quizGenerationMessage").textContent = 
                `✅ Pre & Post Assessment Quizzes Created! Pre-Quiz ID: ${data.pre_quiz_id}, Post-Quiz ID: ${data.post_quiz_id}`;
            document.getElementById("quizGenerationMessage").classList.remove("hidden");

            // ✅ Populate quiz dropdown
            let quizSelect = document.getElementById("quizSelect");
            quizSelect.innerHTML = `
                <option value="">Select Quiz</option>
                <option value="${data.pre_quiz_id}">Pre-Assessment Quiz (${data.pre_quiz_id})</option>
                <option value="${data.post_quiz_id}">Post-Assessment Quiz (${data.post_quiz_id})</option>
            `;

            // ✅ Show Quiz Selection Section
            document.getElementById("quizQuestionsContainer").classList.remove("hidden");
        } else {
            alert("❌ Error: " + data.error);
        }
    })
    .catch(error => console.error("❌ Error generating quizzes:", error));
}

// Function to Fetch Books for Pre/Post Quiz Section
// ✅ Fetch Books for Pre/Post Quiz Section
// ✅ New Sure-Shot Fetch Books Function
// ✅ New Sure-Shot Fetch Books Function
function fetchBooksForPrePost() {
    let class_level = document.getElementById("prePostClass").value;
    let subject = document.getElementById("prePostSubject").value;
    let bookSelect = document.getElementById("prePostBook");

    if (!class_level || !subject) {
        console.warn("⚠️ Select Class & Subject first! Resetting Book dropdown.");
        bookSelect.innerHTML = "<option value=''>Select Book</option>";
        return;
    }

    console.log(`📤 Fetching Books for: Class ${class_level}, Subject ${subject}`);

    fetch("/get_books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject })
    })
    .then(response => response.json())
    .then(data => {
        console.log("📥 API Response for Books:", data);

        // Clear existing options
        bookSelect.innerHTML = "<option value=''>Select Book</option>";

        if (data.books && data.books.length > 0) {
            data.books.forEach(book => {
                let option = document.createElement("option");
                option.value = book;
                option.textContent = book;
                bookSelect.appendChild(option);
            });
            console.log("✅ Books added to dropdown:", data.books);
        } else {
            console.warn("⚠️ No books found!");
            bookSelect.innerHTML = "<option value=''>No books found</option>";
        }
    })
    .catch(error => console.error("❌ Error fetching books:", error));
}

// ✅ Attach Events Correctly on Page Load
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Adding event listeners for Class & Subject dropdowns");

    document.getElementById("prePostClass").addEventListener("change", fetchBooksForPrePost);
    document.getElementById("prePostSubject").addEventListener("change", fetchBooksForPrePost);
});


// ✅ Manual Debugging Function
function debugFetchBooks() {
    console.log("🚀 Manually triggering fetchBooksForPrePost()");
    fetchBooksForPrePost();
}

// Attach Events on Page Load
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("prePostClass").addEventListener("change", fetchBooksForPrePost);
    document.getElementById("prePostSubject").addEventListener("change", fetchBooksForPrePost);
});




function fetchBooksAndChapters() {
    const classLevel = document.getElementById("classSelect").value;
    const subject = document.getElementById("subjectSelect").value;

    if (!classLevel || !subject) return;

    fetch(`/get_books_and_chapters?class_level=${classLevel}&subject=${subject}`)
        .then(response => response.json())
        .then(data => {
            const bookSelect = document.getElementById("bookSelect");
            const chapterSelect = document.getElementById("chapterSelect");

            bookSelect.innerHTML = '<option value="">Select Book</option>';
            chapterSelect.innerHTML = '<option value="">Select Chapter</option>';

            // Populate books
            data.books.forEach(book => {
                const option = document.createElement("option");
                option.value = book;
                option.textContent = book;
                bookSelect.appendChild(option);
            });

            // Populate chapters
            data.chapters.forEach(chapter => {
                const option = document.createElement("option");
                option.value = chapter;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Failed to fetch books/chapters:", error);
        });
}


// ✅ Fetch Chapters for Pre/Post Quiz Section
// ✅ Function to Fetch Chapters Manually
// Function to Fetch Chapters when a Book is Selected

// Function to Fetch Chapters when a Book is Selected
function fetchChaptersForPrePost() {
    let class_level = document.getElementById("prePostClass").value;
    let subject = document.getElementById("prePostSubject").value;
    let book_name = document.getElementById("prePostBook").value;
    let chapterSelect = document.getElementById("prePostChapter");

    if (!class_level || !subject || !book_name) {
        console.warn("⚠️ Please select Class, Subject, and Book first!");
        chapterSelect.innerHTML = "<option value=''>Select Chapter</option>";
        return;
    }

    console.log(`📤 Fetching Chapters for: Class ${class_level}, Subject ${subject}, Book ${book_name}`);

    fetch("/get_chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_level, subject, book_name })
    })
    .then(response => response.json())
    .then(data => {
        console.log("📥 API Response for Chapters:", data); // Debugging

        chapterSelect.innerHTML = "<option value=''>Select Chapter</option>"; // Reset dropdown

        if (data.chapters.length > 0) {
            data.chapters.forEach(chapter => {
                let option = document.createElement("option");
                option.value = chapter;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
        } else {
            chapterSelect.innerHTML = "<option value=''>No chapters found</option>";
        }
    })
    .catch(error => console.error("❌ Error fetching chapters:", error));
}

// ✅ Attach event listener to Book Dropdown
document.getElementById("prePostBook").addEventListener("change", fetchChaptersForPrePost);

// ✅ Attach event listener to Book Dropdown
document.getElementById("prePostBook").addEventListener("change", fetchChaptersForPrePost);



document.getElementById("prePostClass").addEventListener("change", fetchBooksForPrePost);
document.getElementById("prePostSubject").addEventListener("change", fetchBooksForPrePost);


function fetchQuizQuestions() {
    let quizId = document.getElementById("quizSelect").value;

    if (!quizId) {
        alert("⚠️ Please select a quiz!");
        return;
    }

    fetch("/get_quiz_questions", {  // ✅ Ensure this is the correct API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: quizId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("❌ " + data.error);
            return;
        }

        let quizQuestionsList = document.getElementById("quizQuestionsList");
        quizQuestionsList.innerHTML = ""; // Clear previous content

        data.questions.forEach((question, index) => {
            let questionItem = document.createElement("div");
            questionItem.classList.add("p-4", "bg-white", "rounded-lg", "shadow-md", "mb-4");

            questionItem.innerHTML = `
                <h4 class="text-lg font-semibold">${index + 1}. ${question.question}</h4>
                <ul class="space-y-2 mt-2">
                    ${question.options.map(opt => `<li class="p-2 bg-gray-100 rounded">${opt}</li>`).join("")}
                </ul>
                <p class="mt-2"><strong>✅ Correct Answer:</strong> ${question.correct_answer}</p>
            `;
            quizQuestionsList.appendChild(questionItem);
        });

        document.getElementById("quizQuestionsContainer").classList.remove("hidden");
    })
    .catch(error => console.error("❌ Error fetching questions:", error));
}
