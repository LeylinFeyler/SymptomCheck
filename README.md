### **README.md для проєкту "SymptomCheck"**

---

# SymptomCheck 🩺  
**SymptomCheck** – це веб-додаток, що визначає можливі діагнози на основі введених користувачем симптомів. Система обробляє дані за допомогою алгоритму порівняння симптомів із попередньо підготовленим набором захворювань та їх характеристик.

---

## **Функціональність** 🌟

- **Введення симптомів**: Користувач вводить свої симптоми у вигляді тексту.
- **Пошук діагнозу**: Додаток обробляє введені дані та надає список можливих діагнозів.
- **Підтримка рекомендацій**: За запитом користувача програма надає прості рекомендації для лікування конкретного захворювання.
- **Історія чату**: Всі повідомлення користувача та відповіді зберігаються в базі даних.
- **Безпека**: Чутливі дані, такі як конфіденційні ключі, зберігаються через змінні середовища.

---

## **Використані технології** 🛠️

- **Back-end**: Python (Flask)
- **Front-end**: HTML, CSS, JavaScript (AJAX для обміну даними з сервером)
- **База даних**: PostgreSQL
- **Авторизація**: Google OAuth 2.0
- **Зберігання конфіденційних даних**: Змінні середовища `.env`
- **Система контролю версій**: Git та GitHub

---

## **Як користуватися додатком** 💡

1. **Введіть симптоми** у текстове поле чату (наприклад: *кашель, нежить*).
2. Програма запропонує **можливі діагнози**.
3. Після цього можна отримати **рекомендації для лікування** обраного діагнозу.
4. Уся ваша історія чату зберігається для подальшого використання.

---

## **Безпека** 🔒

- Використовується **Google OAuth 2.0** для авторизації.
- Чутливі дані зберігаються у змінних середовища.
- Дані користувачів захищені шифруванням.
- Реалізовано **розмежування прав доступу** до бази даних.

---

## **Плани на майбутнє** 🛠️
- Додати більше функцій для аналізу симптомів за допомогою машинного навчання.
- Покращити інтерфейс користувача.
- Реалізувати можливість додавання користувачем власних симптомів та діагнозів.

---

## **Автор** 👤
**Волощук Владислав**
