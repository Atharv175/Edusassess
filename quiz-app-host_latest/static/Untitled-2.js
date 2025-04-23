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
    let quizId = document.getElementById("quizList").value;
    let classLevel = document.getElementById("classSelect").value;
    let subject = document.getElementById("subjectSelect").value;
    let chapter = document.getElementById("chapterSelect").value;
    let question = document.getElementById("questionText").value;
    let option1 = document.getElementById("option1").value;
    let option2 = document.getElementById("option2").value;
    let option3 = document.getElementById("option3").value;
    let option4 = document.getElementById("option4").value;
    let correctAnswer = document.getElementById("correctAnswer").value;

    // Ensure no fields are empty
    if (!quizId || !classLevel || !subject || !chapter || !question || 
        !option1 || !option2 || !option3 || !option4 || !correctAnswer) {
        alert("All fields are required!");
        return;
    }

    let questionData = {
        quiz_id: quizId,
        class_level: classLevel,
        subject: subject,
        chapter: chapter,
        question: question,
        option1: option1,
        option2: option2,
        option3: option3,
        option4: option4,
        correct_answer: correctAnswer
    };

    console.log("Sending Data:", questionData); // Debugging in Console

    fetch("/add_question", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(questionData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        alert(data.success || data.error);
    })
    .catch(error => console.error("Error:", error));
}


// ✅ Initialize globally


// Function to start a quiz
let responseInterval = null;
// 🎯 Start a Quiz (Host)
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
        console.log("Quiz Started:", data); // ✅ Debugging

        if (data.game_pin) {
            currentGamePin = data.game_pin; // ✅ Store Game PIN globally
            document.getElementById("gamePin").textContent = "Game PIN: " + currentGamePin;

            // Start response tracking
            if (responseInterval) clearInterval(responseInterval);
            responseInterval = setInterval(() => fetchResponses(currentGamePin), 3000);
        } else {
            alert("Error starting quiz.");
        }
    })
    .catch(error => console.error("Error starting quiz:", error));
}

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
    })
    .catch(error => console.error("Error fetching responses:", error));
}






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
            alert("✅ Successfully joined the quiz!");
            currentGamePin = gamePin;
            participantName = playerName;

            document.getElementById("joinForm").style.display = "none";
            document.getElementById("quizContainer").classList.remove("hidden");

            fetchQuestions();  // ✅ Fixed: Now correctly fetching all questions
        } else {
            alert("❌ Error: " + data.error);
        }
    })
    .catch(error => console.error("Error joining quiz:", error));
}

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

// 📜 Show Next Question
function showQuestion() {
    if (currentQuestionIndex < currentQuestions.length) {
        let questionData = currentQuestions[currentQuestionIndex];
        document.getElementById("questionText").innerText = questionData.question;

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
        alert("✅ Quiz completed! Thank you for participating.");
        document.getElementById("quizContainer").style.display = "none";
    }
}

// ✅ Automatically Submit Answer and Move to Next Question
function submitAnswer(answer) {
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
    .then(() => {
        currentQuestionIndex++;  // ✅ Move to next question
        showQuestion();  // ✅ Show next question
    })
    .catch(error => console.error("Error submitting answer:", error));
}

// 🎯 Select an Answer (Highlight Effect)
function selectAnswer(answer, button) {
    selectedAnswer = answer;

    // Remove selection from all buttons
    document.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("bg-yellow-500"));
    
    // Highlight the selected option
    button.classList.add("bg-yellow-500");

    // Auto-submit answer
    submitAnswer(answer);
}

// ⏳ Timer Function (Moves to Next Question After Time Ends)
function startTimer(seconds) {
    let timeLeft = seconds;
    document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;

    clearInterval(timer); // Reset previous timer
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            submitAnswer("No Answer"); // Auto-submit answer if time runs out
        }
    }, 1000);
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

        // 📊 Update Score Distribution Chart
        updateChart("scoreChart", "Score Distribution", data.participants, data.scores, "rgba(75, 192, 192, 0.6)");

        // ✅❌ Update Accuracy Chart
        updateChart("accuracyChart", "Correct vs Incorrect", ["Correct", "Incorrect"], [data.correct, data.incorrect], ["#2ECC71", "#E74C3C"]);
    })
    .catch(error => {
        console.error("Error fetching performance analysis:", error);
        alert("Error fetching analysis. Check console.");
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
