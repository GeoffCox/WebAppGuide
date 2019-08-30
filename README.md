# Overview
This is a step-by-step guide to building modern web applications.

Web applications rely heavily on the Node Package Manager (NPM).  NPM is wonderful.  It gives you access to tens of thousands of packages containing useful code and tools
 
However, cost is figuring out how to connect all these disparate, ever-changing pieces into a running and manageable application.

I've provided completed examples with instructions for every single thing I did to create the applications.

* [React Web Application](react-web-app/Instructions.md)
* [Electron/React Web Application](electron-react-web-app/Instructions.md)


 # Technology Choices
These are my current technology choices for building web applications.  There are multiple languages, frameworks, and tools to choose from and each have their pros & cons. We could debate the choices forever, so let's forgo that.  
 
Instead, here is how I evaluated and selected the technologies:

* **Productivity** It lets me create the UI and functionality I want with minimal ceremony. The inner dev loops is fast and I can leverage and IDE for coding and debugging.
* **Encapsulation & Abstraction** It allows me to create components with clear contracts. I can architect the application and implement the architecture without undue compromise.
* **Maintainability**  It lets me manage dependencies, environments, and configuration without 'DLL hell'.  The technologies tend to work well together.
* **Unopinionated Libraries** It lets me choose from a vast set of libraries so I don't have to implement everything from scratch.  Frameworks support me without undue constraint on customization or special scenarios.

# Technology Stack

## [NPM](https://www.npmjs.com/)
Node Package Manager (NPM) is the defacto package manager for web projects. 

Note: I sometimes use yarn](https://yarnpkg.com/en/) (and do on many projects), but wanted to keep things as simple as possible for this guide.

## [Typescript](http://www.typescriptlang.org)
Typescript provides compile-time type safety and emits well-formed Javascript code.

## [React](https://reactjs.org/)
A lightweight UI framework that provides functional composition of UI components. Works well with Typescript via TSX to support mixing HTML and code.

## [Webpack](https://webpack.js.org/)
A simple build tool that lets you compose a series of plug-ins to generate code, compile, bundle and minify, and provide debug source maps. Plug-ins are very powerful and relatively easy to configure.

## [Hot Module Reloading](https://www.npmjs.com/package/webpack-hot-middleware)
By using the express web server and some webpack middleware, HMR allows the application to refresh when code changes without restarting the application. Painful to configure at first, but pays you back in the long run.




