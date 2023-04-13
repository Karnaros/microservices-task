<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Описание

Учебный проект из курса обучения Backend разработке на node.js.

Проект посвящен изучению микросервисной структуры сервера на основе NestJS микросервисов. В качестве брокера сообщений используется RabbitMQ.

Также в проекте изучаются возможности unit-тестирования с помощью Jest и использование Docker контейнеров.

## Настройка

Все необходимые переменные окружения (примеры даны в файлах ".env.template") должны быть указаны в .env файлах, расположенных в корне проекта, а также в директориях каждого микросервиса.

Для развертки всех необходимых зависимостей:
```bash
$ npm install
```

Запуск unit тестов:
```bash
#Все тесты
$ npm run test

#Отдельный тест
$ npm run test <Имя тестового файла>
```

Сборка и запуск приложения в Docker контейнерах осуществляется командами:

```bash
#Создание необходимых docker образов
$ docker-compose build

#Запуск контейнеров с приложением
$ docker-compose up
```
