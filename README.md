# fp-backend

A REST API project for testing functional programming capabilities in TypeScript.

## Stack
* Docker 2 / Docker-Compose 3
* MySQL 8
* Node.JS 13
* TypeScript 4

## Functional Programming Concepts

### Effects and Side Effects
Taking this project as the context, I would define _effectful functions_ as functions that:
* produce no _side effects_ (access global variables, mutate entry parameters, change I/O, throw exceptions etc.),
* have only one single _main effect_ - they either return a function or an object.

Functions with side effects would be functions that are not `effectful`.

The aforementioned division allows me to split the projects into two classes of functionality:
* functions that can be safely and fully tested because of their predictability,
* functions that explicitly connect to the outside world.

### TaskEither
The most fundamental structure in this project is `TaskEither<E, A>` which is a composition of two types:
* `Task<R>` - an FP type representing a result of type `R` of a non-throwing asynchronous operation,
* `Either<E, A>` - an FP union type representing either an error of a type `E` or a value of type `A`.

As most of our operations are asynchronous and may fail, we need to use `TaskEither` as the return type from functions that communicate with the outside world.

I decided to represent the error type as `string` for convenience's sake.

## Install and Run

    docker network create fp-local-network
    docker-compose up --build
