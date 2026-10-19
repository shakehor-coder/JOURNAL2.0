# 🌐 Руководство по бесплатному размещению Journal 2.0 на сервере

Данный проект уже полностью подготовлен к бесплатному запуску на облачных сервисах с автоматической поддержкой **WebSockets (Socket.io)**, **WebRTC (видеозвонки)** и **HTTPS** (необходим браузерам для доступа к камере и микрофону).

---

## 🥇 Вариант 1 (Рекомендуемый): Размещение на Render.com (Бесплатно)

**Render** — лучший бесплатный облачный хостинг для этого проекта, потому что он бесплатно предоставляет постоянный URL с **HTTPS/SSL** (без которого современные браузеры блокируют камеру и микрофон на внешних сайтах) и полную поддержку **WebSockets**.

### Пошаговая инструкция:

1. **Загрузите проект на GitHub**:
   - Создайте новый публичный или приватный репозиторий на [github.com](https://github.com) (например, `journal-top-academy`).
   - Инициализируйте git и отправьте код в репозиторий:
     ```bash
     git init
     git add .
     git commit -m "Initial commit Journal 2.0"
     git branch -M main
     git remote add origin https://github.com/<ВАШ_АККАУНТ>/journal-top-academy.git
     git push -u origin main
     ```

2. **Зарегистрируйтесь на Render**:
   - Перейдите на [render.com](https://render.com) и войдите через свой аккаунт GitHub.

3. **Создайте Web Service**:
   - Нажмите синюю кнопку **«New +»** в правом верхнем углу и выберите **«Web Service»**.
   - Выберите ваш репозиторий `journal-top-academy`.
   - Заполните параметры (большинство определится автоматически):
     - **Name**: `journal-top-academy` (или любое другое)
     - **Region**: `Frankfurt (EU)` (ближе всего к РФ/СНГ)
     - **Branch**: `main`
     - **Runtime**: `Node`
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free` ($0/month)
   - Нажмите **«Deploy Web Service»**.

4. **Готово!**
   - Через 2–3 минуты Render скомпилирует клиент и запустит сервер.
   - Вы получите готовую ссылку вида: `https://journal-top-academy.onrender.com`
   - Откройте её с компьютера или смартфона — всё будет работать из коробки, включая WebRTC-звонки и доску.

---

## 🥈 Вариант 2: Размещение на Koyeb или Railway (через Docker или Git)

Проект содержит готовый файл `Dockerfile`. Если вы предпочитаете Railway или Koyeb:

1. **Koyeb (Бесплатный тариф Nano)**:
   - Зарегистрируйтесь на [koyeb.com](https://koyeb.com).
   - Создайте **New Service** -> подключите репозиторий GitHub.
   - Выберите тип сборки **Dockerfile** или **Buildpack** (порт: `5000`).
   - Сервис запустится с бесплатным HTTPS доменом.

2. **Railway**:
   - Зарегистрируйтесь на [railway.app](https://railway.app).
   - Создайте **New Project** -> **Deploy from GitHub repo**.
   - Railway автоматически распознает `package.json` или `Dockerfile`.
   - В настройках сервиса (Settings -> Networking) нажмите **Generate Domain**.

---

## 💻 Локальный запуск (для тестирования на компьютере)

### В один клик:
- Дважды кликните по файлу **`run.bat`** (запустит production-сборку на http://localhost:5000).
- Или по файлу **`dev.bat`** (запустит режим разработки с горячей перезагрузкой на Vite порту 3000 и бэкенде 5000).

### Через терминал:
```bash
# Установка и сборка всего проекта:
npm run build

# Запуск сервера:
npm start
```
Сервер будет доступен по адресу: **http://localhost:5000**
