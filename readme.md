# Менеджер объявлений

## Запуск проекта

```
docker-compose up --build
```

После этого:

- Бэкенд работает по адресу http://127.0.0.1:3001.
- Фронтенд работает по адресу http://127.0.0.1:5173.

В данном проекте используются:

- Vite для более быстрой сборки и удобной разработки со встроенным сборщиком bandler(ESBuild)
- emotion/styled для установки стилей компонентам непосредственно в javascript коде
- ESLint для предотвращения ошибок до сборки и деплоя
- MUI для готовых UI компонентов
- SASS как препроцессор для увеличения возможностей css

- Главная страница — Список объявлений (/list)
  - Отображение списка объявлений в виде карточек
    <img width="1441" height="640" alt="изображение" src="https://github.com/user-attachments/assets/30d1957e-5b23-4b7b-a4d9-c81d0ee52604" />
  - Отображение списка объявлений в виде таблицы
    <img width="1347" height="630" alt="изображение" src="https://github.com/user-attachments/assets/203ebd9b-d0d5-4ebb-bad3-6cdb4178b6ff" />
  - Фильтрация и поиск:
    <img width="1353" height="308" alt="изображение" src="https://github.com/user-attachments/assets/91dfb924-44cd-4a80-be0b-414cbee04fbb" />
  - Пагинация:
    <img width="368" height="75" alt="изображение" src="https://github.com/user-attachments/assets/e434020d-b96b-44bd-ad7a-62d0b72dec38" />

- Страница детального просмотра объявления (/item/:id)
  - Панель действий модератора:
    <img width="1432" height="772" alt="изображение" src="https://github.com/user-attachments/assets/cf5d1b16-4b5e-4b86-a420-560ed733c8ee" />
  - Модальное окно
    <img width="807" height="639" alt="изображение" src="https://github.com/user-attachments/assets/b7e4f012-8be8-4586-aa1b-1b927d63e944" />
  - История
    <img width="1156" height="817" alt="изображение" src="https://github.com/user-attachments/assets/407772e6-952f-4b27-b742-bbafdd2593ba" />


- Страница статистики модератора (/stats)
  - Общая статистика и графики:
    <img width="1920" height="926" alt="изображение" src="https://github.com/user-attachments/assets/e6f7fe20-9c6a-4e2e-baee-2642d59286dd" />
