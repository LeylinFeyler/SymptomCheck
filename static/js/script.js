// Перевірка статусу логіну і завантаження історії при завантаженні сторінки
function checkLoginStatus() {
    fetch("/api/check_login")
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                // Користувач залогінений, завантажуємо історію
                updateUIOnSignIn();
                loadChatHistory(data.history); // Передаємо історію повідомлень в loadChatHistory
            } else {
                updateUIOnSignOut();
            }
        });
}

function loadChatHistory() {
    $.get("/get_history", function(data) {
        // Очищуємо chatlogs перед завантаженням історії
        $("#chatlogs").empty();

        // Додаємо кожен запис з історії в чат
        data.forEach(record => {
            // Додаємо повідомлення користувача
            $("#chatlogs").append('<p class="user">' + record.message + '</p>');

            // Додаємо діагноз від бота
            $("#chatlogs").append('<p class="bot">' + record.diagnosis + '</p>');
        });

        // Прокручуємо чат вниз до останнього повідомлення
        var chatlogs = document.getElementById("chatlogs");
        chatlogs.scrollTop = chatlogs.scrollHeight;
    });
}

function clearChat() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch('/clear_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken // Додаємо CSRF-токен
        }
    })
    .then(response => {
        if (response.ok) {
            // alert("Чат очищено.");
            document.getElementById('chatlogs').innerHTML = ''; // Очищення чату на клієнті
        } else {
            alert("Помилка при очищенні чату.");
        }
    })
    .catch(error => {
        console.error('Помилка:', error);
        alert("Щось пішло не так.");
    });
}


// Викликаємо завантаження історії при логіні
function updateUIOnSignIn() {
    document.getElementById("signInBtn").style.display = "none";
    document.getElementById("signOutBtn").style.display = "inline-block";

    // Завантажуємо історію повідомлень після логіну
    loadChatHistory();
}

function updateUIOnSignOut() {
    document.getElementById("signInBtn").style.display = "inline-block";
    document.getElementById("signOutBtn").style.display = "none";
}

function signInWithGoogle() {
    // Відкриваємо авторизацію в новому вікні
    const loginWindow = window.open("/login/google", "GoogleLogin", "width=500,height=600");

    // Очікуємо повідомлення від вікна авторизації
    window.addEventListener("message", (event) => {
        if (event.data === "login_success") {
            // Закриваємо вікно авторизації після успішного логіну
            loginWindow.close();
            // Оновлюємо інтерфейс: показуємо нікнейм та аватарку
            loadUserDetails();
        }
    });
}

function signOut() {
    // Отримуємо CSRF-токен із мета-тегу
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    // Відправляємо запит на вихід через AJAX з CSRF-токеном
    $.ajax({
        type: "POST",
        url: "/logout",
        headers: {
            "X-CSRFToken": csrfToken
        },
        success: function() {
            // Очищуємо дані користувача після успішного виходу
            document.getElementById("userMenu").style.display = "none";
            document.getElementById("signInBtn").style.display = "inline-block";

            // Очищуємо нікнейм і аватарку
            document.getElementById("username").textContent = "";
            document.getElementById("userAvatar").src = "";

            // Очищуємо історію чату
            $("#chatlogs").empty();
        },
        error: function(error) {
            alert("Помилка при виході з системи.");
            console.log(error);
        }
    });
}

function loadUserDetails() {
    // Завантажуємо дані користувача (ім'я та аватарку) з сервера
    fetch("/api/user_info") // Створіть API, який повертає нікнейм і URL аватарки
        .then(response => response.json())
        .then(data => {
            document.getElementById("username").textContent = data.username || "User";
            document.getElementById("userAvatar").src = data.avatar_url || "default_avatar.png";  // default_avatar.png для випадків, коли аватарки немає

            // Показуємо кнопку користувача та приховуємо кнопку "Sign In"
            document.getElementById("signInBtn").style.display = "none";
            document.getElementById("userMenu").style.display = "flex";
        });
}

function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
}

window.addEventListener("message", (event) => {
    if (event.data === "login_success") {
        updateUIOnSignIn();
        checkLoginStatus();
    } else if (event.data === "logout_success") {
        updateUIOnSignOut();
    }
});

// Закриття dropdownMenu при натисканні поза ним
document.addEventListener("click", function(event) {
    const dropdownMenu = document.getElementById("dropdownMenu");
    const userButton = document.getElementById("userButton");

    // Перевіряємо, чи натиснута область поза userButton і dropdownMenu
    if (!userButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", function() {
    fetch("/api/check_login")
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                loadUserDetails(); // Якщо залогінений, завантажуємо деталі користувача
            } else {
                // Якщо не залогінений, показуємо кнопку Sign In
                document.getElementById("signInBtn").style.display = "inline-block";
                document.getElementById("userMenu").style.display = "none";
            }
        });

    // Додаємо обробники для кнопок
    document.getElementById("userButton").addEventListener("click", toggleDropdown);
    document.getElementById("signOutBtn").addEventListener("click", signOut);
});

window.onload = checkLoginStatus;

$(document).ready(function() {
    // Отримуємо CSRF-токен із мета-тегу
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    // Відправка повідомлення при натисканні кнопки "Відправити"
    $("#sendbutton").click(function() {
        sendMessage();
    });
    
    // Встановлюємо початкову висоту
    const initialRows = 1;
    const maxRows = 2; // Максимальна кількість рядків, до якої розширюватиметься поле (налаштуйте за потреби)
    const lineHeight = 20; // Висота одного рядка (у пікселях, налаштуйте під ваш стиль)
    const chatlogsInitialHeight = $("#chatlogs").height(); // Початкова висота chatlogs
    let waitingForConsent = false; // Чекаємо на відповідь "так/ні"
    let waitingForDisease = false; // Чекаємо на введення хвороби
    let currentDiagnoses = []; // Зберігаємо поточні діагнози
    var check = 0;

    
    $("#inputbox").attr("rows", initialRows);

    // // Функція для автоматичного налаштування висоти
    // $("#inputbox").on("input", function() {
    // 	this.style.height = 'auto'; // Скидаємо висоту, щоб правильно обчислити нову висоту
    // 	this.style.height = this.scrollHeight + 'px'; // Змінюємо висоту відповідно до контенту

    // 	// Обмеження кількості рядків (опціонально)
    // 	const currentRows = this.value.split("\n").length;
    // 	if (currentRows > maxRows) {
    // 		this.style.overflowY = 'scroll'; // Додаємо вертикальне прокручування
    // 	} else {
    // 		this.style.overflowY = 'hidden';
    // 	}
    // });

    
    // Функція для автоматичного налаштування висоти inputbox і коригування chatlogs
    $("#inputbox").on("input", function () {
        // Скидаємо висоту перед обчисленням
        this.style.height = "auto";	

        // Обчислюємо висоту з урахуванням реального тексту
        const scrollHeight = this.scrollHeight; // Реальна висота контенту
        const newHeight = Math.min(scrollHeight, maxRows * lineHeight); // Обмежуємо висоту до maxRows

        if (check === 0) {
            this.style.height = newHeight;
        }
        else 
        this.style.height = newHeight + "px"; // Застосовуємо нову висоту

        // Обчислюємо поточну кількість рядків
        const currentRows = Math.ceil(newHeight / lineHeight);

        // Додаємо прокручування, якщо кількість рядків перевищує maxRows
        if (currentRows >= maxRows) {
            this.style.overflowY = "scroll";
        } else {
            this.style.overflowY = "hidden";

            // Зменшуємо висоту chatlogs пропорційно
            const newChatlogsHeight =
                chatlogsInitialHeight - (currentRows - initialRows) * lineHeight;

            if (newChatlogsHeight >= chatlogsInitialHeight - (maxRows - initialRows) * lineHeight) {
                $("#chatlogs").height(newChatlogsHeight);
            }
        }
    });

    $("#inputbox").keydown(function (event) {
        if (event.which === 13 && !event.shiftKey) {
            // Відправка повідомлення при Enter
            event.preventDefault(); // Запобігаємо стандартній дії Enter (новий рядок)
            sendMessage(); // Викликаємо функцію для відправки повідомлення
        } else if (event.which === 13 && event.shiftKey) {
            // Додавання нового рядка при Shift+Enter
            event.preventDefault(); // Запобігаємо стандартній дії Enter
            check = 1;
            $(this).val(function (i, value) {
                return value + "\n"; // Додаємо новий рядок
            }).trigger("input"); // Викликаємо подію input для оновлення висоти
        }
    });

    
    // Функція для відправки повідомлення
    function sendMessage() {
        var userMessage = $("#inputbox").val().trim();

        // Якщо поле введення порожнє, нічого не робити
        if (userMessage === "") return;

        // Додаємо повідомлення користувача в чат
        $("#chatlogs").append('<p class="user">' + userMessage + '</p>');

        // Очищуємо текстове поле
        $("#inputbox").val("");

        // Якщо чекаємо відповіді на питання про рекомендації
        if (waitingForConsent) {
            handleConsent(userMessage);
            return;
        }

        // Якщо чекаємо вибору хвороби для рекомендацій
        if (waitingForDisease) {
            handleDiseaseSelection(userMessage);
            return;
        }

        // Якщо це звичайний запит на діагноз
        $.ajax({
            type: "POST",
            url: "/diagnose",
            data: { symptoms: userMessage },
            headers: {
                "X-CSRFToken": csrfToken
            },
            success: function(response) {
                if (response.diagnosis === "Вибачте, діагноз не може бути встановлений на основі введених даних. Уточніть симптоми або зверніться до лікаря") {
                    $("#chatlogs").append('<p class="bot">' + response.diagnosis + '</p>');
                } else {
                    $("#chatlogs").append('<p class="bot">Ваші можливі діагнози: ' + response.diagnosis + '<br><br>Чи не бажаєте отримати рекомендації щодо лікування? (так/ні)</p>');
                    // $("#chatlogs").append('<p class="bot">Чи не бажаєте отримати рекомендації щодо лікування? (так/ні)</p>');
                    currentDiagnoses = response.diagnosis.split(', ');
                    waitingForConsent = true;
                }
                scrollToBottom();
            },
            error: function(error) {
                console.log(error);
            }
        });
    }

    // Обробка відповіді на питання про рекомендації
    function handleConsent(userMessage) {
        userMessage = userMessage.toLowerCase();
        if (userMessage === "так") {
            $("#chatlogs").append('<p class="bot">Будь ласка, напишіть назву хвороби зі списку для отримання рекомендацій.</p>');
            waitingForDisease = true;
        } else if (userMessage === "ні") {
            $("#chatlogs").append('<p class="bot">Добре, якщо потрібна допомога, пишіть!</p>');
        } else {
            $("#chatlogs").append('<p class="bot">Будь ласка, відповідайте "так" або "ні".</p>');
            return;
        }
        waitingForConsent = false;
        scrollToBottom();
    }

    // Обробка вибору хвороби для рекомендацій
    function handleDiseaseSelection(userMessage) {
        if (currentDiagnoses.includes(userMessage)) {
            $.ajax({
                type: "POST",
                url: "/recommendation",
                data: { disease: userMessage },
                headers: {
                    "X-CSRFToken": csrfToken
                },
                success: function(response) {
                    $("#chatlogs").append('<p class="bot">' + response.recommendation + '<br><br>Зверніть увагу: ці рекомендації є лише довідковими. Обов\'язково проконсультуйтеся з лікарем!</p>');
                    scrollToBottom();
                },
                error: function(error) {
                    console.log(error);
                }
            });
            waitingForDisease = false;
        } else {
            $("#chatlogs").append('<p class="bot">Будь ласка, виберіть хворобу зі списку: ' + currentDiagnoses.join(', ') + '</p>');
            scrollToBottom();
        }
    }

    // Функція для автоматичної прокрутки чату вниз
    function scrollToBottom() {
        var chatlogs = document.getElementById("chatlogs");
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }
});