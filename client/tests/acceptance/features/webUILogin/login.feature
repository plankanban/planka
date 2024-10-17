Feature: login
    As a user
    I want to log in
    So that I can manage project

    Scenario: User logs in with valid credentials
        Given user has browsed to the login page
        When user logs in with email "demo@demo.demo" and password "demo" using the webUI
        Then the user should be in the dashboard page