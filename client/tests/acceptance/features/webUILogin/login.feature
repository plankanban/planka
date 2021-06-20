Feature: login

    Scenario: valid user logs in
        Given user has browsed to the login page
        When user logs in with username "demo@demo.demo" and password "demo"
        Then user should be in dashboard page