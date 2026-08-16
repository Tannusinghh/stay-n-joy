# AirBnB Project

![AirBnB Project](logo.png)

## Overview

The AirBnB Project is a comprehensive web application that replicates core functionalities of the popular AirBnB platform. This project showcases advanced features such as user authentication, listing management, and booking functionalities, implemented with robust error handling and validations both on the client and server sides.

## Features

- **User Authentication**: Secure login and registration system.
- **Listing Management**: Users can create, edit, and delete property listings.
- **Booking System**: Users can book listings and manage their bookings.
- **Error Handling**: Comprehensive error handling across the application.
- **Validation**: Input validations both on the client and server sides.
- **Responsive Design**: Ensures usability across different devices.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing listings and user data.
- **Joi**: Data validation library.
- **Bootstrap**: CSS framework for responsive design.

## Project Structure

AirBnB-Project/
├── .github/
│ └── workflows/
│ └── jekyll-gh-pages.yml
├── .vscode/
│ └── launch.json
├── ExpressError/
│ └── ExpressError.js
├── models/
│ ├── random_gen_data/
│ │ └── data.js
│ └── staynenjoy_schema.js
├── node_modules/ # Project dependencies
├── views/
│ ├── includes/
│ │ └── footer.ejs
│ ├── layouts/
│ │ └── boilerplate.ejs
│ ├── edit_hotels.ejs
│ ├── error.ejs
│ └── index.ejs
├── public/
│ ├── css/
│ │ └── main.css
│ └── scripts/
│ └── main.js
├── .env # Environment variables
├── .gitignore # Git ignore file
├── app.js # Main application file
├── package-lock.json # Lock file for dependencies
├── package.json # Project metadata and dependencies
└── schema.js # Joi validation schemas


## Description of Directories and Files

- **.github/workflows**: Contains GitHub Actions workflows for CI/CD.
- **.vscode**: Contains settings and configurations for Visual Studio Code.
- **ExpressError**: Custom error handling middleware.
- **models**: Contains Mongoose schemas and data generation scripts.
- **node_modules**: Contains all the npm packages used in the project.
- **views**: EJS templates for rendering the HTML pages.
  - **includes**: Common EJS partials such as footer.
  - **layouts**: Layout templates for the application.
  - **edit_hotels.ejs**: Template for editing hotel listings.
  - **error.ejs**: Error page template.
  - **index.ejs**: Main index page template.
- **public**: Contains static assets such as CSS and JavaScript files.
  - **css**: Custom CSS files for styling.
  - **scripts**: Custom JavaScript files.
- **.env**: Environment variables for configuration.
- **.gitignore**: Specifies which files and directories to ignore in the repository.
- **app.js**: Entry point of the application, contains the main logic.
- **package-lock.json**: Automatically generated file that describes the exact tree of dependencies.
- **package.json**: Lists the project’s dependencies and other metadata.
- **schema.js**: Joi validation schemas for request validation.

This structure ensures a clear separation of concerns, making the project maintainable and scalable.


## Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-username/AirBnB-Project.git
   cd AirBnB-Project
   npm install
   node app.js

Contact
Vitthal Bissa - vishubissa.s@gmail.com

Project Link: https://airbnb-project-2sm6.onrender.com/listings 
if it doesnt work wait 2-3min and then reload the page
