Feature: dashboard
    As a admin
    I want to create a project
    So that I can manage project

    Background:
        Given user has browsed to the login page
        And user has logged in with email "demo@demo.demo" and password "demo"

    Scenario: create a new project
        When the user creates a project with name "testproject" using the webUI
        Then the created project "testproject" should be opened
